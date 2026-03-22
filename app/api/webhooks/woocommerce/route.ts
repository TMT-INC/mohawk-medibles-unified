import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { log } from '@/lib/logger';
import crypto from 'crypto';

// ─── Signature Verification ──────────────────────────────────

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hash = crypto.createHmac('sha256', secret).update(payload).digest('base64');
  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  } catch {
    return false;
  }
}

// ─── Excluded Categories ────────────────────────────────────
// Products in these categories are NOT synced to the storefront
const EXCLUDED_CATEGORIES = new Set([
  'nicotine', 'sexual enhancement', 'enhancement pills',
  'mushrooms', 'hookah',
  // Nicotine vape brands
  'ijoy', 'geek bar', 'flavour beast', 'flying horse', 'lip rippers',
  // Psilocybin brands
  'euphoria psychedelics', 'her highness from the 6ix',
]);

function isExcludedCategory(category: string): boolean {
  return EXCLUDED_CATEGORIES.has(category.toLowerCase());
}

// ─── Status Mappers ──────────────────────────────────────────

const ORDER_STATUS_MAP: Record<string, string> = {
  'pending': 'PENDING', 'processing': 'PROCESSING', 'on-hold': 'ON_HOLD',
  'completed': 'COMPLETED', 'cancelled': 'CANCELLED', 'refunded': 'REFUNDED',
  'failed': 'FAILED', 'trash': 'CANCELLED',
};

function mapPaymentStatus(wcStatus: string): string {
  if (['completed', 'processing'].includes(wcStatus)) return 'PAID';
  if (wcStatus === 'refunded') return 'REFUNDED';
  if (wcStatus === 'failed') return 'FAILED';
  return 'PENDING';
}

// ─── Order Handler ───────────────────────────────────────────

async function handleOrder(wc: any, topic: string) {
  // Resolve user
  let userId: string | undefined;

  if (wc.customer_id > 0) {
    const user = await prisma.user.findUnique({ where: { wcCustomerId: wc.customer_id } });
    userId = user?.id;
  }
  if (!userId && wc.billing?.email) {
    const user = await prisma.user.findUnique({ where: { email: wc.billing.email } });
    if (user) {
      userId = user.id;
      if (wc.customer_id > 0 && !user.wcCustomerId) {
        await prisma.user.update({ where: { id: user.id }, data: { wcCustomerId: wc.customer_id } });
      }
    }
  }
  if (!userId) {
    const email = wc.billing?.email || `guest-order-${wc.id}@mohawkmedibles.ca`;
    const name = [wc.billing?.first_name, wc.billing?.last_name].filter(Boolean).join(' ') || 'Guest';
    const guest = await prisma.user.upsert({
      where: { email },
      create: { email, passwordHash: '', name, wcCustomerId: wc.customer_id > 0 ? wc.customer_id : null },
      update: {},
    });
    userId = guest.id;
  }

  const subtotal = wc.line_items?.reduce(
    (sum: number, item: any) => sum + parseFloat(item.total || '0'), 0
  ) || 0;

  // Upsert order
  await prisma.order.upsert({
    where: { wcOrderId: wc.id },
    create: {
      wcOrderId: wc.id, wcOrderKey: wc.order_key, orderNumber: `MM-${wc.id}`,
      userId, status: (ORDER_STATUS_MAP[wc.status] || 'PENDING') as any,
      subtotal, shippingCost: parseFloat(wc.shipping_total) || 0,
      tax: parseFloat(wc.total_tax) || 0, discount: parseFloat(wc.discount_total) || 0,
      total: parseFloat(wc.total) || 0, currency: wc.currency || 'CAD',
      paymentMethod: wc.payment_method || null, paymentMethodTitle: wc.payment_method_title || null,
      paymentReference: wc.transaction_id || null, paymentStatus: mapPaymentStatus(wc.status) as any,
      customerNote: wc.customer_note || null, ipAddress: wc.customer_ip_address || null,
      billingData: JSON.stringify(wc.billing), shippingData: JSON.stringify(wc.shipping),
      createdAt: new Date(wc.date_created),
    },
    update: {
      status: (ORDER_STATUS_MAP[wc.status] || 'PENDING') as any,
      paymentStatus: mapPaymentStatus(wc.status) as any,
      total: parseFloat(wc.total) || 0,
      shippingCost: parseFloat(wc.shipping_total) || 0,
      discount: parseFloat(wc.discount_total) || 0,
      paymentMethod: wc.payment_method || null,
      paymentMethodTitle: wc.payment_method_title || null,
      paymentReference: wc.transaction_id || null,
      billingData: JSON.stringify(wc.billing),
      shippingData: JSON.stringify(wc.shipping),
    },
  });

  // Sync line items
  const order = await prisma.order.findUnique({ where: { wcOrderId: wc.id } });
  if (order && wc.line_items?.length) {
    await prisma.orderItem.deleteMany({ where: { orderId: order.id } });

    for (const item of wc.line_items) {
      let productId: number;
      const product = await prisma.product.findUnique({ where: { wcId: item.product_id } });
      if (product) {
        productId = product.id;
      } else {
        const placeholder = await prisma.product.upsert({
          where: { wcId: item.product_id },
          create: {
            wcId: item.product_id, slug: `wc-product-${item.product_id}`, name: item.name,
            category: 'Uncategorized', price: item.price || 0, sku: item.sku || null,
            canonicalUrl: '', path: `/product/wc-product-${item.product_id}/`,
            image: '', altText: item.name, metaDescription: '', shortDescription: '',
          },
          update: { name: item.name },
        });
        productId = placeholder.id;
      }

      await prisma.orderItem.create({
        data: {
          orderId: order.id, productId, quantity: item.quantity,
          price: item.price || parseFloat(item.total) / (item.quantity || 1),
          total: parseFloat(item.total) || 0, name: item.name,
        },
      });
    }

    // Status history
    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: (ORDER_STATUS_MAP[wc.status] || 'PENDING') as any,
        note: `WC webhook: ${topic}`,
      },
    });
  }

  log.wc.info("Order synced", { wcOrderId: wc.id, status: wc.status, total: wc.total });
}

