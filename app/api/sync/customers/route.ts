import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { log } from '@/lib/logger';
import { fetchAllCustomers, type WCCustomer } from '@/lib/wc-api';

// POST /api/sync/customers — Sync customers from WooCommerce
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('x-sync-secret');
  if (authHeader !== process.env.AUTH_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const modifiedAfter = body.modifiedAfter as string | undefined;

  const syncLog = await prisma.syncLog.create({
    data: {
      endpoint: 'customers',
      status: 'running',
      lastModified: modifiedAfter ? new Date(modifiedAfter) : null,
    },
  });

  try {
    const customers = await fetchAllCustomers(modifiedAfter, (synced, total) => {
      log.wc.info("Customers fetch progress", { fetched: synced, total });
    });

    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: { recordsTotal: customers.length },
    });

    let successCount = 0;
    let failCount = 0;

    // Process in batches of 50 to avoid overwhelming DB
    for (let i = 0; i < customers.length; i += 50) {
      const batch = customers.slice(i, i + 50);

      for (const wc of batch) {
        try {
          if (!wc.email) {
            failCount++;
            continue;
          }

          const name = [wc.first_name, wc.last_name].filter(Boolean).join(' ') || wc.username || wc.email;

          await prisma.user.upsert({
            where: { wcCustomerId: wc.id },
            create: {
              wcCustomerId: wc.id,
              email: wc.email,
              passwordHash: '', // WC-synced users, no local password
              name,
              phone: wc.billing?.phone || null,
              username: wc.username || null,
              role: 'CUSTOMER',
              avatar: wc.avatar_url || null,
              ordersCount: wc.orders_count || 0,
              totalSpent: parseFloat(wc.total_spent) || 0,
              createdAt: new Date(wc.date_created),
            },
            update: {
              name,
              phone: wc.billing?.phone || null,
              ordersCount: wc.orders_count || 0,
              totalSpent: parseFloat(wc.total_spent) || 0,
              avatar: wc.avatar_url || null,
            },
          });

          // Upsert billing address
          if (wc.billing?.address_1) {
            const existingAddr = await prisma.address.findFirst({
              where: {
                user: { wcCustomerId: wc.id },
                label: 'Billing',
              },
            });

            const user = await prisma.user.findUnique({ where: { wcCustomerId: wc.id } });
            if (user) {
              if (existingAddr) {
                await prisma.address.update({
                  where: { id: existingAddr.id },
                  data: {
                    firstName: wc.billing.first_name,
                    lastName: wc.billing.last_name,
                    street1: wc.billing.address_1,
                    street2: wc.billing.address_2 || null,
                    city: wc.billing.city,
                    province: wc.billing.state,
                    postalCode: wc.billing.postcode,
                    country: wc.billing.country || 'CA',
                    phone: wc.billing.phone || null,
                  },
                });
              } else {
                await prisma.address.create({
                  data: {
                    userId: user.id,
                    label: 'Billing',
                    firstName: wc.billing.first_name,
                    lastName: wc.billing.last_name,
                    street1: wc.billing.address_1,
                    street2: wc.billing.address_2 || null,
                    city: wc.billing.city,
                    province: wc.billing.state,
                    postalCode: wc.billing.postcode,
                    country: wc.billing.country || 'CA',
                    phone: wc.billing.phone || null,
                    isDefault: true,
                  },
                });
              }
            }
          }

          // Upsert shipping address
          if (wc.shipping?.address_1) {
            const existingAddr = await prisma.address.findFirst({
              where: {
                user: { wcCustomerId: wc.id },
                label: 'Shipping',
              },
            });

            const user = await prisma.user.findUnique({ where: { wcCustomerId: wc.id } });
            if (user) {
              if (existingAddr) {
                await prisma.address.update({
                  where: { id: existingAddr.id },
                  data: {
                    firstName: wc.shipping.first_name,
                    lastName: wc.shipping.last_name,
                    street1: wc.shipping.address_1,
                    street2: wc.shipping.address_2 || null,
                    city: wc.shipping.city,
                    province: wc.shipping.state,
                    postalCode: wc.shipping.postcode,
                    country: wc.shipping.country || 'CA',
                    phone: wc.shipping.phone || null,
                  },
                });
              } else {
                await prisma.address.create({
                  data: {
                    userId: user.id,
                    label: 'Shipping',
                    firstName: wc.shipping.first_name,
                    lastName: wc.shipping.last_name,
                    street1: wc.shipping.address_1,
                    street2: wc.shipping.address_2 || null,
                    city: wc.shipping.city,
                    province: wc.shipping.state,
                    postalCode: wc.shipping.postcode,
                    country: wc.shipping.country || 'CA',
                    phone: wc.shipping.phone || null,
                  },
                });
              }
            }
          }

          successCount++;
        } catch (err: any) {
          // Duplicate email — link by email instead
          if (err.code === 'P2002' && err.meta?.target?.includes('email')) {
            try {
              await prisma.user.update({
                where: { email: wc.email },
                data: {
                  wcCustomerId: wc.id,
                  ordersCount: wc.orders_count || 0,
                  totalSpent: parseFloat(wc.total_spent) || 0,
                },
              });
              successCount++;
              continue;
            } catch { /* fall through */ }
          }
          failCount++;
          log.wc.error("Failed to sync customer", { wcCustomerId: wc.id, email: wc.email, error: err.message });
        }
      }
    }

    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: 'completed',
        recordsSynced: successCount,
        recordsFailed: failCount,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      total: customers.length,
      synced: successCount,
      failed: failCount,
    });
  } catch (err: any) {
    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: { status: 'failed', error: err.message, completedAt: new Date() },
    });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
