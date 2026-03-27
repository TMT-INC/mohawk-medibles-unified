/**
 * Accounting Router — Profit tracking, expenses, P&L
 */
import { z } from "zod";
import { router, adminProcedure } from "../trpc";

// Helper: build date range filter
function dateRange(range: string, customStart?: string, customEnd?: string) {
  const now = new Date();
  let start: Date;
  let end: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  switch (range) {
    case "today":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "week": {
      const day = now.getDay();
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
      break;
    }
    case "month":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "quarter": {
      const q = Math.floor(now.getMonth() / 3) * 3;
      start = new Date(now.getFullYear(), q, 1);
      break;
    }
    case "year":
      start = new Date(now.getFullYear(), 0, 1);
      break;
    case "custom":
      start = customStart ? new Date(customStart) : new Date(now.getFullYear(), 0, 1);
      end = customEnd ? new Date(customEnd + "T23:59:59.999Z") : end;
      break;
    default: // all
      start = new Date("2020-01-01");
      break;
  }

  return { gte: start, lte: end };
}

const EXPENSE_CATEGORIES = [
  "inventory", "shipping", "rent", "utilities", "wages",
  "marketing", "packaging", "equipment", "other",
] as const;

export const accountingRouter = router({
  // ─── Dashboard KPIs ───────────────────────────────────────
  dashboard: adminProcedure
    .input(
      z.object({
        range: z.enum(["today", "week", "month", "quarter", "year", "all", "custom"]).default("month"),
        customStart: z.string().optional(),
        customEnd: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const dr = dateRange(input.range, input.customStart, input.customEnd);

      // Revenue from completed/processing orders
      const orders = await ctx.prisma.order.findMany({
        where: {
          createdAt: dr,
          status: { in: ["COMPLETED", "PROCESSING", "SHIPPED", "DELIVERED"] },
        },
        select: {
          total: true,
          items: { select: { quantity: true, price: true, total: true, costPrice: true } },
        },
      });

      const revenue = orders.reduce((s, o) => s + o.total, 0);
      const cogs = orders.reduce(
        (s, o) => s + o.items.reduce((is, i) => is + (i.costPrice ?? 0) * i.quantity, 0),
        0
      );
      const grossProfit = revenue - cogs;

      // Expenses
      const expenses = await ctx.prisma.expense.findMany({
        where: { date: dr },
      });
      const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

      // Expenses by category
      const expensesByCategory: Record<string, number> = {};
      for (const e of expenses) {
        expensesByCategory[e.category] = (expensesByCategory[e.category] ?? 0) + e.amount;
      }

      const netProfit = grossProfit - totalExpenses;
      const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

      return {
        revenue,
        cogs,
        grossProfit,
        totalExpenses,
        netProfit,
        profitMargin,
        expensesByCategory,
        orderCount: orders.length,
      };
    }),

  // ─── Expenses CRUD ────────────────────────────────────────
  expensesList: adminProcedure
    .input(
      z.object({
        category: z.string().optional(),
        range: z.enum(["today", "week", "month", "quarter", "year", "all", "custom"]).default("all"),
        customStart: z.string().optional(),
        customEnd: z.string().optional(),
        limit: z.number().min(1).max(200).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const dr = dateRange(input.range, input.customStart, input.customEnd);
      const where: Record<string, unknown> = { date: dr };
      if (input.category) where.category = input.category;

      const [expenses, total] = await Promise.all([
        ctx.prisma.expense.findMany({
          where,
          orderBy: { date: "desc" },
          take: input.limit,
          skip: input.offset,
        }),
        ctx.prisma.expense.count({ where }),
      ]);

      return { expenses, total };
    }),

  createExpense: adminProcedure
    .input(
      z.object({
        category: z.string(),
        description: z.string().min(1),
        amount: z.number().positive(),
        date: z.string(), // ISO date string
        recurring: z.boolean().default(false),
        recurringFrequency: z.enum(["weekly", "monthly", "yearly"]).nullable().optional(),
        vendor: z.string().nullable().optional(),
        receiptUrl: z.string().nullable().optional(),
        notes: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.expense.create({
        data: {
          ...input,
          date: new Date(input.date),
          recurringFrequency: input.recurringFrequency ?? null,
          vendor: input.vendor ?? null,
          receiptUrl: input.receiptUrl ?? null,
          notes: input.notes ?? null,
        },
      });
    }),

  updateExpense: adminProcedure
    .input(
      z.object({
        id: z.number(),
        category: z.string().optional(),
        description: z.string().min(1).optional(),
        amount: z.number().positive().optional(),
        date: z.string().optional(),
        recurring: z.boolean().optional(),
        recurringFrequency: z.enum(["weekly", "monthly", "yearly"]).nullable().optional(),
        vendor: z.string().nullable().optional(),
        receiptUrl: z.string().nullable().optional(),
        notes: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.expense.update({
        where: { id },
        data: {
          ...data,
          date: data.date ? new Date(data.date) : undefined,
        },
      });
    }),

  deleteExpense: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.expense.delete({ where: { id: input.id } });
    }),

  // ─── Profit by Product ───────────────────────────────────
  profitByProduct: adminProcedure
    .input(
      z.object({
        range: z.enum(["today", "week", "month", "quarter", "year", "all", "custom"]).default("month"),
        customStart: z.string().optional(),
        customEnd: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const dr = dateRange(input.range, input.customStart, input.customEnd);

      const items = await ctx.prisma.orderItem.findMany({
        where: {
          order: {
            createdAt: dr,
            status: { in: ["COMPLETED", "PROCESSING", "SHIPPED", "DELIVERED"] },
          },
        },
        select: {
          productId: true,
          name: true,
          quantity: true,
          price: true,
          total: true,
          costPrice: true,
        },
      });

      // Aggregate by product
      const map = new Map<number, {
        productId: number;
        name: string;
        unitsSold: number;
        revenue: number;
        cogs: number;
      }>();

      for (const item of items) {
        const existing = map.get(item.productId);
        if (existing) {
          existing.unitsSold += item.quantity;
          existing.revenue += item.total;
          existing.cogs += (item.costPrice ?? 0) * item.quantity;
        } else {
          map.set(item.productId, {
            productId: item.productId,
            name: item.name,
            unitsSold: item.quantity,
            revenue: item.total,
            cogs: (item.costPrice ?? 0) * item.quantity,
          });
        }
      }

      const products = Array.from(map.values()).map((p) => ({
        ...p,
        profit: p.revenue - p.cogs,
        margin: p.revenue > 0 ? ((p.revenue - p.cogs) / p.revenue) * 100 : 0,
      }));

      products.sort((a, b) => b.profit - a.profit);
      return products;
    }),

  // ─── Profit by Category ──────────────────────────────────
  profitByCategory: adminProcedure
    .input(
      z.object({
        range: z.enum(["today", "week", "month", "quarter", "year", "all", "custom"]).default("month"),
        customStart: z.string().optional(),
        customEnd: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const dr = dateRange(input.range, input.customStart, input.customEnd);

      const items = await ctx.prisma.orderItem.findMany({
        where: {
          order: {
            createdAt: dr,
            status: { in: ["COMPLETED", "PROCESSING", "SHIPPED", "DELIVERED"] },
          },
        },
        select: {
          quantity: true,
          total: true,
          costPrice: true,
          product: { select: { category: true } },
        },
      });

      const map = new Map<string, { category: string; revenue: number; cogs: number; unitsSold: number }>();

      for (const item of items) {
        const cat = item.product?.category ?? "Uncategorized";
        const existing = map.get(cat);
        const itemCogs = (item.costPrice ?? 0) * item.quantity;
        if (existing) {
          existing.revenue += item.total;
          existing.cogs += itemCogs;
          existing.unitsSold += item.quantity;
        } else {
          map.set(cat, { category: cat, revenue: item.total, cogs: itemCogs, unitsSold: item.quantity });
        }
      }

      const categories = Array.from(map.values()).map((c) => ({
        ...c,
        profit: c.revenue - c.cogs,
        margin: c.revenue > 0 ? ((c.revenue - c.cogs) / c.revenue) * 100 : 0,
      }));

      categories.sort((a, b) => b.profit - a.profit);
      return categories;
    }),

  // ─── Monthly P&L (last 12 months) ────────────────────────
  monthlySummary: adminProcedure.query(async ({ ctx }) => {
    const months: Array<{
      month: string;
      revenue: number;
      cogs: number;
      grossProfit: number;
      expenses: Record<string, number>;
      totalExpenses: number;
      netProfit: number;
    }> = [];

    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
      const label = start.toLocaleDateString("en-CA", { year: "numeric", month: "short" });

      const [orders, expenseRows] = await Promise.all([
        ctx.prisma.order.findMany({
          where: {
            createdAt: { gte: start, lte: end },
            status: { in: ["COMPLETED", "PROCESSING", "SHIPPED", "DELIVERED"] },
          },
          select: {
            total: true,
            items: { select: { quantity: true, costPrice: true } },
          },
        }),
        ctx.prisma.expense.findMany({
          where: { date: { gte: start, lte: end } },
        }),
      ]);

      const revenue = orders.reduce((s, o) => s + o.total, 0);
      const cogs = orders.reduce(
        (s, o) => s + o.items.reduce((is, it) => is + (it.costPrice ?? 0) * it.quantity, 0),
        0
      );
      const grossProfit = revenue - cogs;

      const expByCat: Record<string, number> = {};
      let totalExp = 0;
      for (const e of expenseRows) {
        expByCat[e.category] = (expByCat[e.category] ?? 0) + e.amount;
        totalExp += e.amount;
      }

      months.push({
        month: label,
        revenue,
        cogs,
        grossProfit,
        expenses: expByCat,
        totalExpenses: totalExp,
        netProfit: grossProfit - totalExp,
      });
    }

    return months;
  }),

  // ─── Cash Flow (daily for last 30 days) ──────────────────
  cashFlow: adminProcedure
    .input(
      z.object({
        days: z.number().min(7).max(90).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const data: Array<{ date: string; inflow: number; outflow: number; net: number }> = [];

      for (let i = input.days - 1; i >= 0; i--) {
        const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 23, 59, 59, 999);
        const label = dayStart.toISOString().slice(0, 10);

        const [orders, expenses] = await Promise.all([
          ctx.prisma.order.aggregate({
            where: {
              createdAt: { gte: dayStart, lte: dayEnd },
              status: { in: ["COMPLETED", "PROCESSING", "SHIPPED", "DELIVERED"] },
            },
            _sum: { total: true },
          }),
          ctx.prisma.expense.aggregate({
            where: { date: { gte: dayStart, lte: dayEnd } },
            _sum: { amount: true },
          }),
        ]);

        const inflow = orders._sum.total ?? 0;
        const outflow = expenses._sum.amount ?? 0;
        data.push({ date: label, inflow, outflow, net: inflow - outflow });
      }

      return data;
    }),
});
