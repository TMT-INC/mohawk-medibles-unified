/**
 * Mohawk Medibles — Financial Model & Growth Engine
 * Data-driven projections, LTV/CAC analysis, and strategic recommendations
 * to scale from current ~$274K/month to $1M/month by Dec 2026.
 */

import { prisma } from "@/lib/db";

// ─── Types ──────────────────────────────────────────────────

export interface FinancialMetrics {
    // Current state
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    averageOrderValue: number;
    ordersPerMonth: number;
    revenuePerMonth: number;
    dataRangeStart: string;
    dataRangeEnd: string;
    dataRangeDays: number;

    // Customer metrics
    repeatPurchaseRate: number;
    avgOrdersPerCustomer: number;
    customerLifetimeValue: number;
    estimatedCAC: number;
    ltvCacRatio: number;

    // Revenue breakdown
    revenueByCategory: { category: string; revenue: number; orders: number; pct: number }[];
    revenueByMonth: { month: string; revenue: number; orders: number; aov: number }[];
    topProducts: { name: string; revenue: number; units: number }[];

    // Target tracking
    targetMonthlyRevenue: number;
    monthsRemaining: number;
    requiredGrowthRate: number;
    currentVsTarget: number;
}

export interface GrowthScenario {
    name: string;
    monthlyGrowthRate: number;
    projections: { month: string; revenue: number; orders: number; cumulative: number }[];
    hitsTargetMonth: string | null;
    hitsTargetDate: string | null;
}

export interface GrowthStrategy {
    category: string;
    title: string;
    description: string;
    projectedMonthlyImpact: number;
    effort: "Low" | "Medium" | "High";
    timeline: string;
    priority: number;
}

export interface CohortData {
    cohortMonth: string;
    totalCustomers: number;
    retention30d: number;
    retention60d: number;
    retention90d: number;
    retention180d: number;
    avgLTV: number;
}

export interface AOVBucket {
    range: string;
    min: number;
    max: number;
    orderCount: number;
    revenue: number;
    pct: number;
}

// ─── Core Financial Metrics ─────────────────────────────────

