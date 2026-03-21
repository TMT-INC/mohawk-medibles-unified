// Mohawk Medibles — WooCommerce Checkout API
// Creates orders in WC backend with tenant source tracking.
// Supports: e-Transfer (instructions), Credit Card & Crypto (redirect to WC pay page).

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentTenant } from '@/lib/tenant';
import { verifyCsrf } from '@/lib/csrf';

const WC_STORE_URL = process.env.WC_STORE_URL || 'https://mohawkmedibles.ca';
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY || '';
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET || '';

// ─── Types ───────────────────────────────────────────────────

interface CheckoutItem {
  productId: number; // WC product ID (wcId)
  quantity: number;
  name?: string;
}

interface CheckoutRequest {
  items: CheckoutItem[];
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    address_1: string;
    address_2?: string;
    city: string;
    state: string; // Province code: "ON", "BC"
    postcode: string;
    country?: string;
  };
  shipping?: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2?: string;
    city: string;
    state: string;
    postcode: string;
    country?: string;
  };
  payment_method: string; // "paygobillingcc", "digipay_etransfer_manual", "wcpg_crypto"
  customer_note?: string;
  coupon_codes?: string[];
}

// ─── WC Order Creation ───────────────────────────────────────

async function createWCOrder(data: CheckoutRequest, tenantSlug: string, tenantDomain: string) {
  const url = `${WC_STORE_URL}/wp-json/wc/v3/orders`;
  const auth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString('base64');

  const billing = { ...data.billing, country: data.billing.country || 'CA' };
  const shipping = data.shipping
    ? { ...data.shipping, country: data.shipping.country || 'CA' }
    : billing;

  const body = {
    payment_method: data.payment_method,
    payment_method_title: getPaymentMethodTitle(data.payment_method),
    set_paid: false,
    status: data.payment_method === 'digipay_etransfer_manual' ? 'on-hold' : 'pending',
    billing,
    shipping,
    line_items: data.items.map((item) => ({
      product_id: item.productId,
      quantity: Math.min(Math.max(item.quantity, 1), 50), // Clamp 1-50
    })),
    coupon_lines: (data.coupon_codes || []).map((code) => ({ code })),
    customer_note: data.customer_note || '',
    meta_data: [
      { key: '_source_site', value: tenantDomain },
      { key: '_source_tenant', value: tenantSlug },
      { key: '_checkout_origin', value: 'niche-funnel' },
      { key: '_checkout_timestamp', value: new Date().toISOString() },
    ],
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`WC API error ${response.status}: ${JSON.stringify(error)}`);
  }

  return response.json();
}

function getPaymentMethodTitle(method: string): string {
  const titles: Record<string, string> = {
    paygobillingcc: 'Credit Card',
    digipay_etransfer_manual: 'Interac e-Transfer (Send Money)',
    wcpg_crypto: 'Pay with Crypto',
    bacs: 'Direct Bank Transfer',
    cod: 'Cash on Delivery',
  };
  return titles[method] || method;
}

