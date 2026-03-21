/**
 * Content Generation API — Hardened
 * POST /api/content/generate
 */
import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { ContentGenerate, validateBody } from "@/lib/validation";

const AGENT_URL = process.env.AGENT_GATEWAY_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
    // ── Rate limit ──────────────────────────────────────────
    const limited = await applyRateLimit(req, RATE_LIMITS.content);
    if (limited) return limited;

    // ── Parse & validate ────────────────────────────────────
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = validateBody(ContentGenerate, body);
    if (!parsed.success) return parsed.error;

    const {
        action,
        channel,
        pillar,
        product_slug,
        keyword,
        custom_topic,
        count,
        days,
    } = parsed.data;

    try {
        // Route to the Python agent gateway
        const agentRes = await fetch(`${AGENT_URL}/api/content`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action,
                channel,
                pillar,
                product_slug,
                keyword,
                custom_topic,
                count,
                days,
            }),
        });

        if (agentRes.ok) {
            const data = await agentRes.json();
            return NextResponse.json(data);
        }

        // Fallback: run inline if gateway is down
        return NextResponse.json(
            generateFallbackContent(channel, pillar)
        );
    } catch {
        // Gateway unreachable — use fallback
        return NextResponse.json(
            generateFallbackContent(channel, pillar)
        );
    }
}

// Fallback content templates when Python gateway is unavailable
function generateFallbackContent(channel: string, pillar?: string) {
    const pillars = ["education", "product_story", "heritage", "behind_scenes", "community"];
    const selectedPillar = pillar || pillars[Math.floor(Math.random() * pillars.length)];

    const templates: Record<string, Record<string, unknown>> = {
        instagram_post: {
            type: "instagram_post",
            pillar: selectedPillar,
            caption: `Most people get this wrong about cannabis. 👇\n\nTerpenes determine 70% of your experience — not THC percentage.\n\nAt Mohawk Medibles, we test for 12+ terpene profiles so you always know exactly what you're getting.\n\nThis is the Empire Standard™.\n\nSave this for next time you're shopping. 📌`,
            hashtags: ["#MohawkMedibles", "#EmpireStandard", "#CannabisScience", "#SixNationsGrown", "#PremiumCannabis"],
        },
        blog_post: {
            type: "blog_post",
            pillar: "education",
            title: "Understanding Terpene Profiles: Your Complete Guide",
            slug: "understanding-terpene-profiles-complete-guide",
            keyword: "terpene profiles cannabis",
            meta_description: "Expert guide on terpene profiles from Mohawk Medibles. Science-backed, community-trusted. The Empire Standard™.",
            estimated_word_count: 1500,
        },
        gmb_post: {
            type: "gmb_post",
            title: "New Arrivals at Mohawk Medibles",
            body: "Lab-tested, hand-selected premium cannabis now available. Visit Mohawk Medibles on Six Nations territory or shop online.",
            cta: "SHOP",
            cta_link: "https://mohawkmedibles.co/shop/",
        },
    };

    return {
        source: "fallback",
        generated_at: new Date().toISOString(),
        brand: "Mohawk Medibles",
        ...templates[channel] || templates.instagram_post,
    };
}
