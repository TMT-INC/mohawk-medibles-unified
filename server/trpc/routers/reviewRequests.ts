/**
 * Review Requests Router — Automated review solicitation management
 * Ported from mohawk-medibles2 (Express/Drizzle) to Next.js/Prisma
 */
import { z } from "zod";
import { router, adminProcedure } from "../trpc";
import { sendReviewRequestEmail } from "@/lib/email";

export const reviewRequestsRouter = router({
  // ─── Settings ──────────────────────────────────────────
  getSettings: adminProcedure.query(async ({ ctx }) => {
    const setting = await ctx.prisma.storeSetting.findUnique({
      where: { settingKey: "reviewRequestSettings" },
    });
    return setting?.settingValue
      ? JSON.parse(setting.settingValue)
      : { enabled: true, delayDays: 7, maxRequestsPerOrder: 1 };
  }),

  updateSettings: adminProcedure
    .input(
      z.object({
        enabled: z.boolean().optional(),
        delayDays: z.number().min(1).max(30).optional(),
        maxRequestsPerOrder: z.number().min(1).max(5).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.storeSetting.findUnique({
        where: { settingKey: "reviewRequestSettings" },
      });
      const current = existing?.settingValue
        ? JSON.parse(existing.settingValue)
        : { enabled: true, delayDays: 7, maxRequestsPerOrder: 1 };

      const updated = { ...current, ...input };

      await ctx.prisma.storeSetting.upsert({
        where: { settingKey: "reviewRequestSettings" },
        update: { settingValue: JSON.stringify(updated) },
        create: {
          settingKey: "reviewRequestSettings",
          settingValue: JSON.stringify(updated),
          settingGroup: "reviews",
        },
      });

      return updated;
    }),

  // ─── Stats ─────────────────────────────────────────────
  stats: adminProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalSent, sentThisWeek, sentThisMonth, pendingOrders] = await Promise.all([
      ctx.prisma.reviewRequest.count({ where: { status: "sent" } }),
      ctx.prisma.reviewRequest.count({
        where: { status: "sent", sentAt: { gte: weekAgo } },
      }),
      ctx.prisma.reviewRequest.count({
        where: { status: "sent", sentAt: { gte: monthAgo } },
      }),
      ctx.prisma.order.count({
        where: {
          status: { in: ["DELIVERED", "COMPLETED"] },
          deliveredAt: { not: null },
        },
      }),
    ]);

    return { totalSent, sentThisWeek, sentThisMonth, pendingOrders };
  }),

  // ─── List Recent Requests ──────────────────────────────
  list: adminProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      const requests = await ctx.prisma.reviewRequest.findMany({
        where: { status: "sent" },
        orderBy: { sentAt: "desc" },
        take: input.limit,
        include: {
          user: { select: { name: true, email: true } },
          product: { select: { name: true } },
        },
      });

      return requests.map((r) => ({
        customerName: r.user.name,
        customerEmail: r.user.email,
        orderId: r.orderId,
        productNames: [r.product.name],
        sentAt: r.sentAt,
        status: r.status,
      }));
    }),

  // ─── Trigger Now (manual send) ─────────────────────────
  triggerNow: adminProcedure.mutation(async ({ ctx }) => {
    const settingRow = await ctx.prisma.storeSetting.findUnique({
      where: { settingKey: "reviewRequestSettings" },
    });
    const settings = settingRow?.settingValue
      ? JSON.parse(settingRow.settingValue)
      : { enabled: true, delayDays: 7, maxRequestsPerOrder: 1 };

    const delayMs = (settings.delayDays || 7) * 24 * 60 * 60 * 1000;
    const cutoffDate = new Date(Date.now() - delayMs);
    const maxAge = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const deliveredOrders = await ctx.prisma.order.findMany({
      where: {
        status: { in: ["DELIVERED", "COMPLETED"] },
        deliveredAt: { gte: maxAge, lte: cutoffDate },
      },
      include: {
        user: { select: { id: true, email: true, name: true } },
        items: { select: { productId: true, name: true } },
      },
      take: 50,
    });

    let sent = 0;
    let errors = 0;

    for (const order of deliveredOrders) {
      if (!order.user?.email) continue;

      for (const item of order.items) {
        try {
          const existing = await ctx.prisma.reviewRequest.findFirst({
            where: {
              userId: order.userId,
              orderId: order.id,
              productId: item.productId,
            },
          });

          if (existing) continue;

          const existingReview = await ctx.prisma.review.findFirst({
            where: { userId: order.userId, productId: item.productId },
          });

          if (existingReview) continue;

          await ctx.prisma.reviewRequest.create({
            data: {
              userId: order.userId,
              orderId: order.id,
              productId: item.productId,
              status: "sent",
              sentAt: new Date(),
            },
          });

          // Send review request email via Resend
          try {
            const product = await ctx.prisma.product.findUnique({
              where: { id: item.productId },
              select: { slug: true },
            });
            const productSlug = product?.slug || item.productId.toString();

            await sendReviewRequestEmail(order.user.email!, {
              customerName: order.user.name || "Valued Customer",
              productName: item.name,
              productSlug,
              orderNumber: order.orderNumber || order.id.toString(),
            });
            // Sent review request email
          } catch (emailErr) {
            // Email failure should not break the flow
            console.error("[Review Request] Email send failed:", emailErr);
          }
          sent++;
        } catch (err) {
          errors++;
          console.error("[Review Request] Error:", err);
        }
      }
    }

    return { sent, errors };
  }),
});
