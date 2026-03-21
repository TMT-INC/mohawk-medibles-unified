/**
 * Admin Settings API — API Keys, Business Config, Environment Management
 * GET  /api/admin/settings?section=api-keys|business|email|all
 * POST /api/admin/settings { action: "save-api-key" | "update-business" | "test-connection" }
 *
 * This is the master control panel for swapping dev→prod API keys.
 * All keys are stored encrypted in the ApiKey table.
 */
import { NextRequest, NextResponse } from "next/server";
import { log } from "@/lib/logger";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";

// Services that can have API keys managed
const MANAGED_SERVICES = [
    { service: "stripe", label: "Stripe Payments", required: true, fields: ["secret_key", "publishable_key", "webhook_secret"] },
    { service: "shipstation", label: "ShipStation Fulfillment", required: true, fields: ["api_key", "api_secret", "webhook_secret"] },
    { service: "resend", label: "Resend Email", required: true, fields: ["api_key"] },
    { service: "openai", label: "OpenAI (Claude/GPT)", required: false, fields: ["api_key"] },
    { service: "google", label: "Google (Analytics, Merchant)", required: false, fields: ["ga_measurement_id", "merchant_id", "site_verification"] },
    { service: "sentry", label: "Sentry Error Monitoring", required: false, fields: ["dsn"] },
];

