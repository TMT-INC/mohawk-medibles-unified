/**
 * Strain Data Helper
 * ══════════════════
 * Shared logic for strain landing pages, footer links, and homepage injection.
 * Pulls flower products from DB (via getAllProducts) and groups by type.
 */

import { getAllProducts, type Product } from "@/lib/products";

export type StrainType = "Indica" | "Sativa" | "Hybrid";

export const STRAIN_TYPES: StrainType[] = ["Indica", "Sativa", "Hybrid"];

export interface StrainTypeInfo {
  type: StrainType;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  effects: string[];
  bestFor: string[];
  terpeneProfile: string;
}

export const STRAIN_TYPE_DATA: Record<StrainType, StrainTypeInfo> = {
  Indica: {
    type: "Indica",
    slug: "indica",
    title: "Indica Strains",
    shortDescription: "Deep relaxation, pain relief, and restful sleep.",
    description:
      "Indica cannabis strains are renowned for their deeply relaxing body effects. Originating from the Hindu Kush mountain region, these plants produce dense, resinous buds with rich terpene profiles dominated by myrcene, linalool, and caryophyllene. Indica strains are the go-to choice for evening use, pain management, insomnia relief, and unwinding after a long day. At Mohawk Medibles, every indica strain is lab-tested for potency and purity, ensuring you get consistent, premium quality with every order.",
    effects: ["Relaxing", "Sedating", "Pain Relief", "Body High", "Sleep Aid"],
    bestFor: ["Evening use", "Pain management", "Insomnia", "Stress relief", "Muscle relaxation"],
    terpeneProfile: "Myrcene, Linalool, Caryophyllene",
  },
  Sativa: {
    type: "Sativa",
    slug: "sativa",
    title: "Sativa Strains",
    shortDescription: "Energizing, creative, and uplifting cerebral effects.",
    description:
      "Sativa cannabis strains deliver energizing, uplifting cerebral effects that fuel creativity, focus, and social engagement. Originating from equatorial regions like Southeast Asia, Central America, and Africa, sativas grow tall with narrow leaves and airy buds rich in limonene, pinene, and terpinolene. Ideal for daytime use, creative projects, outdoor adventures, and combating fatigue or depression. Our sativa collection at Mohawk Medibles features hand-selected strains with verified THC/CBD profiles and full terpene analysis.",
    effects: ["Energizing", "Creative", "Uplifting", "Focused", "Euphoric"],
    bestFor: ["Daytime use", "Creative work", "Social events", "Exercise", "Depression relief"],
    terpeneProfile: "Limonene, Pinene, Terpinolene",
  },
  Hybrid: {
    type: "Hybrid",
    slug: "hybrid",
    title: "Hybrid Strains",
    shortDescription: "Balanced effects combining the best of indica and sativa.",
    description:
      "Hybrid cannabis strains are expertly bred to combine the best qualities of both indica and sativa genetics. Whether indica-dominant for relaxation with a touch of mental clarity, or sativa-dominant for energy with body comfort, hybrids offer versatile effects tailored to your needs. Modern cannabis breeding has produced exceptional hybrid cultivars with complex terpene profiles and balanced cannabinoid ratios. Browse our curated hybrid collection at Mohawk Medibles — each strain is lab-verified and shipped Canada-wide with discreet packaging.",
    effects: ["Balanced", "Versatile", "Relaxed Focus", "Mild Euphoria", "Body Comfort"],
    bestFor: ["Any time of day", "Versatile use", "Balanced relief", "First-time users", "Social relaxation"],
    terpeneProfile: "Caryophyllene, Limonene, Myrcene",
  },
};

export async function getAllFlowerProducts(): Promise<Product[]> {
  const products = await getAllProducts();
  return products.filter((p) => p.category === "Flower");
}

export async function getFlowersByType(): Promise<Record<StrainType, Product[]>> {
  const flowers = await getAllFlowerProducts();
  const grouped: Record<StrainType, Product[]> = { Indica: [], Sativa: [], Hybrid: [] };
  for (const product of flowers) {
    const type = product.specs.type as StrainType;
    if (type in grouped) grouped[type].push(product);
  }
  return grouped;
}

export async function getFlowersByStrainType(type: StrainType): Promise<Product[]> {
  const flowers = await getAllFlowerProducts();
  return flowers.filter((p) => p.specs.type === type);
}

export async function getPopularStrains(limit: number = 10): Promise<Product[]> {
  const flowers = await getAllFlowerProducts();
  const scored = flowers.map((p) => {
    let score = 0;
    if (p.featured) score += 100;
    score += (p.specs.terpenes?.length || 0) * 10;
    score += p.effects?.length || 0;
    if (p.price > 0) score += Math.max(0, 50 - p.price * 0.5);
    return { product: p, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.product);
}

export async function getStrainTypeCounts(): Promise<Record<StrainType, number>> {
  const grouped = await getFlowersByType();
  return { Indica: grouped.Indica.length, Sativa: grouped.Sativa.length, Hybrid: grouped.Hybrid.length };
}
