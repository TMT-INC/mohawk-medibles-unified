/**
 * Dynamic OG Image Generator — Province Hub Pages
 * ═════════════════════════════════════════════════
 * Generates unique 1200x630 branded OG images for each province delivery page.
 */

import { ImageResponse } from "next/og";
import { getProvince } from "@/lib/seo/city-delivery-data";

export const runtime = "edge";
export const alt = "Cannabis Delivery";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
    params,
}: {
    params: Promise<{ province: string }>;
}) {
    const { province: provinceSlug } = await params;
    const province = getProvince(provinceSlug);

    const provinceName = province?.name ?? provinceSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const cityCount = province?.cities.length ?? 0;
    const deliveryTime = province?.deliveryTime ?? "1-5 business days";

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "60px",
                    background: "linear-gradient(135deg, #2D5016 0%, #1A1A2E 100%)",
                    fontFamily: "system-ui, sans-serif",
                }}
            >
                {/* Top: Brand Name + Accent Line */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                        }}
                    >
                        <div
                            style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "12px",
                                background: "#C8E63E",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "24px",
                                fontWeight: 800,
                                color: "#1A1A2E",
                            }}
                        >
                            M
                        </div>
                        <span
                            style={{
                                fontSize: "28px",
                                fontWeight: 700,
                                color: "#C8E63E",
                                letterSpacing: "0.05em",
                                textTransform: "uppercase" as const,
                            }}
                        >
                            Mohawk Medibles
                        </span>
                    </div>
                    <div
                        style={{
                            width: "80px",
                            height: "4px",
                            background: "#C8E63E",
                            borderRadius: "2px",
                        }}
                    />
                </div>

                {/* Center: Province Name */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <span
                        style={{
                            fontSize: "22px",
                            fontWeight: 500,
                            color: "rgba(255, 255, 255, 0.6)",
                            textTransform: "uppercase" as const,
                            letterSpacing: "0.15em",
                        }}
                    >
                        Cannabis Delivery Across
                    </span>
                    <span
                        style={{
                            fontSize: "72px",
                            fontWeight: 800,
                            color: "#FFFFFF",
                            lineHeight: 1.05,
                            letterSpacing: "-0.02em",
                        }}
                    >
                        {provinceName}
                    </span>
                    <span
                        style={{
                            fontSize: "28px",
                            fontWeight: 600,
                            color: "rgba(255, 255, 255, 0.5)",
                        }}
                    >
                        {cityCount > 0 ? `${cityCount} Cities Served` : "Province-Wide Coverage"} &bull; {deliveryTime}
                    </span>
                </div>

                {/* Bottom: Badges Row */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "24px",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            background: "rgba(200, 230, 62, 0.15)",
                            border: "1px solid rgba(200, 230, 62, 0.4)",
                            borderRadius: "999px",
                            padding: "10px 24px",
                        }}
                    >
                        <span style={{ fontSize: "18px", fontWeight: 700, color: "#C8E63E" }}>
                            Free Shipping Over $149
                        </span>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            background: "rgba(255, 255, 255, 0.08)",
                            border: "1px solid rgba(255, 255, 255, 0.15)",
                            borderRadius: "999px",
                            padding: "10px 24px",
                        }}
                    >
                        <span style={{ fontSize: "18px", fontWeight: 700, color: "#FFFFFF" }}>
                            360+ Premium Products
                        </span>
                    </div>

                    <div
                        style={{
                            width: "1px",
                            height: "24px",
                            background: "rgba(255, 255, 255, 0.2)",
                        }}
                    />

                    <span
                        style={{
                            fontSize: "16px",
                            fontWeight: 500,
                            color: "rgba(255, 255, 255, 0.5)",
                        }}
                    >
                        Indigenous-Owned &bull; Since 2018
                    </span>
                </div>
            </div>
        ),
        { ...size }
    );
}
