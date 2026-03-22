// Mohawk Medibles — Tenant Analytics Tracker
// POST: Record funnel events per tenant (page views, add to cart, checkout, etc.)

import { NextRequest, NextResponse } from 'next/server';
import { log } from "@/lib/logger";
import { prisma } from '@/lib/db';

type EventType = 'page_view' | 'product_view' | 'add_to_cart' | 'checkout_start' | 'order_complete';

interface TrackEvent {
  event: EventType;
  tenantSlug: string;
  revenue?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body: TrackEvent = await req.json();
    const { event, tenantSlug, revenue } = body;

    if (!event || !tenantSlug) {
      return NextResponse.json({ error: 'event and tenantSlug required' }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Upsert today's analytics row for this tenant
    const fieldMap: Record<EventType, string> = {
      page_view: 'pageViews',
      product_view: 'productViews',
      add_to_cart: 'addToCarts',
      checkout_start: 'checkoutStarts',
      order_complete: 'ordersCompleted',
    };

    const field = fieldMap[event];
    if (!field) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
    }

    // Find tenant
    const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) {
      // Silently accept — tenant might be in static config, not DB yet
      return NextResponse.json({ ok: true, note: 'tenant not in DB' });
    }

    // Upsert analytics row
    const increment: Record<string, number> = { [field]: 1 };
    if (event === 'order_complete' && revenue) {
      increment.revenue = revenue;
    }

    await prisma.tenantAnalytics.upsert({
      where: {
        tenantId_date: { tenantId: tenant.id, date: today },
      },
      create: {
        tenantId: tenant.id,
        date: today,
        [field]: 1,
        ...(revenue && event === 'order_complete' ? { revenue } : {}),
      },
      update: {
        [field]: { increment: 1 },
        ...(revenue && event === 'order_complete' ? { revenue: { increment: revenue } } : {}),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    log.admin.error("Tenant track error", { error: error instanceof Error ? error.message : "Unknown" });
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
