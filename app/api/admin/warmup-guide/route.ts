/**
 * Warm-Up Guide API — Plan management, phase tracking, best practices
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, isAuthError } from "@/lib/adminAuth";

// Generate a warm-up plan based on list size
function generatePlan(listSize: number) {
  const phases: { phase: number; day: number; dailyVolume: number; description: string; milestone: string }[] = [];
  let volume = Math.min(50, Math.ceil(listSize * 0.02));
  let day = 1;
  let phase = 1;

  while (volume < listSize) {
    const desc = volume < 100 ? "Initial warm-up" : volume < 500 ? "Building reputation" : volume < 2000 ? "Scaling volume" : "Full capacity ramp";
    const milestone = phase === 1 ? "Start" : volume >= listSize * 0.5 ? "Halfway" : volume >= listSize * 0.75 ? "Almost there" : "";
    phases.push({ phase, day, dailyVolume: Math.min(volume, listSize), description: desc, milestone });
    volume = Math.ceil(volume * 1.5);
    day += 2;
    phase++;
  }
  phases.push({ phase, day, dailyVolume: listSize, description: "Full volume reached", milestone: "Complete" });

  return {
    phases,
    recommendedDuration: day,
    startingVolume: phases[0]?.dailyVolume || 50,
    targetVolume: listSize,
  };
}

const BEST_PRACTICES = [
  { category: "setup", title: "Authenticate Your Domain", content: "Set up SPF, DKIM, and DMARC records before sending any emails. This proves to inbox providers that you own your domain." },
  { category: "setup", title: "Use a Subdomain", content: "Send marketing emails from a subdomain (e.g., mail.yourdomain.com) to protect your main domain reputation." },
  { category: "content", title: "Personalize Your Emails", content: "Use the recipient's name and relevant content. Personalized emails have higher engagement rates." },
  { category: "content", title: "Avoid Spam Triggers", content: "Don't use ALL CAPS, excessive exclamation marks, or words like 'FREE' in subject lines." },
  { category: "list", title: "Clean Your List", content: "Remove invalid, bounced, and unengaged email addresses regularly to maintain list health." },
  { category: "list", title: "Use Double Opt-In", content: "Require email confirmation before adding subscribers. This ensures valid addresses and engaged recipients." },
  { category: "sending", title: "Be Consistent", content: "Send emails on a regular schedule. Sudden spikes in volume can trigger spam filters." },
  { category: "sending", title: "Monitor Metrics", content: "Track open rates, click rates, bounces, and spam complaints after every send." },
];

// In-memory plan storage (production would use DB)
let activePlan: any = null;
let planHistory: any[] = [];

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isAuthError(auth)) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "activePlan";

    if (action === "activePlan") {
      return NextResponse.json(activePlan);
    }

    if (action === "progress") {
      if (!activePlan) return NextResponse.json(null);
      const completedPhases = activePlan.phases.filter((p: any) => p.completed);
      const currentPhaseIdx = activePlan.phases.findIndex((p: any) => !p.completed);
      const currentPhase = activePlan.phases[currentPhaseIdx] || activePlan.phases[activePlan.phases.length - 1];
      const daysElapsed = Math.ceil((Date.now() - new Date(activePlan.startedAt).getTime()) / 86400000);
      const totalSent = completedPhases.reduce((sum: number, p: any) => sum + (p.actualSent || 0), 0);
      const healthScores = completedPhases.filter((p: any) => p.healthScore != null).map((p: any) => p.healthScore);
      const avgHealthScore = healthScores.length > 0 ? Math.round(healthScores.reduce((a: number, b: number) => a + b, 0) / healthScores.length) : 0;

      const warnings: string[] = [];
      if (daysElapsed > currentPhase.day + 3) warnings.push("You are behind schedule. Try to complete the current phase soon.");

      return NextResponse.json({
        daysElapsed,
        totalSent,
        avgHealthScore,
        isOnTrack: daysElapsed <= currentPhase.day + 2,
        warnings,
        currentPhaseDetail: {
          ...currentPhase,
          tips: [
            `Send approximately ${currentPhase.dailyVolume} emails today`,
            "Monitor bounce rate — should stay under 2%",
            "Check spam complaints after each send",
            currentPhase.dailyVolume > 500 ? "Consider segmenting your audience" : "Focus on your most engaged subscribers",
          ],
        },
      });
    }

    if (action === "generatePlan") {
      const listSize = parseInt(searchParams.get("listSize") || "100");
      return NextResponse.json(generatePlan(listSize));
    }

    if (action === "history") {
      return NextResponse.json(planHistory);
    }

    if (action === "bestPractices") {
      return NextResponse.json(BEST_PRACTICES);
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

    if (action === "startPlan") {
      const { listSize, name } = body;
      const plan = generatePlan(listSize);
      activePlan = {
        ...plan,
        name: name || `Warm-up Plan (${listSize} subscribers)`,
        listSize,
        status: "active",
        currentPhase: 1,
        totalPhases: plan.phases.length,
        startedAt: new Date().toISOString(),
        phases: plan.phases.map(p => ({ ...p, completed: false, actualSent: 0, healthScore: null })),
      };
      return NextResponse.json({ success: true });
    }

    if (action === "completePhase") {
      if (!activePlan) return NextResponse.json({ error: "No active plan" }, { status: 400 });
      const { phaseNumber, actualSent, healthScore } = body;
      const idx = activePlan.phases.findIndex((p: any) => p.phase === phaseNumber);
      if (idx !== -1) {
        activePlan.phases[idx].completed = true;
        activePlan.phases[idx].actualSent = actualSent;
        activePlan.phases[idx].healthScore = healthScore ?? null;
        activePlan.currentPhase = Math.min(phaseNumber + 1, activePlan.totalPhases);
        if (activePlan.currentPhase > activePlan.totalPhases) {
          activePlan.status = "completed";
          planHistory.unshift({ ...activePlan });
          activePlan = null;
        }
      }
      return NextResponse.json({ success: true });
    }

    if (action === "pause") {
      if (activePlan) activePlan.status = "paused";
      return NextResponse.json({ success: true });
    }

    if (action === "resume") {
      if (activePlan) activePlan.status = "active";
      return NextResponse.json({ success: true });
    }

    if (action === "abandon") {
      if (activePlan) {
        activePlan.status = "abandoned";
        planHistory.unshift({ ...activePlan });
        activePlan = null;
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
