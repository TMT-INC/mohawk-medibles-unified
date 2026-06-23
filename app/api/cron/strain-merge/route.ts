/**
 * Strain Merge Cron — Daily Google-safe strain → ProductSpec enrichment
 *
 * Schedule: 05:00 UTC daily, driven by .github/workflows/cron-triggers.yml
 * (Vercel-native crons stopped firing 2026-03-27 — SSO deployment protection).
 * Flow: read committed merge plan (data/strains/_merge-plan.json, generated
 * locally by scripts/strain-merge.mjs --write-plan, where the exact/fuzzy/
 * local-Ollama match pipeline runs) → apply next N unledgered products →
 * record in strain_merge_ledger (idempotent, resumable).
 *
 * HARD GATE: env STRAIN_MERGE_ENABLED must be exactly "true".
 * Absent/anything else = no-op with log. Committing this route does NOT
 * activate it — activation is an explicit Vercel env decision.
 *
 * SEO-SAFETY HARD RULES (mirror of scripts/strain-merge.mjs — do not relax):
 *   - ADDITIVE ONLY: writes only thc/cbd/type/terpenes/lineage/eeatNarrative
 *     on ProductSpec, and only where the current value is NULL/empty.
 *     Never touches titles, slugs, meta descriptions, or schema.org types.
 *   - Daily limit defaults to 12, hard-clamped at 25 (MAX_LIMIT).
 *   - Deterministic plan order → predictable daily batches.
 *   - Touched products get Product.updatedAt bumped so freshness propagates.
 */
import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";
import mergePlan from "@/data/strains/_merge-plan.json";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 25; // hard clamp — never exceed
const ALLOWED_SPEC_FIELDS = ["thc", "cbd", "type", "terpenes", "lineage", "eeatNarrative"] as const;
type SpecField = (typeof ALLOWED_SPEC_FIELDS)[number];

// Mirror of scripts/strain-merge.mjs POTENCY_OK_CATEGORIES (do not relax):
// strain thc/cbd are FLOWER percentages — writing them to concentrates
// (60-90% products) or mg-dosed edibles would be factually wrong on-page.
const POTENCY_OK_CATEGORIES = new Set(["Flower", "Pre-Rolls"]);

interface PlanItem {
  productId: number;
  productSlug: string;
  productName: string;
  category: string;
  strainSlug: string;
  method: string;
  fields: Partial<Record<SpecField, string>>;
}

function verifyCronAuth(authHeader: string | null): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  if (!authHeader) return false;
  const token = authHeader.replace("Bearer ", "");
  if (token.length !== cronSecret.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(cronSecret));
}

function resolveLimit(): number {
  const raw = parseInt(process.env.STRAIN_MERGE_DAILY_LIMIT || "", 10);
  const limit = Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_LIMIT;
  return Math.min(limit, MAX_LIMIT);
}

export async function GET(req: NextRequest) {
  // Verify cron secret (timing-safe)
  if (!verifyCronAuth(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Hard gate: default absent = no-op ──
  if (process.env.STRAIN_MERGE_ENABLED !== "true") {
    log.seo.info("strain-merge cron skipped — STRAIN_MERGE_ENABLED is not 'true'");
    return NextResponse.json({
      success: true,
      skipped: true,
      reason: "STRAIN_MERGE_ENABLED not set to 'true'",
    });
  }

  const limit = resolveLimit();
  const plan = (mergePlan as { plan: PlanItem[] }).plan;

  try {
    // Ledger table (idempotency anchor) — safe to run every time
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS strain_merge_ledger (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL UNIQUE,
      product_slug TEXT NOT NULL,
      strain_slug TEXT NOT NULL,
      match_method TEXT NOT NULL,
      fields_added TEXT[] NOT NULL,
      merged_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);

    const ledgerRows = await prisma.$queryRawUnsafe<{ product_id: number }[]>(
      "SELECT product_id FROM strain_merge_ledger"
    );
    const ledgered = new Set(ledgerRows.map((r) => r.product_id));

    // Plan is committed pre-sorted (slug asc, id asc) → deterministic batch
    const batch = plan.filter((p) => !ledgered.has(p.productId)).slice(0, limit);

    const applied: { productSlug: string; strainSlug: string; fieldsAdded: string[] }[] = [];
    const errors: { productSlug: string; error: string }[] = [];

    for (const item of batch) {
      try {
        const spec = await prisma.productSpec.findUnique({
          where: { productId: item.productId },
        });

        // ADDITIVE-ONLY guard, re-checked at write time against live data
        const data: Partial<Record<SpecField, string>> = {};
        for (const f of ALLOWED_SPEC_FIELDS) {
          const incoming = item.fields[f];
          if (!incoming) continue;
          // Potency guard (mirror of plan generator): flower % never lands
          // on concentrates/edibles even if a future plan forgets the rule.
          if ((f === "thc" || f === "cbd") && !POTENCY_OK_CATEGORIES.has(item.category)) continue;
          const existing = spec ? (spec[f] as string | null) : null;
          if (existing == null || existing.trim() === "") data[f] = incoming;
        }

        if (Object.keys(data).length > 0) {
          if (spec) {
            await prisma.productSpec.update({ where: { productId: item.productId }, data });
          } else {
            await prisma.productSpec.create({ data: { productId: item.productId, ...data } });
          }
          // Bump freshness signal (sitemap/ISR pick this up naturally)
          await prisma.product.update({
            where: { id: item.productId },
            data: { updatedAt: new Date() },
          });
        }

        await prisma.$executeRaw`
          INSERT INTO strain_merge_ledger (product_id, product_slug, strain_slug, match_method, fields_added)
          VALUES (${item.productId}, ${item.productSlug}, ${item.strainSlug}, ${item.method}, ${Object.keys(data)}::text[])
          ON CONFLICT (product_id) DO NOTHING
        `;
        applied.push({
          productSlug: item.productSlug,
          strainSlug: item.strainSlug,
          fieldsAdded: Object.keys(data),
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown";
        errors.push({ productSlug: item.productSlug, error: msg });
        log.seo.error("strain-merge item failed", { productSlug: item.productSlug, error: msg });
      }
    }

    log.seo.info("strain-merge cron completed", {
      applied: applied.length,
      errors: errors.length,
      remaining: plan.length - ledgered.size - applied.length,
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      limit,
      applied,
      errors,
      progress: {
        enriched: ledgered.size + applied.length,
        planned: plan.length,
        remaining: Math.max(0, plan.length - ledgered.size - applied.length),
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown";
    log.seo.error("strain-merge cron failed", { error: msg });
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
