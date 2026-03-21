/**
 * Reporting Router — BI dashboards & analytics
 * Ported from command center: server/routers/reporting/
 */
import { z } from "zod";
import { router, adminProcedure } from "../trpc";

export const reportingRouter = router({
  // ─── Site Monitors ──────────────────────────────────────
  listSites: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.siteMonitor.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  }),

  createSite: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        url: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        siteType: z.enum(["ecommerce", "retail_store", "hybrid", "warehouse"]).default("ecommerce"),
        color: z.string().default("#3b82f6"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.siteMonitor.create({
        data: { ...input, createdBy: ctx.userId },
      });
    }),

  // ─── Metric Snapshots ──────────────────────────────────
  getSnapshots: adminProcedure
    .input(
      z.object({
        siteId: z.number(),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.metricSnapshot.findMany({
        where: {
          siteId: input.siteId,
          snapshotDate: {
            gte: new Date(input.startDate),
            lte: new Date(input.endDate),
          },
        },
        orderBy: { snapshotDate: "asc" },
      });
    }),

  addSnapshot: adminProcedure
    .input(
      z.object({
        siteId: z.number(),
        snapshotDate: z.string(),
        revenue: z.number().optional(),
        orders: z.number().optional(),
        avgOrderValue: z.number().optional(),
        visitors: z.number().optional(),
        pageViews: z.number().optional(),
        bounceRate: z.number().optional(),
        conversionRate: z.number().optional(),
        organicTraffic: z.number().optional(),
        inStoreRevenue: z.number().optional(),
        transactions: z.number().optional(),
        footTraffic: z.number().optional(),
        itemsSold: z.number().optional(),
        source: z.enum(["manual", "csv", "api"]).default("manual"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.metricSnapshot.create({
        data: {
          ...input,
          snapshotDate: new Date(input.snapshotDate),
          createdBy: ctx.userId,
        },
      });
    }),

  // ─── Unified Report ─────────────────────────────────────
  getUnifiedReport: adminProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const start = new Date(input.startDate);
      const end = new Date(input.endDate);

      const [onlineOrders, posTransactions, snapshots] = await Promise.all([
        ctx.prisma.order.findMany({
          where: { createdAt: { gte: start, lte: end } },
          select: { total: true, status: true, paymentMethod: true },
        }),
        ctx.prisma.posTransaction.findMany({
          where: { createdAt: { gte: start, lte: end } },
          select: { total: true, paymentMethod: true, itemCount: true },
        }),
        ctx.prisma.metricSnapshot.findMany({
          where: { snapshotDate: { gte: start, lte: end } },
          include: { site: { select: { name: true } } },
        }),
      ]);

      const onlineRevenue = onlineOrders.reduce((sum: number, o: { total: number }) => sum + o.total, 0);
      const posRevenue = posTransactions.reduce((sum: number, t: { total: number }) => sum + t.total, 0);

      return {
        period: { start: input.startDate, end: input.endDate },
        online: {
          orders: onlineOrders.length,
          revenue: onlineRevenue,
          avgOrderValue: onlineOrders.length > 0 ? onlineRevenue / onlineOrders.length : 0,
        },
        inStore: {
          transactions: posTransactions.length,
          revenue: posRevenue,
          avgTransactionValue: posTransactions.length > 0 ? posRevenue / posTransactions.length : 0,
          totalItems: posTransactions.reduce((sum: number, t: { itemCount: number }) => sum + t.itemCount, 0),
        },
        combined: {
          totalRevenue: onlineRevenue + posRevenue,
          totalTransactions: onlineOrders.length + posTransactions.length,
        },
        snapshots,
      };
    }),

  // ─── Alerts ─────────────────────────────────────────────
  listAlerts: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.biAlert.findMany({
      where: { isEnabled: true },
      include: { site: true },
      orderBy: { createdAt: "desc" },
    });
  }),

  getAlertHistory: adminProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        unreadOnly: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.biAlertHistory.findMany({
        where: input.unreadOnly ? { isRead: false } : undefined,
        take: input.limit,
        orderBy: { triggeredAt: "desc" },
        include: { alert: true },
      });
    }),

  // ─── Dashboards ─────────────────────────────────────────
  listDashboards: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.customDashboard.findMany({
      include: { widgets: true },
      orderBy: { name: "asc" },
    });
  }),

  createDashboard: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        layoutConfig: z.record(z.string(), z.unknown()).optional(),
        isDefault: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { layoutConfig, ...rest } = input;
      return ctx.prisma.customDashboard.create({
        data: {
          ...rest,
          createdBy: ctx.userId,
          ...(layoutConfig ? { layoutConfig: layoutConfig as any } : {}),
        },
      });
    }),
});
