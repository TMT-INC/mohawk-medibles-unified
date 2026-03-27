import { NextRequest, NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/productData";

// Cache for 5 minutes
export const revalidate = 300;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const limit = parseInt(searchParams.get("limit") || "0");
  const featured = searchParams.get("featured");
  const slugs = searchParams.get("slugs"); // comma-separated

  let products = PRODUCTS.filter(p => p.price > 0);

  if (category) {
    products = products.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }
  if (featured === "true") {
    products = products.filter((p) => p.featured);
  }
  if (slugs) {
    const slugList = slugs.split(",");
    products = products.filter((p) => slugList.includes(p.slug));
  }
  if (limit > 0) {
    products = products.slice(0, limit);
  }

  // Return only essential fields for cards (not full descriptions/HTML)
  const lite = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    subcategory: p.subcategory,
    price: p.price,
    image: p.image,
    altText: p.altText,
    featured: p.featured,
    specs: p.specs
      ? {
          thc: p.specs.thc,
          cbd: p.specs.cbd,
          type: p.specs.type,
          weight: p.specs.weight,
          terpenes: p.specs.terpenes,
        }
      : null,
    effects: p.effects,
    shortDescription: p.shortDescription?.substring(0, 150),
  }));

  return NextResponse.json(lite, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
