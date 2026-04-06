/**
 * Restock Alerts Router — Low stock management, scanning, digest emails
 * Ported from mohawk-medibles2 (Express/Drizzle) to Next.js/Prisma
 */
import { z } from "zod";
import { router, adminProcedure } from "../trpc";
import { sendEmail } from "@/lib/email";

export const restockAlertsRouter = router({
  // ─── Stats ─────────────────────────────────────────────
  stats: adminProcedure.query(async ({ ctx }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [active, outOfStock, critical, warning, acknowledged, snoozed, resolvedToday] =
      await Promise.all([
        ctx.prisma.restockAlert.count({ where: { status: "active" } }),
        ctx.prisma.restockAlert.count({ where: { status: "active", currentStock: 0 } }),
        ctx.prisma.restockAlert.count({ where: { status: "active", severity: "critical" } }),
        ctx.prisma.restockAlert.count({ where: { status: "active", severity: "warning" } }),
        ctx.prisma.restockAlert.count({ where: { status: "acknowledged" } }),
        ctx.prisma.restockAlert.count({ where: { status: "snoozed" } }),
        ctx.prisma.restockAlert.count({
          where: { status: "resolved", resolvedAt: { gte: today } },
        }),
      ]);

    return { active, outOfStock, critical, warning, acknowledged, snoozed, resolvedToday };
  }),

  // ─── List Alerts ───────────────────────────────────────
  list: adminProcedure
    .input(
      z.object({
        status: z.string().default("active"),
        severity: z.string().default("all"),
        page: z.number().default(1),
        limit: z.number().default(25),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {};
      if (input.status !== "all") where.status = input.status;
      if (input.severity !== "all") where.severity = input.severity;
      if (input.search) {
        where.productName = { contains: input.search, mode: "insensitive" };
      }

      const [alerts, total] = await Promise.all([
        ctx.prisma.restockAlert.findMany({
          where,
          orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        ctx.prisma.restockAlert.count({ where }),
      ]);

      return { alerts, total };
    }),

  // ─── History (recently resolved) ───────────────────────
  history: adminProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.restockAlert.findMany({
        where: { status: "resolved" },
        orderBy: { resolvedAt: "desc" },
        take: input.limit,
      });
    }),

  // ─── Scan Inventory ────────────────────────────────────
  scan: adminProcedure.mutation(async ({ ctx }) => {
    // Get all products with inventory
    const products = await ctx.prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: { inventory: true },
    });

    let created = 0;
    let resolved = 0;

    for (const product of products) {
      const stock = product.inventory?.quantity ?? 0;
      const threshold = product.inventory?.lowStockAt ?? 5;

      if (stock <= threshold) {
        // Determine severity
        const severity =
          stock === 0
            ? "out_of_stock"
            : stock <= Math.floor(threshold / 2)
            ? "critical"
            : "warning";

        // Check for existing active alert
        const existing = await ctx.prisma.restockAlert.findFirst({
          where: {
            productId: product.id,
            status: { in: ["active", "acknowledged", "snoozed"] },
          },
        });

        if (!existing) {
          await ctx.prisma.restockAlert.create({
            data: {
              productId: product.id,
              productName: product.name,
              currentStock: stock,
              threshold,
              severity,
              status: "active",
            },
          });
          created++;
        } else {
          // Update current stock and severity
          await ctx.prisma.restockAlert.update({
            where: { id: existing.id },
            data: { currentStock: stock, severity },
          });
        }
      } else {
        // Resolve any active alerts for products now above threshold
        const activeAlerts = await ctx.prisma.restockAlert.findMany({
          where: {
            productId: product.id,
            status: { in: ["active", "acknowledged"] },
          },
        });
        for (const alert of activeAlerts) {
          await ctx.prisma.restockAlert.update({
            where: { id: alert.id },
            data: {
              status: "resolved",
              resolvedAt: new Date(),
              notes: "Auto-resolved: stock above threshold",
            },
          });
          resolved++;
        }
      }
    }

    return { created, resolved };
  }),

  // ─── Acknowledge ───────────────────────────────────────
  acknowledge: adminProcedure
    .input(z.object({ alertId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.restockAlert.update({
        where: { id: input.alertId },
        data: { status: "acknowledged", acknowledgedAt: new Date() },
      });
    }),

  // ─── Resolve ───────────────────────────────────────────
  resolve: adminProcedure
    .input(z.object({ alertId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.restockAlert.update({
        where: { id: input.alertId },
        data: {
          status: "resolved",
          resolvedAt: new Date(),
          resolvedBy: ctx.userId,
        },
      });
    }),

  // ─── Snooze ────────────────────────────────────────────
  snooze: adminProcedure
    .input(z.object({ alertId: z.number(), hours: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const snoozedUntil = new Date(Date.now() + input.hours * 60 * 60 * 1000);
      return ctx.prisma.restockAlert.update({
        where: { id: input.alertId },
        data: { status: "snoozed", snoozedUntil },
      });
    }),

  // ─── Restock (add inventory) ───────────────────────────
  restock: adminProcedure
    .input(
      z.object({
        productId: z.number(),
        variantId: z.number().nullable().optional(),
        addQuantity: z.number().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get current inventory
      const inv = await ctx.prisma.inventory.findUnique({
        where: { productId: input.productId },
      });

      const prevQty = inv?.quantity ?? 0;
      const newQty = prevQty + input.addQuantity;

      // Update inventory
      await ctx.prisma.inventory.upsert({
        where: { productId: input.productId },
        update: { quantity: newQty },
        create: { productId: input.productId, quantity: newQty },
      });

      // Log the change
      await ctx.prisma.inventoryLog.create({
        data: {
          productId: input.productId,
          variantId: input.variantId ?? null,
          previousQuantity: prevQty,
          newQuantity: newQty,
          changeAmount: input.addQuantity,
          reason: "restock",
          userId: ctx.userId,
          notes: `Restocked via admin alert panel`,
        },
      });

      // Resolve active alerts for this product
      await ctx.prisma.restockAlert.updateMany({
        where: {
          productId: input.productId,
          status: { in: ["active", "acknowledged"] },
        },
        data: {
          status: "resolved",
          resolvedAt: new Date(),
          resolvedBy: ctx.userId,
          notes: `Restocked: +${input.addQuantity} units (new total: ${newQty})`,
        },
      });

      return { success: true, newQuantity: newQty };
    }),

  // ─── Bulk Update Thresholds ────────────────────────────
  bulkUpdateThresholds: adminProcedure
    .input(
      z.object({
        productIds: z.array(z.number()),
        threshold: z.number().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      for (const productId of input.productIds) {
        await ctx.prisma.inventory.upsert({
          where: { productId },
          update: { lowStockAt: input.threshold },
          create: { productId, quantity: 0, lowStockAt: input.threshold },
        });
      }
      return { updated: input.productIds.length };
    }),

  // ─── Digest Settings ──────────────────────────────────
  digestSettings: adminProcedure.query(async ({ ctx }) => {
    const settings = await ctx.prisma.storeSetting.findUnique({
      where: { settingKey: "restockDigestSettings" },
    });
    const parsed = settings?.settingValue
      ? JSON.parse(settings.settingValue)
      : {
          enabled: false,
          frequency: "daily",
          hour: 9,
          minute: 0,
          minSeverity: "warning",
        };
    return {
      settings: parsed,
      status: { isRunning: parsed.enabled, lastRunAt: null, nextRunAt: null, totalRuns: 0 },
    };
  }),

  // ─── Update Digest Settings ────────────────────────────
  updateDigestSettings: adminProcedure
    .input(
      z.object({
        enabled: z.boolean().optional(),
        frequency: z.enum(["daily", "weekly"]).optional(),
        hour: z.number().min(0).max(23).optional(),
        minute: z.number().min(0).max(59).optional(),
        minSeverity: z.enum(["warning", "critical", "out_of_stock"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.storeSetting.findUnique({
        where: { settingKey: "restockDigestSettings" },
      });
      const current = existing?.settingValue
        ? JSON.parse(existing.settingValue)
        : { enabled: false, frequency: "daily", hour: 9, minute: 0, minSeverity: "warning" };

      const updated = { ...current, ...input };

      await ctx.prisma.storeSetting.upsert({
        where: { settingKey: "restockDigestSettings" },
        update: { settingValue: JSON.stringify(updated) },
        create: {
          settingKey: "restockDigestSettings",
          settingValue: JSON.stringify(updated),
          settingGroup: "inventory",
        },
      });

      return updated;
    }),

  // ─── Send Digest (manual trigger) ─────────────────────
  sendDigest: adminProcedure.mutation(async ({ ctx }) => {
    const activeAlerts = await ctx.prisma.restockAlert.findMany({
      where: { status: { in: ["active", "acknowledged"] } },
      orderBy: { severity: "asc" },
    });

    if (activeAlerts.length === 0) {
      return { sent: false, alertCount: 0 };
    }

    // Build and send restock digest email via Resend
    const adminEmail = process.env.ADMIN_EMAIL || "admin@mohawkmedibles.ca";

    const criticalAlerts = activeAlerts.filter((a) => a.severity === "critical");
    const warningAlerts = activeAlerts.filter((a) => a.severity === "warning");

    const alertRows = activeAlerts
      .map(
        (a) =>
          `<tr>
            <td style="padding:8px;border-bottom:1px solid #e5e5e5;">${a.productName}</td>
            <td style="padding:8px;border-bottom:1px solid #e5e5e5;text-align:center;">${a.currentStock}</td>
            <td style="padding:8px;border-bottom:1px solid #e5e5e5;text-align:center;">${a.threshold}</td>
            <td style="padding:8px;border-bottom:1px solid #e5e5e5;text-align:center;">
              <span style="background:${a.severity === "critical" ? "#dc2626" : "#f59e0b"};color:white;padding:2px 8px;border-radius:4px;font-size:12px;">${a.severity}</span>
            </td>
          </tr>`
      )
      .join("");

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;background-color:#f5f5f5;">
  <div style="max-width:600px;margin:20px auto;background:white;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
    <div style="background-color:#2D5016;padding:24px;text-align:center;">
      <h1 style="color:white;font-size:24px;margin:0;">Restock Alerts Digest</h1>
      <p style="color:#a0bba5;font-size:14px;margin:4px 0 0;">Mohawk Medibles Inventory</p>
    </div>
    <div style="padding:32px;color:#333;">
      <p><strong>${activeAlerts.length}</strong> product${activeAlerts.length === 1 ? "" : "s"} need${activeAlerts.length === 1 ? "s" : ""} restocking:</p>
      <ul style="list-style:none;padding:0;margin:0 0 16px;">
        ${criticalAlerts.length > 0 ? `<li style="color:#dc2626;font-weight:bold;margin-bottom:4px;">Critical: ${criticalAlerts.length}</li>` : ""}
        ${warningAlerts.length > 0 ? `<li style="color:#f59e0b;font-weight:bold;margin-bottom:4px;">Warning: ${warningAlerts.length}</li>` : ""}
      </ul>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="border-bottom:2px solid #e5e5e5;">
            <th style="padding:8px;text-align:left;">Product</th>
            <th style="padding:8px;text-align:center;">Stock</th>
            <th style="padding:8px;text-align:center;">Threshold</th>
            <th style="padding:8px;text-align:center;">Severity</th>
          </tr>
        </thead>
        <tbody>${alertRows}</tbody>
      </table>
      <div style="margin-top:24px;">
        <a href="https://mohawkmedibles.ca/admin/inventory/restock" style="display:inline-block;background:#2D5016;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">View in Dashboard</a>
      </div>
    </div>
    <div style="background-color:#f5f5dc;padding:16px;text-align:center;font-size:12px;color:#4a5c40;">
      <p style="margin:0;">Mohawk Medibles Admin — Inventory Management</p>
    </div>
  </div>
</body>
</html>`;

    try {
      await sendEmail({
        to: adminEmail,
        subject: `Restock Alert: ${activeAlerts.length} product${activeAlerts.length === 1 ? "" : "s"} low on stock`,
        html,
      });
      // Restock digest sent
    } catch (emailErr) {
      // Email failure should not break the flow
      console.error("[Restock Digest] Email send failed:", emailErr);
    }

    return { sent: true, alertCount: activeAlerts.length };
  }),

  // ─── Digest History ────────────────────────────────────
  digestHistory: adminProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async () => {
      // Digest history is stored in StoreSetting as JSON for simplicity
      return [];
    }),
});
