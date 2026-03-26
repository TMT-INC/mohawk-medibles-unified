/**
 * Mohawk Medibles — High-Authority Backlink Strategy
 * ══════════════════════════════════════════════════
 * Generates a backlink acquisition playbook with target domains,
 * outreach templates, and link-bait content opportunities.
 */

export interface BacklinkTarget {
    domain: string;
    dr: number;         // Domain Rating (0-100)
    type: "editorial" | "directory" | "resource" | "partnership" | "pr" | "community";
    strategy: string;
    priority: "high" | "medium" | "low";
    outreachTemplate?: string;
}

export const BACKLINK_TARGETS: BacklinkTarget[] = [
    // ── Tier 1: High DR Editorial / Resource Links ──────────
    {
        domain: "leafly.ca",
        dr: 85,
        type: "resource",
        strategy: "Submit Mohawk Medibles as a listed dispensary. Contribute expert articles on terpene profiles and indigenous cannabis heritage.",
        priority: "high",
    },
    {
        domain: "weedmaps.com",
        dr: 82,
        type: "directory",
        strategy: "Claim and optimize dispensary listing with full product catalog, photos, and customer reviews.",
        priority: "high",
    },
    {
        domain: "hightimes.com",
        dr: 78,
        type: "editorial",
        strategy: "Pitch indigenous cannabis heritage story. High Times regularly features cultural cannabis narratives.",
        priority: "high",
    },
    {
        domain: "cannabisretailer.ca",
        dr: 55,
        type: "editorial",
        strategy: "Contribute thought leadership on indigenous sovereignty and cannabis commerce.",
        priority: "high",
    },
    // ── Tier 2: Industry & Community ────────────────────────
    {
        domain: "tyendinaga.ca",
        dr: 40,
        type: "partnership",
        strategy: "Partner with Tyendinaga Mohawk Territory community for local business directory listing and co-branded content.",
        priority: "medium",
    },
    {
        domain: "canadiancannabis.org",
        dr: 52,
        type: "resource",
        strategy: "Get listed as an indigenous cannabis resource. Contribute educational content.",
        priority: "medium",
    },
    {
        domain: "reddit.com/r/canadients",
        dr: 92,
        type: "community",
        strategy: "Organic engagement with helpful cannabis advice. Link in profile. Never spam product links.",
        priority: "medium",
    },
    // ── Tier 3: Local & Niche ───────────────────────────────
    {
        domain: "torontosun.com",
        dr: 80,
        type: "pr",
        strategy: "Pitch news story on indigenous-owned cannabis ventures in Ontario. Local angle for GTA readership.",
        priority: "medium",
    },
    {
        domain: "hamiltonnews.com",
        dr: 45,
        type: "pr",
        strategy: "Local press release for new product launches or community events near Tyendinaga.",
        priority: "low",
    },
    {
        domain: "intelligencer.ca",
        dr: 42,
        type: "pr",
        strategy: "Hyper-local press coverage. Belleville/Quinte region = closest major municipality to Tyendinaga.",
        priority: "medium",
    },
];

// ─── Link-Bait Content Ideas ────────────────────────────────

export interface LinkBaitContent {
    title: string;
    type: "guide" | "infographic" | "tool" | "study" | "calculator";
    targetKeyword: string;
    backlinksExpected: number;
    description: string;
}

export const LINK_BAIT_IDEAS: LinkBaitContent[] = [
    {
        title: "The Complete Canadian Cannabis Terpene Guide (2025)",
        type: "guide",
        targetKeyword: "cannabis terpene guide",
        backlinksExpected: 25,
        description: "Definitive guide mapping 20+ terpenes to effects, aromas, and strains. Include interactive terpene wheel.",
    },
    {
        title: "Cannabis Edible Dosage Calculator",
        type: "calculator",
        targetKeyword: "edible dosage calculator",
        backlinksExpected: 40,
        description: "Interactive tool: input weight, tolerance, desired effect → get personalized mg recommendation.",
    },
    {
        title: "Indigenous Cannabis Heritage: A Visual History",
        type: "infographic",
        targetKeyword: "indigenous cannabis history",
        backlinksExpected: 30,
        description: "Shareable infographic tracing cannabis use in Indigenous culture. High PR and educational link potential.",
    },
    {
        title: "Cannabis Storage Science: Temperature, Humidity & Potency (Study)",
        type: "study",
        targetKeyword: "how to store cannabis",
        backlinksExpected: 20,
        description: "Original data: we test 5 storage methods over 90 days, measure THC degradation. Citable primary research.",
    },
    {
        title: "Strain Comparison Tool: Find Your Perfect Match",
        type: "tool",
        targetKeyword: "cannabis strain comparison",
        backlinksExpected: 35,
        description: "Interactive tool comparing any 2 strains side-by-side on terpenes, THC/CBD, effects, and price.",
    },
];

// ─── Backlink Strategy Generator ────────────────────────────

export function generateBacklinkPlan(priorityOnly = false) {
    const targets = priorityOnly
        ? BACKLINK_TARGETS.filter((t) => t.priority === "high")
        : BACKLINK_TARGETS;

    return {
        targets,
        linkBaitContent: LINK_BAIT_IDEAS,
        totalTargetDomains: targets.length,
        averageDR: Math.round(targets.reduce((s, t) => s + t.dr, 0) / targets.length),
        estimatedBacklinks: LINK_BAIT_IDEAS.reduce((s, l) => s + l.backlinksExpected, 0),
        monthlyOutreachCadence: "5-10 outreach emails per week",
        timeline: "3-6 months for measurable DR improvement",
    };
}