export async function calculateFinancialMetrics(): Promise<FinancialMetrics> {
    const TARGET_MONTHLY = 1_000_000;
    const TARGET_DATE = new Date("2026-12-31");

    // Fetch all completed orders
    const orders = await prisma.order.findMany({
        where: { status: { notIn: ["CANCELLED", "REFUNDED", "FAILED"] } },
        select: {
            id: true,
            userId: true,
            total: true,
            createdAt: true,
            items: { select: { product: { select: { category: true, name: true } }, quantity: true, total: true } },
        },
        orderBy: { createdAt: "asc" },
    });

    const totalRevenue = orders.reduce((s: number, o: { total: number }) => s + o.total, 0);
    const totalOrders = orders.length;

    // Date range
    const earliest = orders[0]?.createdAt || new Date();
    const latest = orders[orders.length - 1]?.createdAt || new Date();
    const daySpan = Math.max(1, Math.ceil((latest.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24)));

    const revenuePerMonth = (totalRevenue / daySpan) * 30;
    const ordersPerMonth = (totalOrders / daySpan) * 30;
    const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Customer metrics
    const customerOrders = new Map<string, number>();
    for (const o of orders) {
        customerOrders.set(o.userId, (customerOrders.get(o.userId) || 0) + 1);
    }
    const totalCustomers = customerOrders.size;
    const repeatBuyers = [...customerOrders.values()].filter((c) => c > 1).length;
    const repeatPurchaseRate = totalCustomers > 0 ? repeatBuyers / totalCustomers : 0;
    const avgOrdersPerCustomer = totalCustomers > 0 ? totalOrders / totalCustomers : 0;
    const clv = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

    // Organic CAC estimate ($5-15 for organic, no paid ads)
    const estimatedCAC = 10;
    const ltvCacRatio = clv / estimatedCAC;

    // Revenue by category
    const catRevenue: Record<string, { revenue: number; orders: Set<string> }> = {};
    for (const o of orders) {
        for (const item of o.items) {
            const cat = item.product.category;
            if (!catRevenue[cat]) catRevenue[cat] = { revenue: 0, orders: new Set() };
            catRevenue[cat].revenue += item.total;
            catRevenue[cat].orders.add(o.id);
        }
    }
    const revenueByCategory = Object.entries(catRevenue)
        .map(([category, data]) => ({
            category,
            revenue: Math.round(data.revenue * 100) / 100,
            orders: data.orders.size,
            pct: Math.round((data.revenue / totalRevenue) * 1000) / 10,
        }))
        .sort((a, b) => b.revenue - a.revenue);

    // Revenue by month
    const monthlyData: Record<string, { revenue: number; orders: number }> = {};
    for (const o of orders) {
        const month = o.createdAt.toISOString().substring(0, 7);
        if (!monthlyData[month]) monthlyData[month] = { revenue: 0, orders: 0 };
        monthlyData[month].revenue += o.total;
        monthlyData[month].orders++;
    }
    const revenueByMonth = Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, data]) => ({
            month,
            revenue: Math.round(data.revenue * 100) / 100,
            orders: data.orders,
            aov: data.orders > 0 ? Math.round((data.revenue / data.orders) * 100) / 100 : 0,
        }));

    // Top products by revenue
    const productRevenue: Record<string, { revenue: number; units: number }> = {};
    for (const o of orders) {
        for (const item of o.items) {
            const name = item.product.name;
            if (!productRevenue[name]) productRevenue[name] = { revenue: 0, units: 0 };
            productRevenue[name].revenue += item.total;
            productRevenue[name].units += item.quantity;
        }
    }
    const topProducts = Object.entries(productRevenue)
        .map(([name, data]) => ({ name, revenue: Math.round(data.revenue * 100) / 100, units: data.units }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 20);

    // Growth targets
    const monthsRemaining = Math.max(1, Math.ceil((TARGET_DATE.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)));
    const requiredGrowthRate = revenuePerMonth > 0
        ? (Math.pow(TARGET_MONTHLY / revenuePerMonth, 1 / monthsRemaining) - 1) * 100
        : 0;

    return {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        totalCustomers,
        averageOrderValue: Math.round(aov * 100) / 100,
        ordersPerMonth: Math.round(ordersPerMonth),
        revenuePerMonth: Math.round(revenuePerMonth * 100) / 100,
        dataRangeStart: earliest.toISOString().substring(0, 10),
        dataRangeEnd: latest.toISOString().substring(0, 10),
        dataRangeDays: daySpan,

        repeatPurchaseRate: Math.round(repeatPurchaseRate * 1000) / 10,
        avgOrdersPerCustomer: Math.round(avgOrdersPerCustomer * 100) / 100,
        customerLifetimeValue: Math.round(clv * 100) / 100,
        estimatedCAC,
        ltvCacRatio: Math.round(ltvCacRatio * 100) / 100,

        revenueByCategory,
        revenueByMonth,
        topProducts,

        targetMonthlyRevenue: TARGET_MONTHLY,
        monthsRemaining,
        requiredGrowthRate: Math.round(requiredGrowthRate * 100) / 100,
        currentVsTarget: Math.round((revenuePerMonth / TARGET_MONTHLY) * 1000) / 10,
    };
}

// ─── Growth Projections ─────────────────────────────────────

export function getGrowthScenarios(currentMonthly: number, monthsRemaining: number): GrowthScenario[] {
    const TARGET = 1_000_000;
    const scenarios: { name: string; rate: number }[] = [
        { name: "Conservative (5%/mo)", rate: 0.05 },
        { name: "Moderate (10%/mo)", rate: 0.10 },
        { name: "Aggressive (15%/mo)", rate: 0.15 },
        { name: "Hyper-Growth (20%/mo)", rate: 0.20 },
    ];

    const now = new Date();

    return scenarios.map((s) => {
        const projections: GrowthScenario["projections"] = [];
        let revenue = currentMonthly;
        let cumulative = 0;
        let hitsTargetMonth: string | null = null;

        for (let i = 1; i <= Math.min(monthsRemaining + 3, 24); i++) {
            revenue *= 1 + s.rate;
            cumulative += revenue;
            const monthDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
            const month = monthDate.toISOString().substring(0, 7);
            const orders = Math.round(revenue / 175); // Approximate AOV

            projections.push({
                month,
                revenue: Math.round(revenue),
                orders,
                cumulative: Math.round(cumulative),
            });

            if (!hitsTargetMonth && revenue >= TARGET) {
                hitsTargetMonth = month;
            }
        }

        return {
            name: s.name,
            monthlyGrowthRate: s.rate * 100,
            projections,
            hitsTargetMonth,
            hitsTargetDate: hitsTargetMonth ? `${hitsTargetMonth}-01` : null,
        };
    });
}

// ─── Cohort Analysis ────────────────────────────────────────