export async function GET(req: NextRequest) {
    const limited = await applyRateLimit(req, RATE_LIMITS.admin);
    if (limited) return limited;

    const section = req.nextUrl.searchParams.get("section") || "all";

    try {
        const { prisma } = await import("@/lib/db");

        switch (section) {
            case "api-keys": {
                const keys = await prisma.apiKey.findMany({
                    orderBy: [{ service: "asc" }, { environment: "asc" }],
                });

                // Mask key values for security — only show last 4 chars
                const maskedKeys = keys.map((k: any) => ({
                    ...k,
                    keyValue: k.keyValue ? `${"•".repeat(Math.max(0, k.keyValue.length - 4))}${k.keyValue.slice(-4)}` : "",
                }));

                return NextResponse.json({
                    keys: maskedKeys,
                    services: MANAGED_SERVICES,
                    activeEnvironment: process.env.NODE_ENV || "development",
                });
            }

            case "business": {
                // Business configuration from env vars (read-only display)
                return NextResponse.json({
                    siteName: "Mohawk Medibles",
                    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://mohawkmedibles.co",
                    emailFrom: process.env.EMAIL_FROM || "orders@mohawkmedibles.ca",
                    currency: "CAD",
                    timezone: "America/Toronto",
                    agentGatewayUrl: process.env.AGENT_GATEWAY_URL || "http://localhost:8000",
                    nodeEnv: process.env.NODE_ENV || "development",
                });
            }

            case "environment": {
                // Show which environment is active for each service
                const keys = await prisma.apiKey.findMany({
                    where: { isActive: true },
                    select: { service: true, environment: true, label: true, lastUsed: true },
                });

                const envStatus = MANAGED_SERVICES.map(svc => {
                    const active = keys.find((k: { service: string; environment: string; label: string; lastUsed: Date | null }) => k.service === svc.service);
                    return {
                        service: svc.service,
                        label: svc.label,
                        required: svc.required,
                        environment: active?.environment || "not-configured",
                        lastUsed: active?.lastUsed,
                        configured: Boolean(active),
                    };
                });

                return NextResponse.json({ services: envStatus });
            }

            default: {
                // All settings combined
                const [keys, auditLogs] = await Promise.all([
                    prisma.apiKey.findMany({
                        select: { service: true, label: true, environment: true, isActive: true, lastUsed: true, updatedAt: true },
                        orderBy: { service: "asc" },
                    }),
                    prisma.auditLog.findMany({
                        orderBy: { createdAt: "desc" },
                        take: 20,
                    }).catch(() => []),
                ]);

                return NextResponse.json({
                    services: MANAGED_SERVICES,
                    configuredKeys: keys,
                    recentAudit: auditLogs,
                    environment: process.env.NODE_ENV || "development",
                    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://mohawkmedibles.co",
                });
            }
        }
    } catch (error) {
        log.admin.error("Settings GET error", { error: error instanceof Error ? error.message : "Unknown" });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const limited = await applyRateLimit(req, RATE_LIMITS.admin);
    if (limited) return limited;

    // Only SUPER_ADMIN can modify settings
    const role = req.headers.get("x-user-role");
    if (role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Only Super Admins can modify settings" }, { status: 403 });
    }

    let body: Record<string, unknown>;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const action = body.action as string;

    try {
        const { prisma } = await import("@/lib/db");

        switch (action) {
            case "save-api-key": {
                const { service, environment, label, keyValue } = body as {
                    service: string; environment: string; label: string; keyValue: string;
                };

                if (!service || !environment || !keyValue) {
                    return NextResponse.json({ error: "service, environment, and keyValue required" }, { status: 400 });
                }

                const apiKey = await prisma.apiKey.upsert({
                    where: { service_environment: { service, environment } },
                    update: { keyValue, label: label || service, isActive: true },
                    create: { service, environment, label: label || service, keyValue, isActive: true },
                });

                // Audit log
                await prisma.auditLog.create({
                    data: {
                        userId: req.headers.get("x-user-id") || "system",
                        action: "settings.api-key-save",
                        entity: "ApiKey",
                        entityId: apiKey.id,
                        details: JSON.stringify({ service, environment }),
                    },
                }).catch(() => {}); // Non-blocking

                return NextResponse.json({
                    success: true,
                    message: `API key saved for ${service} (${environment})`,
                });
            }

            case "switch-environment": {
                const { service, environment } = body as { service: string; environment: string };
                if (!service || !environment) {
                    return NextResponse.json({ error: "service and environment required" }, { status: 400 });
                }

                // Deactivate all keys for this service, then activate the target environment
                await prisma.apiKey.updateMany({
                    where: { service },
                    data: { isActive: false },
                });
                await prisma.apiKey.updateMany({
                    where: { service, environment },
                    data: { isActive: true },
                });

                // Audit log
                await prisma.auditLog.create({
                    data: {
                        userId: req.headers.get("x-user-id") || "system",
                        action: "settings.environment-switch",
                        entity: "ApiKey",
                        details: JSON.stringify({ service, environment }),
                    },
                }).catch(() => {});

                return NextResponse.json({
                    success: true,
                    message: `Switched ${service} to ${environment}`,
                });
            }

            case "test-connection": {
                const { service } = body as { service: string };
                let testResult = { success: false, message: "Unknown service" };

                switch (service) {
                    case "stripe":
                        try {
                            const res = await fetch("https://api.stripe.com/v1/balance", {
                                headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
                            });
                            testResult = { success: res.ok, message: res.ok ? "Connected" : `Error: ${res.status}` };
                        } catch (e) {
                            testResult = { success: false, message: `Connection failed: ${e instanceof Error ? e.message : "unknown"}` };
                        }
                        break;

                    case "resend":
                        try {
                            const res = await fetch("https://api.resend.com/domains", {
                                headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
                            });
                            testResult = { success: res.ok, message: res.ok ? "Connected" : `Error: ${res.status}` };
                        } catch (e) {
                            testResult = { success: false, message: `Connection failed: ${e instanceof Error ? e.message : "unknown"}` };
                        }
                        break;

                    case "database":
                        try {
                            await prisma.$queryRaw`SELECT 1`;
                            testResult = { success: true, message: "Database connected" };
                        } catch (e) {
                            testResult = { success: false, message: `Database error: ${e instanceof Error ? e.message : "unknown"}` };
                        }
                        break;

                    default:
                        testResult = { success: false, message: `Test not implemented for ${service}` };
                }

                return NextResponse.json(testResult);
            }

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }
    } catch (error) {
        log.admin.error("Settings POST error", { error: error instanceof Error ? error.message : "Unknown" });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
