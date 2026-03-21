/**
 * Support Agent API — Hardened with rate limiting + validation
 * POST /api/support
 * Powers the voice agent with 5 intents.
 */
import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { SupportIntent, validateBody } from "@/lib/validation";
import { log } from "@/lib/logger";

export async function POST(req: NextRequest) {
    // ── Rate limit ──────────────────────────────────────────
    const limited = await applyRateLimit(req, RATE_LIMITS.support);
    if (limited) return limited;

    // ── Parse & validate ────────────────────────────────────
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = validateBody(SupportIntent, body);
    if (!parsed.success) return parsed.error;

    const { intent, params } = parsed.data;

    try {
        const { prisma } = await import("@/lib/db");

        switch (intent) {
            case "track_order": {
                if (!params.orderNumber) {
                    return NextResponse.json({
                        voice: "I'd be happy to track your order. Could you please provide your order number? It starts with MM-.",
                        action: "request_input",
                        field: "orderNumber",
                    });
                }
                const order = await prisma.order.findUnique({
                    where: { orderNumber: params.orderNumber },
                    select: {
                        orderNumber: true,
                        status: true,
                        trackingNumber: true,
                        carrier: true,
                        shippedAt: true,
                        deliveredAt: true,
                    },
                });
                if (!order) {
                    return NextResponse.json({
                        voice: `I couldn't find order ${params.orderNumber}. Please double-check the number and try again.`,
                        action: "not_found",
                    });
                }
                const statusMap: Record<string, string> = {
                    PENDING: "is being prepared",
                    PROCESSING: "is being processed",
                    SHIPPED: `has been shipped via ${order.carrier || "our courier"}`,
                    IN_TRANSIT: `is on its way! Tracking number: ${order.trackingNumber}`,
                    DELIVERED: `was delivered on ${order.deliveredAt?.toLocaleDateString() || "recently"}`,
                    COMPLETED: "has been completed",
                };
                return NextResponse.json({
                    voice: `Your order ${order.orderNumber} ${statusMap[order.status] || `is currently ${order.status.toLowerCase()}`}. ${order.trackingNumber ? `Your tracking number is ${order.trackingNumber}.` : ""}`,
                    data: order,
                    action: "display_tracking",
                });
            }

            case "order_history": {
                if (!params.email) {
                    return NextResponse.json({
                        voice: "I can look up your order history. What's the email address on your account?",
                        action: "request_input",
                        field: "email",
                    });
                }
                const user = await prisma.user.findUnique({
                    where: { email: params.email },
                    include: {
                        orders: {
                            take: 5,
                            orderBy: { createdAt: "desc" },
                            select: { orderNumber: true, status: true, total: true, createdAt: true },
                        },
                    },
                });
                if (!user || user.orders.length === 0) {
                    return NextResponse.json({
                        voice: "I don't have any orders on file for that email. Would you like to place a new order?",
                        action: "no_history",
                    });
                }
                const orderList = user.orders
                    .map((o: { orderNumber: string; total: number; status: string }) => `${o.orderNumber} — $${o.total.toFixed(2)} (${o.status.toLowerCase()})`)
                    .join(", ");
                return NextResponse.json({
                    voice: `I found ${user.orders.length} recent orders: ${orderList}. Would you like details on any of these?`,
                    data: user.orders,
                    action: "display_history",
                });
            }

            case "order_status": {
                if (!params.orderNumber) {
                    return NextResponse.json({
                        voice: "Sure, I can check your order status. What's your order number?",
                        action: "request_input",
                        field: "orderNumber",
                    });
                }
                const order = await prisma.order.findUnique({
                    where: { orderNumber: params.orderNumber },
                    select: { orderNumber: true, status: true, total: true, createdAt: true },
                });
                if (!order) {
                    return NextResponse.json({
                        voice: `Order ${params.orderNumber} wasn't found. Could you verify the number?`,
                        action: "not_found",
                    });
                }
                return NextResponse.json({
                    voice: `Order ${order.orderNumber} placed on ${order.createdAt.toLocaleDateString()} for $${order.total.toFixed(2)} is currently ${order.status.toLowerCase().replace("_", " ")}.`,
                    data: order,
                    action: "display_status",
                });
            }

            case "return_request": {
                return NextResponse.json({
                    voice: "I understand you'd like to process a return. I'm connecting you with our support team who can help with that right away. One moment please.",
                    action: "escalate",
                    escalateTo: "support_team",
                    priority: "NORMAL",
                });
            }

            default: {
                return NextResponse.json({
                    voice: "Welcome to Mohawk Medibles! I can help you track orders, check order history, get order status, or process returns. What would you like to do?",
                    action: "show_menu",
                    capabilities: [
                        "Track an order",
                        "View order history",
                        "Check order status",
                        "Request a return",
                    ],
                });
            }
        }
    } catch (error) {
        log.support.error("Support API error", { error: error instanceof Error ? error.message : "Unknown" });
        return NextResponse.json({
            voice: "I'm having a bit of trouble right now. Please try again in a moment, or you can email us at support@mohawkmedibles.ca.",
            action: "error",
        }, { status: 500 });
    }
}
