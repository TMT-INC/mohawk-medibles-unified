/**
 * Terpene reference data — shared by product pages and the strain library.
 *
 * Aroma/foundIn notes are factual botany (safe under Health Canada §17 —
 * no therapeutic claims). Color chips match ProductDetailClient's palette.
 */

export interface TerpeneInfo {
    /** Tailwind chip classes (light bg + dark text + border) */
    color: string;
    /** Aroma/flavor descriptor */
    aroma: string;
    /** Where the same terpene occurs in nature */
    foundIn: string;
}

export const TERPENE_INFO: Record<string, TerpeneInfo> = {
    Myrcene: {
        color: "bg-amber-100 text-amber-800 border-amber-300",
        aroma: "Earthy, musky, with ripe-fruit sweetness",
        foundIn: "mangoes, hops, lemongrass, and thyme",
    },
    Limonene: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        aroma: "Bright citrus — lemon and orange zest",
        foundIn: "citrus peels, juniper, and peppermint",
    },
    Caryophyllene: {
        color: "bg-orange-100 text-orange-800 border-orange-300",
        aroma: "Peppery, spicy, woody warmth",
        foundIn: "black pepper, cloves, and cinnamon",
    },
    Pinene: {
        color: "bg-emerald-100 text-emerald-800 border-emerald-300",
        aroma: "Fresh pine needles and forest air",
        foundIn: "pine trees, rosemary, basil, and dill",
    },
    Linalool: {
        color: "bg-purple-100 text-purple-800 border-purple-300",
        aroma: "Soft floral lavender with a hint of spice",
        foundIn: "lavender, birch bark, and coriander",
    },
    Terpinolene: {
        color: "bg-teal-100 text-teal-800 border-teal-300",
        aroma: "Fruity and herbal with piney depth",
        foundIn: "nutmeg, tea tree, apples, and lilacs",
    },
    Humulene: {
        color: "bg-lime-100 text-lime-800 border-lime-300",
        aroma: "Hoppy, woody, subtly earthy",
        foundIn: "hops, sage, and ginseng",
    },
    Ocimene: {
        color: "bg-rose-100 text-rose-800 border-rose-300",
        aroma: "Sweet, herbaceous, lightly tropical",
        foundIn: "mint, parsley, orchids, and basil",
    },
    Camphene: {
        color: "bg-sky-100 text-sky-800 border-sky-300",
        aroma: "Damp woodlands, fir needles",
        foundIn: "fir trees, camphor oil, and citronella",
    },
    Guaiol: {
        color: "bg-cyan-100 text-cyan-800 border-cyan-300",
        aroma: "Piney with a rose-like softness",
        foundIn: "guaiacum wood and cypress pine",
    },
    Geraniol: {
        color: "bg-pink-100 text-pink-800 border-pink-300",
        aroma: "Rose petals and sweet fruit",
        foundIn: "geraniums, roses, and lemongrass",
    },
    Bisabolol: {
        color: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300",
        aroma: "Delicate chamomile and honey",
        foundIn: "chamomile flowers and candeia trees",
    },
    Valencene: {
        color: "bg-amber-100 text-amber-900 border-amber-400",
        aroma: "Sweet Valencia orange and fresh wood",
        foundIn: "Valencia oranges and grapefruit",
    },
};

export function getTerpeneInfo(name: string): TerpeneInfo {
    return (
        TERPENE_INFO[name] || {
            color: "bg-green-100 text-green-800 border-green-300",
            aroma: "Distinctive aromatic profile",
            foundIn: "various aromatic plants",
        }
    );
}

export function getTerpeneColor(name: string): string {
    return getTerpeneInfo(name).color;
}
