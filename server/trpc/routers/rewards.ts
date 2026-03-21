/**
 * Rewards & Loyalty Router — tRPC endpoints for points, tiers, redemptions
 * Ported from Spirit Fire Tobacco + Command Center tier system
 */
import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../trpc";
import {
  calculatePointsEarned,
  getTierFromSpend,
  getTierProgress,
  getNextTier,
  pointsToDollars,
  validateRedemption,
  TIERS,
} from "@/lib/rewards/points-engine";

export const rewardsRouter = router({
  // ─── Get user's loyalty membership ─────────────────────
  membership: protectedProcedure.query(async ({ ctx }) => {
    const points = await ctx.prisma.loyaltyPoint.aggregate({
      where: { userId: ctx.userId! },
      _sum: { points: true },
    });

    const totalEarned = await ctx.prisma.loyaltyPoint.aggregate({
      where: { userId: ctx.userId!, type: "earn" },
      _sum: { points: true },
    });

    const totalRedeemed = await ctx.prisma.loyaltyPoint.aggregate({
      where: { userId: ctx.userId!, type: "redeem" },
      _sum: { points: true },
    });

    // Calculate annual spend for tier
    const yearAgo = new Date();
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);
    const annualOrders = await ctx.prisma.order.aggregate({
      where: {
        userId: ctx.userId!,
        createdAt: { gte: yearAgo },
        status: { in: ["COMPLETED", "DELIVERED", "SHIPPED"] },
      },
      _sum: { total: true },
    });

    const annualSpend = annualOrders._sum.total ?? 0;
    const currentTier = getTierFromSpend(annualSpend);
    const tierInfo = TIERS[currentTier];
    const nextTier = getNextTier(currentTier);
    const progress = getTierProgress(annualSpend, currentTier);

    return {
      balance: points._sum.points ?? 0,
      dollarValue: pointsToDollars(points._sum.points ?? 0),
      totalEarned: totalEarned._sum.points ?? 0,
      totalRedeemed: Math.abs(totalRedeemed._sum.points ?? 0),
      tier: {
        name: tierInfo.name,
        key: currentTier,
        multiplier: tierInfo.multiplier,
        discount: tierInfo.discount,
        color: tierInfo.color,
      },
      nextTier: nextTier
        ? {
            name: nextTier.name,
            remaining: Math.max(0, nextTier.minSpend - annualSpend),
            progress,
          }
        : null,
      annualSpend,
    };
  }),

  // ─── Points history ────────────────────────────────────
  history: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.loyaltyPoint.findMany({
        where: { userId: ctx.userId! },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });
    }),

  // ─── Earn points from an order ─────────────────────────
  earnFromOrder: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        orderTotal: z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check not already awarded
      const existing = await ctx.prisma.loyaltyPoint.findFirst({
        where: { userId: ctx.userId!, orderId: input.orderId, type: "earn" },
      });
      if (existing) throw new Error("Points already awarded for this order");

      // Get tier multiplier
      const yearAgo = new Date();
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      const annualOrders = await ctx.prisma.order.aggregate({
        where: {
          userId: ctx.userId!,
          createdAt: { gte: yearAgo },
          status: { in: ["COMPLETED", "DELIVERED", "SHIPPED"] },
        },
        _sum: { total: true },
      });
      const tier = getTierFromSpend(annualOrders._sum.total ?? 0);
      const multiplier = TIERS[tier].multiplier;
      const points = calculatePointsEarned(input.orderTotal, multiplier);

      return ctx.prisma.loyaltyPoint.create({
        data: {
          userId: ctx.userId!,
          points,
          type: "earn",
          orderId: input.orderId,
          description: `Earned ${points} points from order (${multiplier}x ${TIERS[tier].name} tier)`,
        },
      });
    }),

  // ─── Redeem points for discount ────────────────────────
  redeem: protectedProcedure
    .input(z.object({ points: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      // Get current balance
      const balance = await ctx.prisma.loyaltyPoint.aggregate({
        where: { userId: ctx.userId! },
        _sum: { points: true },
      });

      const currentBalance = balance._sum.points ?? 0;
      const validation = validateRedemption(currentBalance, input.points);
      if (!validation.valid) throw new Error(validation.error);

      const discount = pointsToDollars(input.points);

      return ctx.prisma.loyaltyPoint.create({
        data: {
          userId: ctx.userId!,
          points: -input.points,
          type: "redeem",
          description: `Redeemed ${input.points} points for $${discount} discount`,
        },
      });
    }),

  // ─── Referral info ─────────────────────────────────────
  referralInfo: protectedProcedure.query(async ({ ctx }) => {
    const referrals = await ctx.prisma.referral.findMany({
      where: { referrerId: ctx.userId! },
      orderBy: { createdAt: "desc" },
    });

    const completed = referrals.filter((r: { status: string }) => r.status === "completed");
    const totalEarned = completed.reduce((sum: number, r: { referrerPointsAwarded: number }) => sum + r.referrerPointsAwarded, 0);

    // Get or create referral code
    let myReferral = await ctx.prisma.referral.findFirst({
      where: { referrerId: ctx.userId!, status: "pending", refereeId: null },
    });

    if (!myReferral) {
      const code = `MM-${ctx.userId!.slice(-6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      myReferral = await ctx.prisma.referral.create({
        data: {
          referrerId: ctx.userId!,
          referralCode: code,
          status: "pending",
          referrerPointsAwarded: 0,
          refereePointsAwarded: 0,
        },
      });
    }

    return {
      referralCode: myReferral.referralCode,
      totalReferrals: referrals.length,
      completedReferrals: completed.length,
      totalPointsEarned: totalEarned,
      recentReferrals: referrals.slice(0, 10),
    };
  }),

  // ─── All tiers info (public) ───────────────────────────
  tiers: protectedProcedure.query(() => {
    return Object.entries(TIERS).map(([key, tier]) => ({
      key,
      ...tier,
    }));
  }),

  // ─── Admin: loyalty stats ──────────────────────────────
  adminStats: adminProcedure.query(async ({ ctx }) => {
    const [totalMembers, totalPointsIssued, totalRedemptions, activeReferrals] =
      await Promise.all([
        ctx.prisma.loyaltyPoint.groupBy({ by: ["userId"], _count: true }).then((r: unknown[]) => r.length),
        ctx.prisma.loyaltyPoint.aggregate({ where: { type: "earn" }, _sum: { points: true } }),
        ctx.prisma.loyaltyPoint.aggregate({ where: { type: "redeem" }, _sum: { points: true } }),
        ctx.prisma.referral.count({ where: { status: "completed" } }),
      ]);

    return {
      totalMembers,
      totalPointsIssued: totalPointsIssued._sum.points ?? 0,
      totalPointsRedeemed: Math.abs(totalRedemptions._sum.points ?? 0),
      activeReferrals,
    };
  }),
});