// ─── Customer Handler ────────────────────────────────────────

async function handleCustomer(wc: any, topic: string) {
  if (!wc.email) return;

  const name = [wc.first_name, wc.last_name].filter(Boolean).join(' ') || wc.username || wc.email;

  const user = await prisma.user.upsert({
    where: { wcCustomerId: wc.id },
    create: {
      wcCustomerId: wc.id, email: wc.email, passwordHash: '', name,
      phone: wc.billing?.phone || null, username: wc.username || null,
      ordersCount: wc.orders_count || 0, totalSpent: parseFloat(wc.total_spent) || 0,
      createdAt: new Date(wc.date_created),
    },
    update: {
      email: wc.email, name, phone: wc.billing?.phone || null,
      ordersCount: wc.orders_count || 0, totalSpent: parseFloat(wc.total_spent) || 0,
    },
  });

  // Upsert billing address
  if (wc.billing?.address_1) {
    const existing = await prisma.address.findFirst({
      where: { userId: user.id, label: 'Billing' },
    });
    const addrData = {
      firstName: wc.billing.first_name, lastName: wc.billing.last_name,
      street1: wc.billing.address_1, street2: wc.billing.address_2 || null,
      city: wc.billing.city, province: wc.billing.state,
      postalCode: wc.billing.postcode, country: wc.billing.country || 'CA',
      phone: wc.billing.phone || null,
    };
    if (existing) {
      await prisma.address.update({ where: { id: existing.id }, data: addrData });
    } else {
      await prisma.address.create({
        data: { userId: user.id, label: 'Billing', isDefault: true, ...addrData },
      });
    }
  }

  // Upsert shipping address
  if (wc.shipping?.address_1) {
    const existing = await prisma.address.findFirst({
      where: { userId: user.id, label: 'Shipping' },
    });
    const addrData = {
      firstName: wc.shipping.first_name, lastName: wc.shipping.last_name,
      street1: wc.shipping.address_1, street2: wc.shipping.address_2 || null,
      city: wc.shipping.city, province: wc.shipping.state,
      postalCode: wc.shipping.postcode, country: wc.shipping.country || 'CA',
      phone: wc.shipping.phone || null,
    };
    if (existing) {
      await prisma.address.update({ where: { id: existing.id }, data: addrData });
    } else {
      await prisma.address.create({
        data: { userId: user.id, label: 'Shipping', ...addrData },
      });
    }
  }

  log.wc.info("Customer synced", { wcCustomerId: wc.id, email: wc.email, topic });
}

