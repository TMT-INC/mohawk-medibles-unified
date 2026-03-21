/**
 * Checkout API — Creates Stripe checkout session
 * POST /api/checkout { items: [...], couponCode?: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { createCheckoutSession, type CheckoutItem } from "@/lib/stripe";
import { getAllProducts } from "@/lib/products";
import { prisma } from "@/lib/db";
import { verifyCsrf } from "@/lib/csrf";
import { log } from "@/lib/logger";

export async function POST(req: NextRequest) {
    const limited = await applyRateLimit(req, RATE_LIMITS.api);
    if (limited) return limited;

    // CSRF protection
    const csrfError = verifyCsrf(req);
    if (csrfError) return csrfError;

    try {
        const body = await req.json();
        const { items, email, couponCode } = body as {
            items: { id: string; name: string; price: number; quantity: number }[];
            email?: string;
            couponCode?: string;
        };

        if (!items?.length) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }

        // Validate items against product catalog
        const PRODUCTS = await getAllProducts();
        const validatedItems: CheckoutItem[] = [];
        let subtotal = 0;

        for (const item of items) {
            // Find product by ID in catalog
            const catalogProduct = PRODUCTS.find((p) => String(p.id) === item.id);
            if (!catalogProduct) {
                return NextResponse.json(
                    { error: `Product not found: ${item.id}` },
                    { status: 400 }
                );
            }
            if (catalogProduct.price <= 0) {
                return NextResponse.json(
                    { error: `${catalogProduct.name} requires a price quote — please contact us.` },
                    { status: 400 }
                );
            }

            const qty = Math.min(Math.max(1, item.quantity), 10);
            subtotal += catalogProduct.price * qty;

            validatedItems.push({
                name: catalogProduct.name,
                price: catalogProduct.price, // Use catalog price, not client-sent
                quantity: qty,
                productId: String(catalogProduct.id),
            });
        }

        // ─── Inventory Validation ──────────────────────────────
        const productIds = validatedItems.map((item) => parseInt(item.productId));
        const inventoryRecords = await prisma.inventory.findMany({
            where: { productId: { in: productIds } },
        });
        const inventoryMap = new Map(inventoryRecords.map((inv: any) => [inv.productId, inv]));

        for (const item of validatedItems) {
            const inv = inventoryMap.get(parseInt(item.productId)) as { quantity: number; backorder: boolean } | undefined;
            if (inv) {
                if (inv.quantity <= 0 && !inv.backorder) {
                    return NextResponse.json(
                        { error: `${item.name} is currently out of stock.` },
                        { status: 400 }
                    );
                }
                if (inv.quantity < item.quantity && !inv.backorder) {
                    return NextResponse.json(
                        { error: `Only ${inv.quantity} of ${item.name} available (requested ${item.quantity}).` },
                        { status: 400 }
                    );
                }
            }
            // If no inventory record exists, allow purchase (unlimited stock assumed)
        }

        // ─── Coupon Validation (server-side) ─────────────────
        let discountAmount = 0;
        let freeShipping = false;
        let couponId: number | null = null;

        if (couponCode) {
            try {
                const coupon = await prisma.coupon.findUnique({
                    where: { code: couponCode.toUpperCase() },
                });

                if (coupon && coupon.active) {
                    const now = new Date();
                    const validFrom = coupon.validFrom <= now;
                    const validUntil = !coupon.validUntil || coupon.validUntil >= now;
                    const withinUsage = !coupon.maxUses || coupon.usedCount < coupon.maxUses;
                    const meetsMinimum = !coupon.minOrderTotal || subtotal >= coupon.minOrderTotal;

                    if (validFrom && validUntil && withinUsage && meetsMinimum) {
                        couponId = coupon.id;

                        switch (coupon.type) {
                            case "PERCENTAGE":
                                discountAmount = +(subtotal * (coupon.value / 100)).toFixed(2);
                                break;
                            case "FIXED_AMOUNT":
                                discountAmount = Math.min(coupon.value, subtotal);
                                break;
                            case "FREE_SHIPPING":
                                freeShipping = true;
                                break;
                        }

                        // Increment usage counter
                        await prisma.coupon.update({
                            where: { id: coupon.id },
                            data: { usedCount: { increment: 1 } },
                        });
                    }
                }
            } catch (e) {
                log.checkout.warn("Coupon validation failed", { error: e instanceof Error ? e.message : "Unknown" });
                // Don't block checkout if coupon fails — just skip discount
            }
        }

        // Apply discount to items (create a discount line item for Stripe)
        const session = await createCheckoutSession(
            validatedItems,
            email,
            discountAmount,
            freeShipping,
            couponCode?.toUpperCase()
        );

        return NextResponse.json({
            sessionId: session.id,
            url: session.url,
        });
    } catch (e) {
        log.checkout.error("Checkout error", { error: e instanceof Error ? e.message : "Unknown" });
        return NextResponse.json(
            { error: "Checkout failed", detail: e instanceof Error ? e.message : "Unknown" },
            { status: 500 }
        );
    }
}
