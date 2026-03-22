/**
 * Photo Moderation API — Manual & AI moderation, auto-tagging, stats
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, isAuthError } from "@/lib/adminAuth";

// In-memory settings (production would use DB)
let autoTagSettings = {
  enabled: true,
  tagOnUpload: false,
  minConfidence: 60,
  predefinedTags: ["product_photo", "lifestyle", "closeup", "packaging", "outdoor", "indoor"],
};

let aiModerationSettings = {
  enabled: true,
  autoApproveEnabled: true,
  autoRejectEnabled: true,
  confidenceThreshold: 75,
};

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isAuthError(auth)) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "moderationQueue";

    if (action === "moderationQueue") {
      const status = searchParams.get("status") || "pending";
      // Would query review photos from DB
      return NextResponse.json([]);
    }

    if (action === "moderationStats") {
      return NextResponse.json({
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0,
      });
    }

    if (action === "autoTagSettings") {
      return NextResponse.json(autoTagSettings);
    }

    if (action === "tagStats") {
      return NextResponse.json({
        totalTagged: 0,
        avgTagsPerPhoto: 0,
        topTags: [],
        tagDistribution: [],
        lastProcessedAt: null,
      });
    }

    if (action === "tagLog") {
      return NextResponse.json([]);
    }

    if (action === "photosByTag") {
      return NextResponse.json([]);
    }

    if (action === "aiModerationSettings") {
      return NextResponse.json(aiModerationSettings);
    }

    if (action === "aiModerationStats") {
      return NextResponse.json({
        totalProcessed: 0,
        autoApproved: 0,
        autoRejected: 0,
        flaggedForReview: 0,
        avgConfidence: 0,
      });
    }

    if (action === "aiModerationLog") {
      return NextResponse.json([]);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isAuthError(auth)) return auth;

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "approvePhotos") {
      return NextResponse.json({ success: true });
    }

    if (action === "rejectPhotos") {
      return NextResponse.json({ success: true });
    }

    if (action === "bulkApprovePhotos") {
      return NextResponse.json({ success: true });
    }

    if (action === "bulkRejectPhotos") {
      return NextResponse.json({ success: true });
    }

    if (action === "updateAutoTagSettings") {
      const updates = body.settings || {};
      autoTagSettings = { ...autoTagSettings, ...updates };
      return NextResponse.json(autoTagSettings);
    }

    if (action === "processUntagged") {
      return NextResponse.json({ processed: 0, totalTags: 0 });
    }

    if (action === "updateAiModerationSettings") {
      const updates = body.settings || {};
      aiModerationSettings = { ...aiModerationSettings, ...updates };
      return NextResponse.json(aiModerationSettings);
    }

    if (action === "aiProcessPending") {
      return NextResponse.json({ processed: 0, autoApproved: 0, autoRejected: 0, flaggedForReview: 0 });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
