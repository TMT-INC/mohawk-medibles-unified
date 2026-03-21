import { ImageResponse } from "next/og";
import { getBlogPost } from "@/data/blog/posts";

export const runtime = "edge";
export const alt = "Mohawk Medibles Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LIME = "#84CC16";
const DARK_BG_START = "#0A0F0A";
const DARK_BG_MID = "#111A11";
const DARK_BG_END = "#0D1F0A";


export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = getBlogPost(slug);

    if (!post) {
        return new ImageResponse(
            (
                <div
                    style={{
                        width: "1200px",
                        height: "630px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: DARK_BG_START,
                        color: "white",
                        fontSize: "48px",
                        fontFamily: "sans-serif",
                    }}
                >
                    Post Not Found
                </div>
            ),
            { ...size }
        );
    }

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
                {/* Subtle dot grid background */}
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

                {/* Lime accent glow — top right */}
                <div
                    style={{
                        position: "absolute",
                        top: "-80px",
                        right: "-80px",
                        width: "400px",
                        height: "400px",
                        borderRadius: "50%",
                        background: LIME,
                        opacity: 0.06,
                        filter: "blur(80px)",
                        display: "flex",
                    }}
                />

                {/* Lime accent glow — bottom left */}
                <div
                    style={{
                        position: "absolute",
                        bottom: "-60px",
                        left: "-60px",
                        width: "300px",
                        height: "300px",
                        borderRadius: "50%",
                        background: LIME,
                        opacity: 0.04,
                        filter: "blur(60px)",
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
                    {/* Top row: branding + category badge */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "14px",
                            }}
                        >
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
                                Mohawk Medibles Blog
                            </span>
                        </div>

                        {/* Category badge */}
                        <div
                            style={{
                                background: LIME,
                                color: DARK_BG_START,
                                borderRadius: "24px",
                                padding: "8px 22px",
                                fontSize: "14px",
                                fontWeight: 800,
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                            }}
                        >
                            {post.category}
                        </div>
                    </div>

                    {/* Post title */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <h1
                            style={{
                                color: "white",
                                fontSize: post.title.length > 60 ? "38px" : post.title.length > 45 ? "44px" : "50px",
                                fontWeight: 900,
                                lineHeight: 1.15,
                                margin: 0,
                                maxWidth: "1000px",
                                letterSpacing: "-0.02em",
                            }}
                        >
                            {post.title}
                        </h1>

                        {/* Lime underline accent */}
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

                    {/* Bottom row: author + read time */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                gap: "24px",
                                alignItems: "center",
                            }}
                        >
                            {/* Author avatar */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                }}
                            >
                                <div
                                    style={{
                                        width: "36px",
                                        height: "36px",
                                        borderRadius: "50%",
                                        background: "rgba(132,204,22,0.15)",
                                        border: "2px solid rgba(132,204,22,0.3)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "14px",
                                        fontWeight: 800,
                                        color: LIME,
                                    }}
                                >
                                    MM
                                </div>
                                <span
                                    style={{
                                        color: "rgba(255,255,255,0.7)",
                                        fontSize: "16px",
                                        fontWeight: 600,
                                    }}
                                >
                                    {post.author}
                                </span>
                            </div>

                            <span
                                style={{
                                    color: "rgba(255,255,255,0.25)",
                                    fontSize: "16px",
                                }}
                            >
                                |
                            </span>

                            {/* Read time badge */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    background: "rgba(132,204,22,0.1)",
                                    border: "1px solid rgba(132,204,22,0.2)",
                                    borderRadius: "16px",
                                    padding: "6px 14px",
                                }}
                            >
                                <span style={{ color: LIME, fontSize: "14px", fontWeight: 700 }}>
                                    {post.readTime} read
                                </span>
                            </div>
                        </div>

                        <span
                            style={{
                                color: "rgba(255,255,255,0.3)",
                                fontSize: "14px",
                                fontWeight: 500,
                            }}
                        >
                            mohawkmedibles.ca
                        </span>
                    </div>
                </div>
            </div>
        ),
        { ...size }
    );
}
