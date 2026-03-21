/**
 * Account API — Mohawk Medibles
 * GET  /api/account?action=profile|orders|addresses
 * POST /api/account { action: "update-profile"|"update-password"|"add-address"|"delete-address" }
 *
 * All actions require authentication via mm-session cookie.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { verifySessionToken } from "@/lib/auth";
import { verifyCsrf } from "@/lib/csrf";
import { cookies } from "next/headers";

// ─── Session Decode (with signature verification) ────────────
async function getSessionUser(req: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get("mm-session")?.value;
    if (!token) return null;

    const payload = verifySessionToken(token);
    if (!payload) return null;
    return { userId: payload.sub, email: payload.email, role: payload.role };
}

// ─── GET: Read operations ────────────────────────────────────
export async function GET(req: NextRequest) {
    const limited = await applyRateLimit(req, RATE_LIMITS.api);
    if (limited) return limited;

    const session = await getSessionUser(req);
    if (!session) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const action = req.nextUrl.searchParams.get("action") || "profile";

    switch (action) {
        case "profile": {
            const user = await prisma.user.findUnique({
                where: { id: session.userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    phone: true,
                    role: true,
                    createdAt: true,
                },
            });
            if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
            return NextResponse.json({ user });
        }

        case "orders": {
            const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
            const limit = 10;
            const skip = (page - 1) * limit;

            const [orders, total] = await Promise.all([
                prisma.order.findMany({
                    where: { userId: session.userId },
                    orderBy: { createdAt: "desc" },
                    skip,
                    take: limit,
                    include: {
                        items: {
                            select: {
                                id: true,
                                name: true,
                                quantity: true,
                                price: true,
                            },
                        },
                        statusHistory: {
                            orderBy: { createdAt: "desc" },
                            take: 1,
                        },
                    },
                }),
                prisma.order.count({ where: { userId: session.userId } }),
            ]);

            return NextResponse.json({
                orders: orders.map((o: any) => ({
                    id: o.orderNumber,
                    date: o.createdAt.toISOString(),
                    status: o.status.toLowerCase(),
                    total: o.total,
                    items: o.items.length,
                    tracking: o.trackingNumber,
                    itemDetails: o.items,
                })),
                total,
                page,
                totalPages: Math.ceil(total / limit),
            });
        }

        case "addresses": {
            const addresses = await prisma.address.findMany({
                where: { userId: session.userId },
                orderBy: { id: "desc" },
            });
            return NextResponse.json({ addresses });
        }

        default:
            return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
}

// ─── POST: Write operations ──────────────────────────────────
export async function POST(req: NextRequest) {
    // CSRF protection
    const csrfError = verifyCsrf(req);
    if (csrfError) return csrfError;

    const session = await getSessionUser(req);
    if (!session) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body as { action: string };

    switch (action) {
        case "update-profile": {
            const { name, phone } = body as {
                name?: string;
                phone?: string;
            };

            const updateData: Record<string, unknown> = {};
            if (name !== undefined) updateData.name = name.trim();
            if (phone !== undefined) updateData.phone = phone.trim();

            if (Object.keys(updateData).length === 0) {
                return NextResponse.json({ error: "No fields to update" }, { status: 400 });
            }

            const user = await prisma.user.update({
                where: { id: session.userId },
                data: updateData as any,
                select: { id: true, email: true, name: true, phone: true },
            });

            return NextResponse.json({ success: true, user });
        }

        case "update-password": {
            const { currentPassword, newPassword } = body as {
                currentPassword: string;
                newPassword: string;
            };

            if (!currentPassword || !newPassword) {
                return NextResponse.json({ error: "Both passwords required" }, { status: 400 });
            }
            if (newPassword.length < 8) {
                return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
            }

            // Verify current password
            const user = await prisma.user.findUnique({
                where: { id: session.userId },
                select: { passwordHash: true },
            });

            if (!user?.passwordHash) {
                return NextResponse.json({ error: "No password set for this account" }, { status: 400 });
            }

            // PBKDF2 password verification (same as auth route)
            const encoder = new TextEncoder();
            const [algorithm, iterations, salt, hash] = user.passwordHash.split(":");
            const saltBuffer = Uint8Array.from(atob(salt), (c) => c.charCodeAt(0));
            const keyMaterial = await crypto.subtle.importKey(
                "raw",
                encoder.encode(currentPassword),
                "PBKDF2",
                false,
                ["deriveBits"]
            );
            const derivedBits = await crypto.subtle.deriveBits(
                { name: "PBKDF2", salt: saltBuffer, iterations: parseInt(iterations), hash: "SHA-256" },
                keyMaterial,
                256
            );
            const derivedHash = btoa(String.fromCharCode(...new Uint8Array(derivedBits)));

            if (derivedHash !== hash) {
                return NextResponse.json({ error: "Current password is incorrect" }, { status: 403 });
            }

            // Hash new password
            const newSalt = crypto.getRandomValues(new Uint8Array(16));
            const newKeyMaterial = await crypto.subtle.importKey(
                "raw",
                encoder.encode(newPassword),
                "PBKDF2",
                false,
                ["deriveBits"]
            );
            const newDerivedBits = await crypto.subtle.deriveBits(
                { name: "PBKDF2", salt: newSalt, iterations: 310000, hash: "SHA-256" },
                newKeyMaterial,
                256
            );
            const newHash = btoa(String.fromCharCode(...new Uint8Array(newDerivedBits)));
            const newSaltB64 = btoa(String.fromCharCode(...newSalt));
            const passwordHash = `pbkdf2:310000:${newSaltB64}:${newHash}`;

            await prisma.user.update({
                where: { id: session.userId },
                data: { passwordHash },
            });

            return NextResponse.json({ success: true });
        }

        case "add-address": {
            const { firstName, lastName, street1, street2, city, province, postalCode, phone, isDefault } = body as {
                firstName: string;
                lastName: string;
                street1: string;
                street2?: string;
                city: string;
                province: string;
                postalCode: string;
                phone?: string;
                isDefault?: boolean;
            };

            if (!firstName || !lastName || !street1 || !city || !province || !postalCode) {
                return NextResponse.json({ error: "Required address fields missing" }, { status: 400 });
            }

            // If setting as default, unset previous default
            if (isDefault) {
                await prisma.address.updateMany({
                    where: { userId: session.userId, isDefault: true },
                    data: { isDefault: false },
                });
            }

            const address = await prisma.address.create({
                data: {
                    userId: session.userId,
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    street1: street1.trim(),
                    street2: street2?.trim() || null,
                    city: city.trim(),
                    province: province.trim(),
                    postalCode: postalCode.trim().toUpperCase(),
                    country: "CA",
                    phone: phone?.trim() || null,
                    isDefault: isDefault || false,
                },
            });

            return NextResponse.json({ success: true, address });
        }

        case "delete-address": {
            const { addressId } = body as { addressId: string };
            if (!addressId) {
                return NextResponse.json({ error: "Address ID required" }, { status: 400 });
            }

            // Ensure the address belongs to this user
            const address = await prisma.address.findFirst({
                where: { id: addressId, userId: session.userId },
            });

            if (!address) {
                return NextResponse.json({ error: "Address not found" }, { status: 404 });
            }

            await prisma.address.delete({ where: { id: addressId } });
            return NextResponse.json({ success: true });
        }

        default:
            return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
}
