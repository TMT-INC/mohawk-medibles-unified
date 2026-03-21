import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { getProductBySlug, PRODUCTS } from "@/lib/productData";
import { BLOG_POSTS } from "@/data/blog/posts";

export const runtime = "edge";

const BRAND_GREEN = "#1B4332";
const BRAND_GOLD = "#D4A843";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "product";
    const slug = searchParams.get("slug") || "";
    const name = searchParams.get("name") || "";

    if (type === "product") {
        return productOG(slug);
    }
    if (type === "blog") {
        return blogOG(slug);
    }
    if (type === "category") {
        return categoryOG(name);
    }

    return new Response("Invalid type", { status: 400 });
}

function productOG(slug: string) {
    const product = getProductBySlug(slug);
    if (!product) {
        return new Response("Product not found", { status: 404 });
    }

    return new ImageResponse(
        (
            <div
                style={{
                    width: "1200px",
                    height: "630px",
                    display: "flex",
                    background: `linear-gradient(135deg, ${BRAND_GREEN} 0%, #0D1F0A 100%)`,
                    fontFamily: "sans-serif",
                    position: "relative",
                }}
            >
                {/* Background pattern */}
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        opacity: 0.05,
                        backgroundImage: "radial-gradient(circle at 25px 25px, white 2px, transparent 0)",
                        backgroundSize: "50px 50px",
                        display: "flex",
                    }}
                />

                {/* Content */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        padding: "60px",
                        width: "100%",
                        height: "100%",
                        position: "relative",
                    }}
                >
                    {/* Top row: branding + category */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    background: BRAND_GOLD,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "20px",
                                    fontWeight: 900,
                                    color: BRAND_GREEN,
                                }}
                            >
                                M
                            </div>
                            <span style={{ color: "white", fontSize: "20px", fontWeight: 700, letterSpacing: "0.1em" }}>
                                MOHAWK MEDIBLES
                            </span>
                        </div>
                        <div
                            style={{
                                background: "rgba(255,255,255,0.1)",
                                borderRadius: "20px",
                                padding: "8px 20px",
                                color: "rgba(255,255,255,0.8)",
                                fontSize: "16px",
                                fontWeight: 600,
                            }}
                        >
                            {product.category}
                        </div>
                    </div>

                    {/* Product name */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <h1
                            style={{
                                color: "white",
                                fontSize: product.name.length > 40 ? "42px" : "52px",
                                fontWeight: 900,
                                lineHeight: 1.1,
                                margin: 0,
                                maxWidth: "900px",
                            }}
                        >
                            {product.name}
                        </h1>

                        {/* Price + THC badges */}
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                            {product.price > 0 && (
                                <div
                                    style={{
                                        background: BRAND_GOLD,
                                        color: BRAND_GREEN,
                                        padding: "10px 24px",
                                        borderRadius: "12px",
                                        fontSize: "28px",
                                        fontWeight: 900,
                                    }}
                                >
                                    ${product.price.toFixed(2)} CAD
                                </div>
                            )}
                            {product.specs.thc !== "TBD" && (
                                <div
                                    style={{
                                        background: "rgba(255,255,255,0.1)",
                                        border: "1px solid rgba(255,255,255,0.2)",
                                        color: "white",
                                        padding: "10px 20px",
                                        borderRadius: "12px",
                                        fontSize: "20px",
                                        fontWeight: 700,
                                    }}
                                >
                                    {product.specs.thc} THC
                                </div>
                            )}
                            <div
                                style={{
                                    background: "rgba(255,255,255,0.1)",
                                    border: "1px solid rgba(255,255,255,0.2)",
                                    color: "white",
                                    padding: "10px 20px",
                                    borderRadius: "12px",
                                    fontSize: "20px",
                                    fontWeight: 700,
                                }}
                            >
                                {product.specs.type}
                            </div>
                        </div>

                        {/* Terpene dots */}
                        {product.specs.terpenes.length > 0 && (
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                {product.specs.terpenes.slice(0, 4).map((t) => (
                                    <div
                                        key={t}
                                        style={{
                                            background: "rgba(255,255,255,0.1)",
                                            border: "1px solid rgba(255,255,255,0.15)",
                                            color: "rgba(255,255,255,0.7)",
                                            padding: "6px 14px",
                                            borderRadius: "20px",
                                            fontSize: "14px",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {t}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Bottom: tagline */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "16px" }}>
                            Premium Indigenous Cannabis — Six Nations Territory
                        </span>
                        <span style={{ color: BRAND_GOLD, fontSize: "14px", fontWeight: 700, letterSpacing: "0.15em" }}>
                            EMPIRE STANDARD™
                        </span>
                    </div>
                </div>
            </div>
        ),
        { width: 1200, height: 630 }
    );
}

function blogOG(slug: string) {
    const post = BLOG_POSTS.find((p) => p.slug === slug);
    if (!post) {
        return new Response("Blog post not found", { status: 404 });
    }

    return new ImageResponse(
        (
            <div
                style={{
                    width: "1200px",
                    height: "630px",
                    display: "flex",
                    background: `linear-gradient(135deg, #0D1F0A 0%, ${BRAND_GREEN} 50%, #234E3C 100%)`,
                    fontFamily: "sans-serif",
                    position: "relative",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        padding: "60px",
                        width: "100%",
                        height: "100%",
                    }}
                >
                    {/* Top */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    background: BRAND_GOLD,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "20px",
                                    fontWeight: 900,
                                    color: BRAND_GREEN,
                                }}
                            >
                                M
                            </div>
                            <span style={{ color: "white", fontSize: "20px", fontWeight: 700, letterSpacing: "0.1em" }}>
                                MOHAWK MEDIBLES BLOG
                            </span>
                        </div>
                        <div
                            style={{
                                background: BRAND_GOLD,
                                color: BRAND_GREEN,
                                borderRadius: "20px",
                                padding: "8px 20px",
                                fontSize: "14px",
                                fontWeight: 700,
                            }}
                        >
                            {post.category}
                        </div>
                    </div>

                    {/* Title */}
                    <h1
                        style={{
                            color: "white",
                            fontSize: post.title.length > 50 ? "40px" : "48px",
                            fontWeight: 900,
                            lineHeight: 1.15,
                            margin: 0,
                            maxWidth: "1000px",
                        }}
                    >
                        {post.title}
                    </h1>

                    {/* Bottom */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "16px" }}>
                                {post.author}
                            </span>
                            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "16px" }}>•</span>
                            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "16px" }}>
                                {post.readTime}
                            </span>
                        </div>
                        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>
                            mohawkmedibles.ca
                        </span>
                    </div>
                </div>
            </div>
        ),
        { width: 1200, height: 630 }
    );
}

