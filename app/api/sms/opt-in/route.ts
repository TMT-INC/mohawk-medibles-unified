/**
 * SMS Opt-In API — /api/sms/opt-in
 * GET: Check current opt-in status
 * POST: Update opt-in status and phone number
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validatePhone, formatPhone } from "@/lib/phoneValidation";

// Helper to get userId from session cookie
async function getUserId(req: NextRequest): Promise<string | null> {
  const token =
    req.cookies.get("mm-session")?.value ||
    null;

  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    select: { userId: true, expiresAt: true },
  });

  if (!session || session.expiresAt < new Date()) return null;
  return session.userId;
}

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ optedIn: false, phone: null });
  }

  const optIn = await prisma.smsOptIn.findUnique({
    where: { userId },
  });

  return NextResponse.json({
    optedIn: optIn?.optedIn ?? false,
    phone: optIn?.phone ?? null,
  });
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { phone, optedIn } = body;

    if (optedIn && (!phone || typeof phone !== "string")) {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 });
    }

    if (optedIn) {
      const validation = validatePhone(phone);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.reason }, { status: 400 });
      }
    }

    const formatted = optedIn ? formatPhone(phone) : phone || "";

    const existing = await prisma.smsOptIn.findUnique({
      where: { userId },
    });

    if (existing) {
      await prisma.smsOptIn.update({
        where: { userId },
        data: {
          phone: formatted || existing.phone,
          optedIn: !!optedIn,
        },
      });
    } else {
      await prisma.smsOptIn.create({
        data: {
          userId,
          phone: formatted || "",
          optedIn: !!optedIn,
        },
      });
    }

    return NextResponse.json({ success: true, optedIn: !!optedIn });
  } catch (err) {
    console.error("[SMS Opt-In] Error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
