/**
 * POS Router — Point of Sale operations
 * Ported from command center: server/routers/pos/posRouter.ts
 */
import { z } from "zod";
import { router, adminProcedure, protectedProcedure } from "../trpc";

export const posRouter = router({
  // ─── Transactions ───────────────────────────────────────
  createTransaction: adminProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.number().optional(),
            productName: z.string(),
            productCategory: z.string(),
            unitPrice: z.number(),
            quantity: z.number().min(1),
            discountAmount: z.number().default(0),
          })
        ),
        paymentMethod: z.enum(["cash", "debit", "credit", "split"]),
        cashGiven: z.number().optional(),
        cashierId: z.number().optional(),
        customerId: z.string().optional(),
        loyaltyPointsRedeemed: z.number().default(0),
        discountType: z.string().optional(),
        discountAmount: z.number().default(0),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const subtotal = input.items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity - item.discountAmount,
        0
      );
      const total = subtotal - input.discountAmount;
      const txnId = `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

      const transaction = await ctx.prisma.posTransaction.create({
        data: {
          txnId,
          total,
          subtotal,
          discountAmount: input.discountAmount,
          discountType: input.discountType,
          paymentMethod: input.paymentMethod,
          cashGiven: input.cashGiven,
          changeDue: input.cashGiven ? input.cashGiven - total : undefined,
          itemCount: input.items.length,
          cashierId: input.cashierId,
          customerId: input.customerId,
          loyaltyPointsRedeemed: input.loyaltyPointsRedeemed,
          loyaltyPointsEarned: Math.floor(total),
          notes: input.notes,
          items: {
            create: input.items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              productCategory: item.productCategory,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              lineTotal: item.unitPrice * item.quantity - item.discountAmount,
              discountAmount: item.discountAmount,
            })),
          },
        },
        include: { items: true },
      });

      return transaction;
    }),

  listTransactions: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {};
      if (input.startDate || input.endDate) {
        where.createdAt = {};
        if (input.startDate) (where.createdAt as Record<string, unknown>).gte = new Date(input.startDate);
        if (input.endDate) (where.createdAt as Record<string, unknown>).lte = new Date(input.endDate);
      }

      const transactions = await ctx.prisma.posTransaction.findMany({
        where,
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: { items: true, cashier: true },
      });

      let nextCursor: number | undefined;
      if (transactions.length > input.limit) {
        const next = transactions.pop();
        nextCursor = next?.id;
      }

      return { transactions, nextCursor };
    }),

  // ─── Shifts ─────────────────────────────────────────────
  clockIn: adminProcedure
    .input(z.object({ employeeId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.posShift.create({
        data: { employeeId: input.employeeId },
      });
    }),

  clockOut: adminProcedure
    .input(z.object({ shiftId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.posShift.update({
        where: { id: input.shiftId },
        data: { clockOut: new Date(), status: "completed" },
      });
    }),

  // ─── Cash Drawer ────────────────────────────────────────
  openDrawer: adminProcedure
    .input(
      z.object({
        employeeId: z.number(),
        openingFloat: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.posCashDrawer.create({
        data: {
          employeeId: input.employeeId,
          openingFloat: input.openingFloat,
        },
      });
    }),

  closeDrawer: adminProcedure
    .input(
      z.object({
        drawerId: z.number(),
        closingAmount: z.number(),
        expectedAmount: z.number(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.posCashDrawer.update({
        where: { id: input.drawerId },
        data: {
          closingAmount: input.closingAmount,
          expectedAmount: input.expectedAmount,
          difference: input.closingAmount - input.expectedAmount,
          status: "closed",
          closedAt: new Date(),
          notes: input.notes,
        },
      });
    }),

  // ─── Employees ──────────────────────────────────────────
  listEmployees: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.posEmployee.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });
  }),

  // ─── Daily Summary ─────────────────────────────────────
  dailySummary: adminProcedure
    .input(z.object({ date: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const targetDate = input.date ? new Date(input.date) : new Date();
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      const transactions = await ctx.prisma.posTransaction.findMany({
        where: {
          createdAt: { gte: startOfDay, lte: endOfDay },
        },
      });

      return {
        date: startOfDay.toISOString().split("T")[0],
        totalTransactions: transactions.length,
        totalRevenue: transactions.reduce((sum: number, t: { total: number }) => sum + t.total, 0),
        avgTransactionValue:
          transactions.length > 0
            ? transactions.reduce((sum: number, t: { total: number }) => sum + t.total, 0) / transactions.length
            : 0,
        byPaymentMethod: transactions.reduce(
          (acc: Record<string, number>, t: { paymentMethod: string; total: number }) => {
            acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + t.total;
            return acc;
          },
          {} as Record<string, number>
        ),
      };
    }),
});
