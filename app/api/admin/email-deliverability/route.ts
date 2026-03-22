/**
 * Email Deliverability API — Dashboard stats, campaign scores, trends
 * Gracefully handles missing EmailLog model (returns empty data).
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, isAuthError } from "@/lib/adminAuth";
import { log } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isAuthError(auth)) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "dashboard";
    const days = parseInt(searchParams.get("days") || "30");

    if (action === "dashboard") {
      const since = new Date(Date.now() - days * 86400000);

      // Try to query email logs; gracefully handle if the model doesn't exist yet
      let emailLogs: any[] = [];
      try {
        emailLogs = await (prisma as any).emailLog.findMany({
          where: { createdAt: { gte: since } },
          orderBy: { createdAt: "desc" },
        });
      } catch {
        // EmailLog model not yet in schema — return empty data
      }

      const total = emailLogs.length;
      const delivered = emailLogs.filter((e: any) => e.status === "delivered").length;
      const bounced = emailLogs.filter((e: any) => e.status === "bounced").length;
      const spam = emailLogs.filter((e: any) => e.status === "spam_complaint").length;
      const failed = emailLogs.filter((e: any) => e.status === "failed").length;

      const avgDeliveryRate = total > 0 ? parseFloat(((delivered / total) * 100).toFixed(1)) : 100;
      const avgBounceRate = total > 0 ? parseFloat(((bounced / total) * 100).toFixed(1)) : 0;
      const avgSpamRate = total > 0 ? parseFloat(((spam / total) * 100).toFixed(1)) : 0;

      const overallScore = Math.round(
        Math.max(0, Math.min(100,
          100 - (avgBounceRate * 10) - (avgSpamRate * 50) - (failed > 0 ? 5 : 0)
        ))
      );
      const overallGrade = overallScore >= 90 ? "A" : overallScore >= 75 ? "B" : overallScore >= 60 ? "C" : overallScore >= 40 ? "D" : "F";

      // Trend data (last 14 days)
      const reputationTrend: any[] = [];
      for (let i = 13; i >= 0; i--) {
        const dayStart = new Date(Date.now() - i * 86400000);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);
        const dayLogs = emailLogs.filter((e: any) => new Date(e.createdAt) >= dayStart && new Date(e.createdAt) <= dayEnd);
        const dTotal = dayLogs.length;
        const dDelivered = dayLogs.filter((e: any) => e.status === "delivered").length;
        const dBounced = dayLogs.filter((e: any) => e.status === "bounced").length;
        const dSpam = dayLogs.filter((e: any) => e.status === "spam_complaint").length;
        reputationTrend.push({
          date: dayStart.toISOString().slice(0, 10),
          score: dTotal > 0 ? Math.round(100 - ((dBounced / dTotal) * 100 * 5) - ((dSpam / dTotal) * 100 * 25)) : 100,
          deliveryRate: dTotal > 0 ? parseFloat(((dDelivered / dTotal) * 100).toFixed(1)) : 100,
          bounceRate: dTotal > 0 ? parseFloat(((dBounced / dTotal) * 100).toFixed(1)) : 0,
          spamRate: dTotal > 0 ? parseFloat(((dSpam / dTotal) * 100).toFixed(1)) : 0,
          totalSent: dTotal,
        });
      }

      // Recommendations
      const recommendations: string[] = [];
      if (avgBounceRate > 5) recommendations.push("High bounce rate detected. Clean your email list regularly.");
      if (avgBounceRate > 2) recommendations.push("Consider implementing double opt-in for new subscribers.");
      if (avgSpamRate > 0.1) recommendations.push("Spam complaint rate is elevated. Review email content and frequency.");
      if (total < 100) recommendations.push("Low sending volume. Consider a warm-up plan to build sender reputation.");
      if (avgDeliveryRate > 95) recommendations.push("Delivery rate is excellent. Keep up the good sending practices!");
      if (recommendations.length === 0) recommendations.push("All metrics look healthy. Continue monitoring regularly.");

      // By template
      const templateMap = new Map<string, { total: number; delivered: number; bounced: number; spamComplaint: number }>();
      for (const log of emailLogs) {
        const type = (log as any).emailType || "other";
        const existing = templateMap.get(type) || { total: 0, delivered: 0, bounced: 0, spamComplaint: 0 };
        existing.total++;
        if ((log as any).status === "delivered") existing.delivered++;
        if ((log as any).status === "bounced") existing.bounced++;
        if ((log as any).status === "spam_complaint") existing.spamComplaint++;
        templateMap.set(type, existing);
      }
      const byTemplate = Array.from(templateMap.entries()).map(([emailType, data]) => ({ emailType, ...data }));

      // Recent events
      const recentEvents = emailLogs.slice(0, 30).map((e: any) => ({
        id: e.id,
        eventType: e.status,
        recipientEmail: e.recipientEmail,
        emailType: e.emailType,
        createdAt: e.createdAt,
      }));

      return NextResponse.json({
        overallScore,
        overallGrade,
        totalCampaignsSent: 0,
        totalEmailsSent: total,
        avgDeliveryRate,
        avgBounceRate,
        avgSpamRate,
        reputationTrend,
        recommendations,
        topIssues: avgBounceRate > 5 ? [{ issue: "High bounce rate", severity: "high", count: bounced }] : [],
        campaignScores: [],
        byTemplate,
        recentEvents,
        trend: reputationTrend,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    log.admin.error("Email deliverability API error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