// ─── Product Handler ─────────────────────────────────────────
// WC v3 webhook payload includes full product data

async function handleProduct(wc: any, topic: string) {
  if (topic.includes('deleted')) {
    // Soft delete — mark as discontinued
    const existing = await prisma.product.findUnique({ where: { wcId: wc.id } });
    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: { status: 'DISCONTINUED' },
      });
      log.wc.info("Product marked DISCONTINUED", { wcProductId: wc.id });
    }
    return;
  }

  // v3 webhook payload has full product fields
  const category = wc.categories?.[0]?.name || 'Uncategorized';
  const subcategory = wc.categories?.[1]?.name || null;

  // Skip excluded categories (nicotine, mushrooms, sexual enhancement, etc.)
  const allCats = (wc.categories || []).map((c: any) => c.name);
  if (allCats.some((c: string) => isExcludedCategory(c)) || isExcludedCategory(category)) {
    log.wc.info("Product skipped — excluded category", { wcProductId: wc.id, name: wc.name, category });
    // If it already exists in DB, mark it as discontinued
    const existing = await prisma.product.findUnique({ where: { wcId: wc.id } });
    if (existing) {
      await prisma.product.update({ where: { id: existing.id }, data: { status: 'DISCONTINUED' } });
    }
    return;
  }

  const price = parseFloat(wc.price) || parseFloat(wc.regular_price) || 0;
  const salePrice = wc.sale_price ? parseFloat(wc.sale_price) : null;

  const getAttr = (name: string) =>
    wc.attributes?.find((a: any) => a.name.toLowerCase() === name.toLowerCase())?.options?.[0] || null;

  const stockStatus = wc.stock_status === 'instock' ? 'ACTIVE' :
    wc.stock_status === 'outofstock' ? 'OUT_OF_STOCK' : 'ACTIVE';

  await prisma.product.upsert({
    where: { wcId: wc.id },
    create: {
      wcId: wc.id, slug: wc.slug, name: wc.name, category, subcategory,
      price, salePrice: salePrice && salePrice < price ? salePrice : null,
      sku: wc.sku || null, canonicalUrl: wc.permalink || '',
      path: `/product/${wc.slug}/`, image: wc.images?.[0]?.src || '',
      altText: wc.images?.[0]?.alt || wc.name,
      metaDescription: (wc.short_description || '').replace(/<[^>]*>/g, '').slice(0, 160),
      shortDescription: (wc.short_description || '').replace(/<[^>]*>/g, ''),
      longDescription: wc.description || null,
      featured: wc.featured || false, status: stockStatus,
      specs: {
        create: {
          thc: getAttr('THC'), cbd: getAttr('CBD'),
          type: getAttr('Type') || getAttr('Strain Type'),
          weight: getAttr('Weight') || getAttr('Size'),
        },
      },
      images: {
        create: (wc.images || []).map((img: any, i: number) => ({
          url: img.src, altText: img.alt || wc.name, position: i,
        })),
      },
      inventory: {
        create: {
          quantity: wc.stock_quantity ?? (wc.stock_status === 'instock' ? 100 : 0),
          backorder: wc.backorders_allowed || false,
        },
      },
    },
    update: {
      name: wc.name, category, subcategory, price,
      salePrice: salePrice && salePrice < price ? salePrice : null,
      sku: wc.sku || null, canonicalUrl: wc.permalink || '',
      image: wc.images?.[0]?.src || '', altText: wc.images?.[0]?.alt || wc.name,
      shortDescription: (wc.short_description || '').replace(/<[^>]*>/g, ''),
      longDescription: wc.description || null,
      featured: wc.featured || false, status: stockStatus,
    },
  });

  // Update inventory
  const product = await prisma.product.findUnique({ where: { wcId: wc.id } });
  if (product) {
    await prisma.inventory.upsert({
      where: { productId: product.id },
      create: {
        productId: product.id,
        quantity: wc.stock_quantity ?? (wc.stock_status === 'instock' ? 100 : 0),
        backorder: wc.backorders_allowed || false,
      },
      update: {
        quantity: wc.stock_quantity ?? (wc.stock_status === 'instock' ? 100 : 0),
        backorder: wc.backorders_allowed || false,
      },
    });

    // Update images
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    for (const [i, img] of (wc.images || []).entries()) {
      await prisma.productImage.create({
        data: { productId: product.id, url: img.src, altText: img.alt || wc.name, position: i },
      });
    }

    // Update specs
    await prisma.productSpec.upsert({
      where: { productId: product.id },
      create: {
        productId: product.id,
        thc: getAttr('THC'), cbd: getAttr('CBD'),
        type: getAttr('Type') || getAttr('Strain Type'),
        weight: getAttr('Weight') || getAttr('Size'),
      },
      update: {
        thc: getAttr('THC'), cbd: getAttr('CBD'),
        type: getAttr('Type') || getAttr('Strain Type'),
        weight: getAttr('Weight') || getAttr('Size'),
      },
    });
  }

  log.wc.info("Product synced", { wcProductId: wc.id, name: wc.name, stockStatus });
}