export async function getCohortAnalysis(): Promise<CohortData[]> {
    const users = await prisma.user.findMany({
        where: { role: "CUSTOMER" },
        select: {
            id: true,
            orders: {
                where: { status: { notIn: ["CANCELLED", "REFUNDED", "FAILED"] } },
                select: { total: true, createdAt: true },
                orderBy: { createdAt: "asc" },
            },
        },
    });

    const cohorts: Record<string, {
        customers: Set<string>;
        reorderedBy30: Set<string>;
        reorderedBy60: Set<string>;
        reorderedBy90: Set<string>;
        reorderedBy180: Set<string>;
        totalSpend: number;
    }> = {};

    for (const u of users) {
        if (u.orders.length === 0) continue;
        const firstOrder = u.orders[0];
        const cohortMonth = firstOrder.createdAt.toISOString().substring(0, 7);
        const firstTime = firstOrder.createdAt.getTime();

        if (!cohorts[cohortMonth]) {
            cohorts[cohortMonth] = {
                customers: new Set(),
                reorderedBy30: new Set(),
                reorderedBy60: new Set(),
                reorderedBy90: new Set(),
                reorderedBy180: new Set(),
                totalSpend: 0,
            };
        }

        const c = cohorts[cohortMonth];
        c.customers.add(u.id);

        const totalSpend = u.orders.reduce((s: number, o: { total: number }) => s + o.total, 0);
        c.totalSpend += totalSpend;

        // Check subsequent orders
        for (const o of u.orders.slice(1)) {
            const daysDiff = (o.createdAt.getTime() - firstTime) / (1000 * 60 * 60 * 24);
            if (daysDiff <= 30) c.reorderedBy30.add(u.id);
            if (daysDiff <= 60) c.reorderedBy60.add(u.id);
            if (daysDiff <= 90) c.reorderedBy90.add(u.id);
            if (daysDiff <= 180) c.reorderedBy180.add(u.id);
        }
    }

    return Object.entries(cohorts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([cohortMonth, data]) => {
            const total = data.customers.size;
            return {
                cohortMonth,
                totalCustomers: total,
                retention30d: total > 0 ? Math.round((data.reorderedBy30.size / total) * 1000) / 10 : 0,
                retention60d: total > 0 ? Math.round((data.reorderedBy60.size / total) * 1000) / 10 : 0,
                retention90d: total > 0 ? Math.round((data.reorderedBy90.size / total) * 1000) / 10 : 0,
                retention180d: total > 0 ? Math.round((data.reorderedBy180.size / total) * 1000) / 10 : 0,
                avgLTV: total > 0 ? Math.round((data.totalSpend / total) * 100) / 100 : 0,
            };
        });
}

// ─── AOV Distribution ───────────────────────────────────────

export async function getAOVDistribution(): Promise<AOVBucket[]> {
    const orders = await prisma.order.findMany({
        where: { status: { notIn: ["CANCELLED", "REFUNDED", "FAILED"] } },
        select: { total: true },
    });

    const buckets: AOVBucket[] = [
        { range: "$0–$50", min: 0, max: 50, orderCount: 0, revenue: 0, pct: 0 },
        { range: "$50–$100", min: 50, max: 100, orderCount: 0, revenue: 0, pct: 0 },
        { range: "$100–$200", min: 100, max: 200, orderCount: 0, revenue: 0, pct: 0 },
        { range: "$200–$350", min: 200, max: 350, orderCount: 0, revenue: 0, pct: 0 },
        { range: "$350–$500", min: 350, max: 500, orderCount: 0, revenue: 0, pct: 0 },
        { range: "$500+", min: 500, max: Infinity, orderCount: 0, revenue: 0, pct: 0 },
    ];

    for (const o of orders) {
        const bucket = buckets.find((b) => o.total >= b.min && o.total < b.max);
        if (bucket) {
            bucket.orderCount++;
            bucket.revenue += o.total;
        }
    }

    const totalOrders = orders.length;
    for (const b of buckets) {
        b.pct = totalOrders > 0 ? Math.round((b.orderCount / totalOrders) * 1000) / 10 : 0;
        b.revenue = Math.round(b.revenue * 100) / 100;
    }

    return buckets;
}

// ─── Growth Strategy Recommendations ────────────────────────