// ─── POST Handler ────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // CSRF protection
  const csrfError = verifyCsrf(req);
  if (csrfError) return csrfError;

  try {
    const tenant = await getCurrentTenant();
    const body: CheckoutRequest = await req.json();

    // ── Validation ─────────────────────────────────────────
    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }
    if (!body.billing?.email || !body.billing?.first_name || !body.billing?.last_name) {
      return NextResponse.json({ error: 'Billing info required' }, { status: 400 });
    }
    if (!body.payment_method) {
      return NextResponse.json({ error: 'Payment method required' }, { status: 400 });
    }

    // Check if tenant restricts payment methods
    if (tenant.paymentMethods.length > 0 && !tenant.paymentMethods.includes(body.payment_method)) {
      return NextResponse.json({ error: 'Payment method not available' }, { status: 400 });
    }

    // ── Create order in WooCommerce ────────────────────────
    const wcOrder = await createWCOrder(body, tenant.slug, tenant.domain);

    // ── Save order in local DB ─────────────────────────────
    // Find or create user by email
    let user = await prisma.user.findUnique({ where: { email: body.billing.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: body.billing.email,
          name: `${body.billing.first_name} ${body.billing.last_name}`,
          phone: body.billing.phone || null,
          passwordHash: '', // Guest — no password until they register
          role: 'CUSTOMER',
        },
      });
    }

    const order = await prisma.order.create({
      data: {
        wcOrderId: wcOrder.id,
        wcOrderKey: wcOrder.order_key,
        orderNumber: `WC-${wcOrder.number || wcOrder.id}`,
        userId: user.id,
        status: body.payment_method === 'digipay_etransfer_manual' ? 'ON_HOLD' : 'PENDING',
        subtotal: parseFloat(wcOrder.total) - parseFloat(wcOrder.shipping_total || '0'),
        shippingCost: parseFloat(wcOrder.shipping_total || '0'),
        tax: parseFloat(wcOrder.total_tax || '0'),
        discount: parseFloat(wcOrder.discount_total || '0'),
        total: parseFloat(wcOrder.total),
        paymentMethod: body.payment_method,
        paymentMethodTitle: getPaymentMethodTitle(body.payment_method),
        sourceTenant: tenant.slug,
        sourceDomain: tenant.domain,
        billingData: JSON.stringify(wcOrder.billing),
        shippingData: JSON.stringify(wcOrder.shipping),
        customerNote: body.customer_note || null,
      },
    });

    // Save line items
    for (const item of wcOrder.line_items || []) {
      const product = await prisma.product.findUnique({ where: { wcId: item.product_id } });
      if (product) {
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: product.id,
            quantity: item.quantity,
            price: parseFloat(item.price),
            total: parseFloat(item.total),
            name: item.name,
          },
        });
      }
    }

    // ── Build response based on payment method ─────────────
    const redirectUrl = tenant.checkoutRedirectUrl || `https://${tenant.domain}`;

    if (body.payment_method === 'digipay_etransfer_manual') {
      // e-Transfer: return instructions, no redirect needed
      return NextResponse.json({
        success: true,
        orderId: wcOrder.id,
        orderNumber: wcOrder.number,
        orderKey: wcOrder.order_key,
        status: 'on-hold',
        paymentMethod: 'etransfer',
        total: wcOrder.total,
        currency: wcOrder.currency,
        etransfer: {
          instructions: tenant.etransferInstructions ||
            'Please send your Interac e-Transfer to the email provided in your order confirmation. Use your order number as the reference.',
          orderReference: `WC-${wcOrder.number}`,
        },
        confirmationUrl: `${redirectUrl}/checkout/success?order=${wcOrder.id}&key=${wcOrder.order_key}`,
      });
    }

    // CC or Crypto: redirect to WC pay-for-order page
    const payUrl = `${WC_STORE_URL}/checkout/order-pay/${wcOrder.id}/?pay_for_order=true&key=${wcOrder.order_key}`;

    return NextResponse.json({
      success: true,
      orderId: wcOrder.id,
      orderNumber: wcOrder.number,
      orderKey: wcOrder.order_key,
      status: 'pending',
      paymentMethod: body.payment_method,
      total: wcOrder.total,
      currency: wcOrder.currency,
      payUrl, // Redirect customer here to complete payment
      returnUrl: `${redirectUrl}/checkout/success?order=${wcOrder.id}&key=${wcOrder.order_key}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Checkout failed';
    // Don't log full error object (may contain WC API credentials in headers)
    console.error('[WC Checkout] Error:', message);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}

// ─── GET: Available payment methods for current tenant ───────

export async function GET() {
  const tenant = await getCurrentTenant();

  // All WC payment gateways
  const allMethods = [
    {
      id: 'paygobillingcc',
      title: 'Credit Card',
      description: 'Pay securely with Visa, Mastercard, or Amex.',
      icon: 'credit-card',
    },
    {
      id: 'digipay_etransfer_manual',
      title: 'Interac e-Transfer',
      description: 'Send money via Interac e-Transfer. Instructions provided after order.',
      icon: 'interac',
    },
    {
      id: 'wcpg_crypto',
      title: 'Pay with Crypto',
      description: 'Pay with Bitcoin, Ethereum, or other cryptocurrencies.',
      icon: 'crypto',
    },
  ];

  // Filter by tenant config (empty = all available)
  const methods = tenant.paymentMethods.length > 0
    ? allMethods.filter((m) => tenant.paymentMethods.includes(m.id))
    : allMethods;

  return NextResponse.json({
    tenant: tenant.slug,
    methods,
    shipping: {
      freeShippingMin: 199,
      flatRate: 15,
      currency: 'CAD',
    },
  });
}
