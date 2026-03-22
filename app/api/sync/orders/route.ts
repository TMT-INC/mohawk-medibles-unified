import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { log } from '@/lib/logger';
import { fetchOrders, type WCOrder } from '@/lib/wc-api';

// Map WC order status → our OrderStatus enum
function mapOrderStatus(wcStatus: string): string {
  const map: Record<string, string> = {
    'pending': 'PENDING',
    'processing': 'PROCESSING',
    'on-hold': 'ON_HOLD',
    'completed': 'COMPLETED',
    'cancelled': 'CANCELLED',
    'refunded': 'REFUNDED',
    'failed': 'FAILED',
    'trash': 'CANCELLED',
  };
  return map[wcStatus] || 'PENDING';
}

function mapPaymentStatus(wcStatus: string): string {
  if (['completed', 'processing'].includes(wcStatus)) return 'PAID';
  if (wcStatus === 'refunded') return 'REFUNDED';
  if (wcStatus === 'failed') return 'FAILED';
  return 'PENDING';
}

async function syncOrderBatch(orders: WCOrder[]): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const wc of orders) {
    try {
      // Find or create user by WC customer ID or guest email
      let userId: string;
      if (wc.customer_id > 0) {
        const user = await prisma.user.findUnique({ where: { wcCustomerId: wc.customer_id } });
        if (user) {
          userId = user.id;
        } else {
          // Customer not synced yet — create stub
          const email = wc.billing?.email || `guest-${wc.customer_id}@mohawkmedibles.ca`;
          const name = [wc.billing?.first_name, wc.billing?.last_name].filter(Boolean).join(' ') || 'Guest';
          const created = await prisma.user.upsert({
            where: { email },
            create: {
              wcCustomerId: wc.customer_id,
              email,
              passwordHash: '',
              name,
              phone: wc.billing?.phone || null,
            },
            update: { wcCustomerId: wc.customer_id },
          });
          userId = created.id;
        }
      } else {
        // Guest checkout
        const email = wc.billing?.email || `guest-order-${wc.id}@mohawkmedibles.ca`;
        const name = [wc.billing?.first_name, wc.billing?.last_name].filter(Boolean).join(' ') || 'Guest';
        const guest = await prisma.user.upsert({
          where: { email },
          create: { email, passwordHash: '', name, phone: wc.billing?.phone || null },
          update: {},
        });
        userId = guest.id;
      }

      // Calculate subtotal from line items
      const subtotal = wc.line_items?.reduce((sum, item) => sum + parseFloat(item.total || '0'), 0) || 0;

      await prisma.order.upsert({
        where: { wcOrderId: wc.id },
        create: {
          wcOrderId: wc.id,
          wcOrderKey: wc.order_key,
          orderNumber: `MM-${wc.id}`,
          userId,
          status: mapOrderStatus(wc.status) as any,
          subtotal,
          shippingCost: parseFloat(wc.shipping_total) || 0,
          tax: parseFloat(wc.total_tax) || 0,
          discount: parseFloat(wc.discount_total) || 0,
          total: parseFloat(wc.total) || 0,
          currency: wc.currency || 'CAD',
          paymentMethod: wc.payment_method || null,
          paymentMethodTitle: wc.payment_method_title || null,
          paymentReference: wc.transaction_id || null,
          paymentStatus: mapPaymentStatus(wc.status) as any,
          customerNote: wc.customer_note || null,
          ipAddress: wc.customer_ip_address || null,
          billingData: JSON.stringify(wc.billing),
          shippingData: JSON.stringify(wc.shipping),
          createdAt: new Date(wc.date_created),
        },
        update: {
          status: mapOrderStatus(wc.status) as any,
          paymentStatus: mapPaymentStatus(wc.status) as any,
          paymentMethod: wc.payment_method || null,
          paymentMethodTitle: wc.payment_method_title || null,
          paymentReference: wc.transaction_id || null,
          total: parseFloat(wc.total) || 0,
          shippingData: JSON.stringify(wc.shipping),
        },
      });

      // Sync line items
      const order = await prisma.order.findUnique({ where: { wcOrderId: wc.id } });
      if (order && wc.line_items?.length) {
        // Delete existing line items and recreate (idempotent)
        await prisma.orderItem.deleteMany({ where: { orderId: order.id } });

        for (const item of wc.line_items) {
          // Try to find product by WC ID
          let productId: number;
          const product = await prisma.product.findUnique({ where: { wcId: item.product_id } });
          if (product) {
            productId = product.id;
          } else {
            // Product not synced — create placeholder
            const placeholder = await prisma.product.upsert({
              where: { wcId: item.product_id },
              create: {
                wcId: item.product_id,
                slug: `wc-product-${item.product_id}`,
                name: item.name,
                category: 'Uncategorized',
                price: item.price || 0,
                sku: item.sku || null,
                canonicalUrl: '',
                path: `/product/wc-product-${item.product_id}/`,
                image: '',
                altText: item.name,
                metaDescription: '',
                shortDescription: '',
              },
              update: { name: item.name },
            });
            productId = placeholder.id;
          }

          await prisma.orderItem.create({
            data: {
              orderId: order.id,
              productId,
              quantity: item.quantity,
              price: item.price || parseFloat(item.total) / item.quantity,
              total: parseFloat(item.total) || 0,
              name: item.name,
            },
          });
        }
      }

      success++;
    } catch (err: any) {
      failed++;
      log.wc.error("Failed to sync order", { wcOrderId: wc.id, error: err.message });
    }
  }

  return { success, failed };
}