export function generateGrowthStrategies(metrics: FinancialMetrics): GrowthStrategy[] {
    const strategies: GrowthStrategy[] = [];
    const monthlyGap = metrics.targetMonthlyRevenue - metrics.revenuePerMonth;

    // 1. AOV Optimization
    const targetAOV = 220;
    if (metrics.averageOrderValue < targetAOV) {
        const aovLift = targetAOV - metrics.averageOrderValue;
        const impact = metrics.ordersPerMonth * aovLift;
        strategies.push({
            category: "AOV Optimization",
            title: `Increase average order from $${metrics.averageOrderValue.toFixed(0)} to $${targetAOV}`,
            description: "Add 'Complete Your Order' upsell widget at checkout for carts above $120. Offer bundle discounts (buy 3+ items, get 10% off). Display 'Free shipping at $199+' progress bar in cart.",
            projectedMonthlyImpact: Math.round(impact),
            effort: "Medium",
            timeline: "2-4 weeks",
            priority: 1,
        });
    }

    // 2. Repeat Purchase Rate
    if (metrics.repeatPurchaseRate < 30) {
        const potentialRepeats = Math.round(metrics.totalCustomers * 0.1);
        const impact = potentialRepeats * metrics.averageOrderValue / (metrics.dataRangeDays / 30);
        strategies.push({
            category: "Customer Retention",
            title: "Win-back campaign for single-purchase customers",
            description: `${Math.round(metrics.totalCustomers * (1 - metrics.repeatPurchaseRate / 100))} customers have only ordered once. Launch automated email sequence: Day 14 (product education), Day 30 (10% off next order), Day 60 (free shipping offer). Target 10% conversion.`,
            projectedMonthlyImpact: Math.round(impact),
            effort: "Low",
            timeline: "1-2 weeks",
            priority: 2,
        });
    }

    // 3. VIP Program
    strategies.push({
        category: "VIP & Loyalty",
        title: "Launch Empire Loyalty tier system",
        description: "Create Bronze ($100+), Silver ($300+), Gold ($500+), Diamond ($1000+) tiers. Gold/Diamond get early access to drops, exclusive strains, free shipping. VIP customers spend 3-5x more than average.",
        projectedMonthlyImpact: Math.round(metrics.revenuePerMonth * 0.08),
        effort: "Medium",
        timeline: "4-6 weeks",
        priority: 3,
    });

    // 4. Category Expansion
    const underperforming = metrics.revenueByCategory.filter((c) => c.pct < 5 && c.orders > 0);
    if (underperforming.length > 0) {
        const catNames = underperforming.slice(0, 3).map((c) => c.category).join(", ");
        strategies.push({
            category: "Category Growth",
            title: `Content push for underperforming: ${catNames}`,
            description: `These categories have products but low sales penetration. Create educational blog content, social media spotlight series, and targeted campaigns to increase awareness. Even 2x growth in these adds meaningful revenue.`,
            projectedMonthlyImpact: Math.round(underperforming.reduce((s: number, c: { revenue: number }) => s + c.revenue, 0) * 0.5 / (metrics.dataRangeDays / 30)),
            effort: "Low",
            timeline: "Ongoing",
            priority: 4,
        });
    }

    // 5. Referral Program
    strategies.push({
        category: "Customer Acquisition",
        title: "Customer referral program (give $15, get $15)",
        description: "Each existing customer refers an average of 0.5-2 new customers when incentivized. With 25K+ customers, even 5% participation = 1,250+ referrals. Cost per acquisition ~$15 vs organic discovery.",
        projectedMonthlyImpact: Math.round(metrics.ordersPerMonth * 0.05 * metrics.averageOrderValue),
        effort: "Medium",
        timeline: "3-4 weeks",
        priority: 5,
    });

    // 6. SEO Content Engine
    strategies.push({
        category: "Organic Growth",
        title: "SEO content flywheel targeting transactional keywords",
        description: "Publish 4-8 SEO articles/month targeting 'buy [product] online Canada' keywords. Current keyword database has 257 tracked terms. Focus on keywords with >1K monthly volume and <50 difficulty. Each ranking page drives $500-2K/month.",
        projectedMonthlyImpact: Math.round(4 * 1000),
        effort: "Medium",
        timeline: "Ongoing (3-6mo compound)",
        priority: 6,
    });

    // 7. Email Newsletter Revenue
    strategies.push({
        category: "Email Marketing",
        title: "Weekly newsletter to 25K+ subscriber base",
        description: "Email marketing averages $36-42 ROI per $1 spent. Weekly campaigns featuring new arrivals, flash sales, educational content. Segment VIP/Loyal/New for personalized offers. Expected 2-5% conversion rate per send.",
        projectedMonthlyImpact: Math.round(25000 * 0.03 * metrics.averageOrderValue * 0.02 * 4),
        effort: "Low",
        timeline: "Immediate",
        priority: 7,
    });

    // 8. Geographic Expansion
    strategies.push({
        category: "Market Expansion",
        title: "Targeted campaigns for underserved provinces",
        description: "Order data shows concentration in ON/QC. Create province-specific landing pages (already have delivery pages) and targeted social campaigns for BC, AB, MB, NS. Each new market can add 50-200 orders/month.",
        projectedMonthlyImpact: Math.round(100 * metrics.averageOrderValue),
        effort: "Medium",
        timeline: "4-8 weeks",
        priority: 8,
    });

    return strategies.sort((a, b) => a.priority - b.priority);
}
