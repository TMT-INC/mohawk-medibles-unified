import { ImageResponse } from "next/og";
import { getAllBlogPosts, getAllBlogCategories } from "@/data/blog/posts";

export const runtime = "edge";
export const alt = "Cannabis Knowledge Hub — Mohawk Medibles Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LIME = "#84CC16";
const DARK_BG_START = "#0A0F0A";
const DARK_BG_MID = "#111A11";
const DARK_BG_END = "#0D1F0A";

export default async function OGImage() {
    const totalPosts = getAllBlogPosts().length;
    const categories = getAllBlogCategories();

    return new ImageResponse(
        (
            <div
                style={{
                    width: "1200px",
                    height: "630px",
                    display: "flex",
                    background: `linear-gradient(145deg, ${DARK_BG_START} 0%, ${DARK_BG_MID} 40%, ${DARK_BG_END} 100%)`,
                    fontFamily: "sans-serif",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Subtle dot grid */}
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        opacity: 0.04,
                        backgroundImage:
                            "radial-gradient(circle at 25px 25px, white 1.5px, transparent 0)",
                        backgroundSize: "50px 50px",
                        display: "flex",
                    }}
                />

                {/* Lime glow top-right */}
                <div
                    style={{
                        position: "absolute",
                        top: "-100px",
                        right: "-100px",
                        width: "500px",
                        height: "500px",
                        borderRadius: "50%",
                        background: LIME,
                        opacity: 0.06,
                        filter: "blur(100px)",
                        display: "flex",
                    }}
                />

                {/* Main content */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        padding: "56px 64px",
                        width: "100%",
                        height: "100%",
                        position: "relative",
                    }}
                >
                    {/* Top: branding */}
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div
                            style={{
                                width: "42px",
                                height: "42px",
                                borderRadius: "50%",
                                background: LIME,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "22px",
                                fontWeight: 900,
                                color: DARK_BG_START,
                            }}
                        >
                            M
                        </div>
                        <span
                            style={{
                                color: "rgba(255,255,255,0.85)",
                                fontSize: "18px",
                                fontWeight: 700,
                                letterSpacing: "0.12em",
                                textTransform: "uppercase",
                            }}
                        >
                            Mohawk Medibles
                        </span>
                    </div>

                    {/* Center: title + subtitle */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <h1
                            style={{
                                color: "white",
                                fontSize: "56px",
                                fontWeight: 900,
                                lineHeight: 1.1,
                                margin: 0,
                                letterSpacing: "-0.02em",
                            }}
                        >
                            Cannabis Knowledge Hub
                        </h1>
                        <p
                            style={{
                                color: "rgba(255,255,255,0.55)",
                                fontSize: "22px",
                                margin: 0,
                                maxWidth: "700px",
                                lineHeight: 1.5,
                            }}
                        >
                            Expert guides, dosage information, strain reviews, and
                            industry news from Six Nations territory.
                        </p>

                        {/* Lime underline */}
                        <div
                            style={{
                                width: "80px",
                                height: "4px",
                                background: LIME,
                                borderRadius: "2px",
                                display: "flex",
                            }}
                        />
                    </div>

                    {/* Bottom: stats + categories */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                            {/* Article count badge */}
                            <div
                                style={{
                                    background: "rgba(132,204,22,0.12)",
                                    border: "1px solid rgba(132,204,22,0.25)",
                                    borderRadius: "16px",
                                    padding: "8px 18px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }}
                            >
                                <span style={{ color: LIME, fontSize: "16px", fontWeight: 800 }}>
                                    {totalPosts}
                                </span>
                                <span
                                    style={{
                                        color: "rgba(255,255,255,0.6)",
                                        fontSize: "14px",
                                        fontWeight: 600,
                                    }}
                                >
                                    Articles
                                </span>
                            </div>

                            {/* Category pills */}
                            {categories.slice(0, 4).map((cat) => (
                                <div
                                    key={cat}
                                    style={{
                                        background: "rgba(255,255,255,0.06)",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        borderRadius: "16px",
                                        padding: "8px 16px",
                                        color: "rgba(255,255,255,0.5)",
                                        fontSize: "13px",
                                        fontWeight: 600,
                                    }}
                                >
                                    {cat}
                                </div>
                            ))}
                        </div>

                        <span
                            style={{
                                color: "rgba(255,255,255,0.3)",
                                fontSize: "14px",
                                fontWeight: 500,
                            }}
                        >
                            mohawkmedibles.ca/blog
                        </span>
                    </div>
                </div>
            </div>
        ),
        { ...size }
    );
}