function categoryOG(categoryName: string) {
    const count = PRODUCTS.filter((p) => p.category === categoryName).length;

    return new ImageResponse(
        (
            <div
                style={{
                    width: "1200px",
                    height: "630px",
                    display: "flex",
                    background: `linear-gradient(135deg, ${BRAND_GREEN} 0%, #0D1F0A 100%)`,
                    fontFamily: "sans-serif",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "24px",
                    }}
                >
                    <div
                        style={{
                            background: BRAND_GOLD,
                            color: BRAND_GREEN,
                            padding: "12px 32px",
                            borderRadius: "24px",
                            fontSize: "18px",
                            fontWeight: 700,
                            letterSpacing: "0.15em",
                        }}
                    >
                        MOHAWK MEDIBLES
                    </div>
                    <h1
                        style={{
                            color: "white",
                            fontSize: "64px",
                            fontWeight: 900,
                            margin: 0,
                        }}
                    >
                        {categoryName || "Shop"}
                    </h1>
                    <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "24px" }}>
                        {count > 0 ? `${count} Premium Products` : "Browse Our Collection"}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "16px" }}>
                        Premium Indigenous Cannabis — Six Nations Territory
                    </span>
                </div>
            </div>
        ),
        { width: 1200, height: 630 }
    );
}
