import { NextRequest, NextResponse } from 'next/server';
import { log } from "@/lib/logger";
import { timingSafeEqual } from 'crypto';
import { prisma } from '@/lib/db';
import { fetchOrders, fetchCustomers, fetchAllProducts, type WCOrder } from '@/lib/wc-api';

function verifyCronAuth(authHeader: string | null): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  if (!authHeader) return false;
  const token = authHeader.replace('Bearer ', '');
  if (token.length !== cronSecret.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(cronSecret));
}

// GET /api/cron/wc-sync — Incremental sync (runs every 6 hours via Vercel Cron)
// Only syncs records modified since last successful sync
export async function GET(req: NextRequest) {
  // Verify cron secret (timing-safe)
  if (!verifyCronAuth(req.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: Record<string, any> = {};

  // Get last successful sync timestamps for each endpoint
  async function getLastSync(endpoint: string): Promise<string | undefined> {
    const last = await prisma.syncLog.findFirst({
      where: { endpoint, status: 'completed' },
      orderBy: { completedAt: 'desc' },
    });
    return last?.completedAt?.toISOString();
  }

  // ── Sync Orders (incremental) ──
  try {
    const lastOrderSync = await getLastSync('orders');
    const syncLog = await prisma.syncLog.create({
      data: { endpoint: 'orders', status: 'running', lastModified: lastOrderSync ? new Date(lastOrderSync) : null },
    });

    const { orders, total } = await fetchOrders({
      page: 1,
      modifiedAfter: lastOrderSync,
    });

    let synced = 0;
    // Process just first page for cron (max 100 recent orders)
    for (const wc of orders) {
      try {
        let userId: string | undefined;
        if (wc.customer_id > 0) {
          const user = await prisma.user.findUnique({ where: { wcCustomerId: wc.customer_id } });
          userId = user?.id;
        }
        if (!userId) {
          const email = wc.billing?.email || `guest-order-${wc.id}@mohawkmedibles.ca`;
          const guest = await prisma.user.upsert({
            where: { email },
            create: { email, passwordHash: '', name: [wc.billing?.first_name, wc.billing?.last_name].filter(Boolean).join(' ') || 'Guest' },
            update: {},
          });
          userId = guest.id;
        }

        const subtotal = wc.line_items?.reduce((s, i) => s + parseFloat(i.total || '0'), 0) || 0;
        const statusMap: Record<string, string> = { 'pending': 'PENDING', 'processing': 'PROCESSING', 'on-hold': 'ON_HOLD', 'completed': 'COMPLETED', 'cancelled': 'CANCELLED', 'refunded': 'REFUNDED', 'failed': 'FAILED' };

        await prisma.order.upsert({
          where: { wcOrderId: wc.id },
          create: {
            wcOrderId: wc.id, wcOrderKey: wc.order_key, orderNumber: `MM-${wc.id}`,
            userId, status: (statusMap[wc.status] || 'PENDING') as any,
            subtotal, shippingCost: parseFloat(wc.shipping_total) || 0,
            tax: parseFloat(wc.total_tax) || 0, discount: parseFloat(wc.discount_total) || 0,
            total: parseFloat(wc.total) || 0, currency: wc.currency || 'CAD',
            paymentMethod: wc.payment_method, paymentMethodTitle: wc.payment_method_title,
            paymentReference: wc.transaction_id || null,
            billingData: JSON.stringify(wc.billing), shippingData: JSON.stringify(wc.shipping),
            createdAt: new Date(wc.date_created),
          },
          update: {
            status: (statusMap[wc.status] || 'PENDING') as any,
            total: parseFloat(wc.total) || 0,
            paymentReference: wc.transaction_id || null,
          },
        });
        synced++;
      } catch (err) {
        log.wc.error("Cron order sync failed", { error: err instanceof Error ? err.message : "Unknown", wcOrderId: wc.id });
      }
    }

    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: { status: 'completed', recordsTotal: total, recordsSynced: synced, completedAt: new Date() },
    });

    results.orders = { total, synced, since: lastOrderSync || 'full' };
  } catch (err: any) {
    log.wc.error("Cron orders sync failed", { error: err instanceof Error ? err.message : "Unknown" });
    results.orders = { error: "Orders sync failed" };
  }

  // ── Sync Customers (incremental) ──
  try {
    const lastCustomerSync = await getLastSync('customers');
    const { customers, total } = await fetchCustomers({
      page: 1,
      modifiedAfter: lastCustomerSync,
    });

    let synced = 0;
    for (const wc of customers) {
      try {
        if (!wc.email) continue;
        const name = [wc.first_name, wc.last_name].filter(Boolean).join(' ') || wc.email;
        await prisma.user.upsert({
          where: { wcCustomerId: wc.id },
          create: {
            wcCustomerId: wc.id, email: wc.email, passwordHash: '', name,
            phone: wc.billing?.phone || null, username: wc.username || null,
            ordersCount: wc.orders_count || 0, totalSpent: parseFloat(wc.total_spent) || 0,
          },
          update: { name, ordersCount: wc.orders_count || 0, totalSpent: parseFloat(wc.total_spent) || 0 },
        });
        synced++;
      } catch { /* skip duplicates */ }
    }

    results.customers = { total, synced, since: lastCustomerSync || 'full' };
  } catch (err: any) {
    log.wc.error("Cron customers sync failed", { error: err instanceof Error ? err.message : "Unknown" });
    results.customers = { error: "Customers sync failed" };
  }

  return NextResponse.json({ success: true, timestamp: new Date().toISOString(), results });
}
