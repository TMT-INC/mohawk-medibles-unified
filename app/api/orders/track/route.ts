/**
 * GET /api/orders/track?orderNumber=MM-XXXXX
 * Public endpoint — returns order tracking details.
 * Rate limited to prevent abuse.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

// Simple in-memory rate limiter (per IP, 30 requests per minute)
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW = 60_000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// Carrier tracking URL builders
const CARRIER_TRACKING_URLS: Record<string, (tn: string) => string> = {
  canada_post: (tn) => `https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=${tn}`,
  purolator: (tn) => `https://www.purolator.com/en/shipping/tracker?pin=${tn}`,
  ups: (tn) => `https://www.ups.com/track?tracknum=${tn}`,
  fedex: (tn) => `https://www.fedex.com/fedextrack/?trknbr=${tn}`,
};

export async function GET(req: NextRequest) {
  // Key the limiter on the platform-set client IP, never the spoofable
  // leftmost x-forwarded-for hop (which would let an attacker rotate buckets).
  const ip =
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const orderNumber = req.nextUrl.searchParams.get("orderNumber");
  if (!orderNumber) {
    return NextResponse.json({ error: "orderNumber is required" }, { status: 400 });
  }
  const email = req.nextUrl.searchParams.get("email");

  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: {
        orderNumber: true,
        userId: true,
        user: { select: { email: true } },
        status: true,
        total: true,
        trackingNumber: true,
        carrier: true,
        shippedAt: true,
        deliveredAt: true,
        createdAt: true,
        shippingData: true,
        items: {
          select: { name: true, quantity: true, price: true },
        },
        statusHistory: {
          orderBy: { createdAt: "desc" },
          select: { id: true, status: true, note: true, createdAt: true },
        },
        address: {
          select: {
            firstName: true,
            lastName: true,
            street1: true,
            city: true,
            province: true,
            postalCode: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // ── Authorization ───────────────────────────────────────────
    // Order numbers are sequential (MM-{wcId}), so an unguarded lookup is an
    // enumerable full-PII scrape. Require EITHER a verified session that owns
    // the order, OR a matching billing email. Respond 404 on failure so the
    // endpoint never confirms whether an order number exists.
    const session = await getSessionUser();
    const isOwner = !!session && order.userId === session.userId;
    const emailMatches =
      !!email &&
      !!order.user?.email &&
      email.trim().toLowerCase() === order.user.email.toLowerCase();
    if (!isOwner && !emailMatches) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Calculate estimated delivery (shipped + 5 business days, or created + 7)
    let estimatedDelivery: string | null = null;
    if (order.status !== "DELIVERED" && order.status !== "COMPLETED" && order.status !== "CANCELLED") {
      const baseDate = order.shippedAt || order.createdAt;
      const est = new Date(baseDate);
      const daysToAdd = order.shippedAt ? 5 : 7;
      let added = 0;
      while (added < daysToAdd) {
        est.setDate(est.getDate() + 1);
        const day = est.getDay();
        if (day !== 0 && day !== 6) added++;
      }
      estimatedDelivery = est.toISOString();
    }

    // Build carrier tracking URL
    let carrierTrackingUrl: string | null = null;
    if (order.trackingNumber && order.carrier) {
      const builder = CARRIER_TRACKING_URLS[order.carrier];
      if (builder) carrierTrackingUrl = builder(order.trackingNumber);
    }

    // Parse shipping address
    let shippingAddress: { name: string; street: string; city: string; province: string; postalCode: string } | null = null;
    if (order.address) {
      shippingAddress = {
        name: `${order.address.firstName} ${order.address.lastName}`.trim(),
        street: order.address.street1,
        city: order.address.city,
        province: order.address.province,
        postalCode: order.address.postalCode,
      };
    } else if (order.shippingData) {
      try {
        const sd = JSON.parse(order.shippingData);
        shippingAddress = {
          name: `${sd.first_name || sd.firstName || ""} ${sd.last_name || sd.lastName || ""}`.trim(),
          street: sd.address_1 || sd.street1 || "",
          city: sd.city || "",
          province: sd.state || sd.province || "",
          postalCode: sd.postcode || sd.postalCode || "",
        };
      } catch {
        // Ignore parse errors
      }
    }

    return NextResponse.json({
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total,
      trackingNumber: order.trackingNumber,
      carrier: order.carrier,
      carrierTrackingUrl,
      shippedAt: order.shippedAt?.toISOString() ?? null,
      deliveredAt: order.deliveredAt?.toISOString() ?? null,
      createdAt: order.createdAt.toISOString(),
      estimatedDelivery,
      items: order.items,
      statusHistory: order.statusHistory.map((h) => ({
        id: h.id,
        status: h.status,
        note: h.note,
        createdAt: h.createdAt.toISOString(),
      })),
      shippingAddress,
    });
  } catch (err) {
    console.error("[orders/track] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