// ─── Coupon Handler ──────────────────────────────────────────

async function handleCoupon(wc: any, topic: string) {
  if (topic.includes('deleted')) {
    await prisma.coupon.updateMany({
      where: { code: wc.code },
      data: { active: false },
    });
    log.wc.info("Coupon deactivated", { code: wc.code });
    return;
  }

  const typeMap: Record<string, string> = {
    'percent': 'PERCENTAGE', 'fixed_cart': 'FIXED_AMOUNT', 'fixed_product': 'FIXED_AMOUNT',
  };

  await prisma.coupon.upsert({
    where: { code: wc.code },
    create: {
      code: wc.code, description: wc.description || null,
      type: (typeMap[wc.discount_type] || 'PERCENTAGE') as any,
      value: parseFloat(wc.amount) || 0,
      minOrderTotal: wc.minimum_amount ? parseFloat(wc.minimum_amount) : null,
      maxUses: wc.usage_limit || null, usedCount: wc.usage_count || 0,
      perCustomer: wc.usage_limit_per_user || 1,
      validFrom: wc.date_created ? new Date(wc.date_created) : new Date(),
      validUntil: wc.date_expires ? new Date(wc.date_expires) : null,
      active: true,
    },
    update: {
      description: wc.description || null,
      type: (typeMap[wc.discount_type] || 'PERCENTAGE') as any,
      value: parseFloat(wc.amount) || 0,
      usedCount: wc.usage_count || 0,
      validUntil: wc.date_expires ? new Date(wc.date_expires) : null,
      active: true,
    },
  });

  log.wc.info("Coupon synced", { code: wc.code, discountType: wc.discount_type, amount: wc.amount });
}

// ─── Main Handler ────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // Verify HMAC signature
  const wcWebhookSecret = process.env.WC_WEBHOOK_SECRET;
  if (wcWebhookSecret) {
    const signature = req.headers.get('x-wc-webhook-signature') || '';
    if (!signature || !verifyWebhookSignature(rawBody, signature, wcWebhookSecret)) {
      log.wc.error("Invalid signature");
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  }

  const topic = req.headers.get('x-wc-webhook-topic') || '';
  const resource = req.headers.get('x-wc-webhook-resource') || '';

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // WC ping on webhook creation
  if (topic === 'action.woocommerce_webhook_ping' || !payload.id) {
    return NextResponse.json({ success: true, message: 'pong' });
  }

  log.wc.info("Webhook received", { topic, resource, id: payload.id });

  try {
    switch (resource) {
      case 'order':
        await handleOrder(payload, topic);
        break;
      case 'customer':
        await handleCustomer(payload, topic);
        break;
      case 'product':
        await handleProduct(payload, topic);
        break;
      case 'coupon':
        await handleCoupon(payload, topic);
        break;
      default:
        log.wc.warn("Unhandled resource", { resource, topic });
    }

    return NextResponse.json({ success: true, topic, resource, id: payload.id });
  } catch (err: any) {
    log.wc.error("Error processing webhook", { topic, error: err.message });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
