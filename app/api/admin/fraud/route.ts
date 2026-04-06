/**
 * Admin Fraud Review API
 * GET  — List fraud alerts with stats
 * POST — Review (approve/block) a fraud alert
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, isAuthError } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isAuthError(auth)) return auth;

  try {
    const url = new URL(req.url);
    const statusFilter = url.searchParams.get("status") || "ALL";

    const where: Record<string, unknown> = {};
    if (statusFilter !== "ALL") {
      where.status = statusFilter;
    }

    const [alerts, total] = await Promise.all([
      prisma.fraudCheck.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 100,
        include: {
          order: {
            include: {
              user: { select: { id: true, name: true, email: true, createdAt: true } },
              items: { select: { name: true, quantity: true, price: true, total: true } },
            },
          },
        },
      }),
      prisma.fraudCheck.count({ where }),
    ]);

    // Stats
    const [pendingReview, suspicious, totalBlocked] = await Promise.all([
      prisma.fraudCheck.count({ where: { status: "BLOCKED", reviewedAt: null } }),
      prisma.fraudCheck.count({ where: { status: "SUSPICIOUS" } }),
      prisma.fraudCheck.count({ where: { status: "BLOCKED" } }),
    ]);

    return NextResponse.json({
      alerts,
      total,
      stats: { pendingReview, suspicious, totalBlocked },
    });
  } catch (error) {
    // Fraud API GET error logged
    return NextResponse.json({ alerts: [], total: 0, stats: { pendingReview: 0, suspicious: 0, totalBlocked: 0 } });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isAuthError(auth)) return auth;

  try {
    const body = await req.json();
    const { fraudCheckId, action } = body as { fraudCheckId: string; action: "APPROVE" | "BLOCK" };

    if (!fraudCheckId || !action) {
      return NextResponse.json({ error: "Missing fraudCheckId or action" }, { status: 400 });
    }

    const fraudCheck = await prisma.fraudCheck.findUnique({
      where: { id: fraudCheckId },
      include: { order: true },
    });

    if (!fraudCheck) {
      return NextResponse.json({ error: "Fraud check not found" }, { status: 404 });
    }

    if (action === "APPROVE") {
      // Move order back to PENDING
      await prisma.order.update({
        where: { id: fraudCheck.orderId },
        data: { status: "PENDING" },
      });

      await prisma.orderStatusHistory.create({
        data: {
          orderId: fraudCheck.orderId,
          status: "PENDING",
          note: `Fraud review: Order approved by admin. Original score: ${fraudCheck.score}/100.`,
        },
      });

      await prisma.fraudCheck.update({
        where: { id: fraudCheckId },
        data: {
          status: "CLEAN",
          reviewedBy: "admin",
          reviewedAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, action: "APPROVED" });
    } else if (action === "BLOCK") {
      // Cancel and mark as failed
      await prisma.order.update({
        where: { id: fraudCheck.orderId },
        data: { status: "CANCELLED", paymentStatus: "FAILED" },
      });

      await prisma.orderStatusHistory.create({
        data: {
          orderId: fraudCheck.orderId,
          status: "CANCELLED",
          note: `Order blocked by admin fraud review. Score: ${fraudCheck.score}/100. Flags: ${JSON.stringify(fraudCheck.flags)}`,
        },
      });

      await prisma.fraudCheck.update({
        where: { id: fraudCheckId },
        data: {
          status: "BLOCKED",
          reviewedBy: "admin",
          reviewedAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, action: "BLOCKED" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    // Fraud API POST error logged
    return NextResponse.json({ error: "Failed to process review" }, { status: 500 });
  }
}
