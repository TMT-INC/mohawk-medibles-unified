/**
 * Mohawk Medibles — Subscriber Metadata Sync
 * Enriches newsletter subscribers with purchase data from orders.
 */

import { prisma } from "@/lib/db";
import { classifyCustomer } from "@/lib/customer-segments";

/** Sync all subscribers with their purchase data */
export async function syncAllSubscribers(): Promise<{ synced: number; errors: number }> {
    const subscribers = await prisma.subscriber.findMany({
        where: { status: "active" },
        select: { id: true, email: true },
    });

    let synced = 0;
    let errors = 0;

    for (const sub of subscribers) {
        try {
            await syncSubscriber(sub.id, sub.email);
            synced++;
        } catch {
            errors++;
        }
    }

    return { synced, errors };
}

/** Sync a single subscriber with their user/order data */
export async function syncSubscriber(subscriberId: string, email: string): Promise<void> {
    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            orders: {
                where: { status: { notIn: ["CANCELLED", "REFUNDED", "FAILED"] } },
                select: {
                    total: true,
                    createdAt: true,
                    items: { select: { product: { select: { category: true } } } },
                },
                orderBy: { createdAt: "desc" },
            },
        },
    });

    if (!user) return;

    const totalSpend = user.orders.reduce((s: number, o: { total: number }) => s + o.total, 0);
    const orderCount = user.orders.length;
    const lastOrderDate = user.orders[0]?.createdAt?.toISOString() || null;
    const daysSinceLastOrder = user.orders[0]?.createdAt
        ? Math.floor((Date.now() - user.orders[0].createdAt.getTime()) / (1000 * 60 * 60 * 24))
        : null;

    // Top categories
    const catCounts: Record<string, number> = {};
    for (const o of user.orders) {
        for (const item of o.items) {
            catCounts[item.product.category] = (catCounts[item.product.category] || 0) + 1;
        }
    }
    const topCats = Object.entries(catCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cat]) => cat);

    const segment = classifyCustomer(totalSpend, orderCount, daysSinceLastOrder);

    // Build segment labels
    const segments: string[] = [segment];
    if (topCats.length > 0) segments.push(...topCats.map((c) => `${c.toLowerCase()}-buyer`));

    await prisma.subscriber.update({
        where: { id: subscriberId },
        data: {
            segments: JSON.stringify(segments),
            metadata: JSON.stringify({
                totalSpend: Math.round(totalSpend * 100) / 100,
                orderCount,
                lastOrderDate,
                daysSinceLastOrder,
                topCategories: topCats,
                segment,
            }),
        },
    });
}