// POST /api/sync/orders — Paginated order sync from WooCommerce
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('x-sync-secret');
  if (authHeader !== process.env.AUTH_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const modifiedAfter = body.modifiedAfter as string | undefined;
  const startPage = body.startPage as number || 1;
  const maxPages = body.maxPages as number || 0; // 0 = all

  const syncLog = await prisma.syncLog.create({
    data: {
      endpoint: 'orders',
      status: 'running',
      lastModified: modifiedAfter ? new Date(modifiedAfter) : null,
      lastPage: startPage - 1,
    },
  });

  try {
    // Get first page to know total
    const first = await fetchOrders({ page: startPage, modifiedAfter });
    const totalPages = maxPages > 0 ? Math.min(first.totalPages, startPage + maxPages - 1) : first.totalPages;

    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: { recordsTotal: first.total },
    });

    let totalSuccess = 0;
    let totalFailed = 0;

    // Process first page
    const firstResult = await syncOrderBatch(first.orders);
    totalSuccess += firstResult.success;
    totalFailed += firstResult.failed;

    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: { lastPage: startPage, recordsSynced: totalSuccess, recordsFailed: totalFailed },
    });

    log.wc.info("Orders sync progress", { page: startPage, totalPages, synced: totalSuccess });

    // Process remaining pages
    for (let page = startPage + 1; page <= totalPages; page++) {
      await new Promise((r) => setTimeout(r, 500)); // Rate limit

      try {
        const result = await fetchOrders({ page, modifiedAfter });
        const batch = await syncOrderBatch(result.orders);
        totalSuccess += batch.success;
        totalFailed += batch.failed;

        await prisma.syncLog.update({
          where: { id: syncLog.id },
          data: { lastPage: page, recordsSynced: totalSuccess, recordsFailed: totalFailed },
        });

        log.wc.info("Orders sync progress", { page, totalPages, synced: totalSuccess });
      } catch (err) {
        log.wc.error("Orders sync page failed", { page, error: err instanceof Error ? err.message : "Unknown" });
        totalFailed += 100; // Approximate page size
      }
    }

    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: 'completed',
        recordsSynced: totalSuccess,
        recordsFailed: totalFailed,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      total: first.total,
      synced: totalSuccess,
      failed: totalFailed,
      pages: totalPages,
    });
  } catch (err: any) {
    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: { status: 'failed', error: err.message, completedAt: new Date() },
    });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/sync/orders — Check sync status
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('x-sync-secret');
  if (authHeader !== process.env.AUTH_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const lastSync = await prisma.syncLog.findFirst({
    where: { endpoint: 'orders' },
    orderBy: { startedAt: 'desc' },
  });

  const orderCount = await prisma.order.count();

  return NextResponse.json({ lastSync, orderCount });
}
