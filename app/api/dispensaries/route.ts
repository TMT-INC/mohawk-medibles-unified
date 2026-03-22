import { NextRequest, NextResponse } from "next/server";
import { log } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        
        // Parse query parameters
        const province = searchParams.get("province");
        const city = searchParams.get("city");
        const search = searchParams.get("search");
        const indigenous = searchParams.get("indigenous") === "true";
        const licensed = searchParams.get("licensed") === "true";
        const minRating = searchParams.get("minRating") 
            ? parseFloat(searchParams.get("minRating")!) 
            : undefined;
        const limit = searchParams.get("limit") 
            ? parseInt(searchParams.get("limit")!) 
            : 50;
        const page = searchParams.get("page") 
            ? parseInt(searchParams.get("page")!) 
            : 1;

        // Build where clause
        const where: any = {};

        if (province) {
            where.province = province.toUpperCase();
        }

        if (city) {
            where.city = {
                contains: city,
                mode: "insensitive",
            };
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { city: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }

        if (indigenous) {
            where.isIndigenousOwned = true;
        }

        if (licensed) {
            where.isLicensed = true;
        }

        if (minRating) {
            where.averageRating = {
                gte: minRating,
            };
        }

        // Fetch dispensaries
        const [dispensaries, total] = await Promise.all([
            prisma.dispensary.findMany({
                where,
                include: {
                    images: {
                        where: { isPrimary: true },
                        take: 1,
                    },
                    hours: true,
                    _count: {
                        select: {
                            reviews: true,
                            products: true,
                        },
                    },
                },
                orderBy: [
                    { dataQualityScore: "desc" },
                    { averageRating: "desc" },
                ],
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.dispensary.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: dispensaries,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        log.admin.error("Error fetching dispensaries", { error: error instanceof Error ? error.message : "Unknown" });
        return NextResponse.json(
            { 
                success: false, 
                error: "Failed to fetch dispensaries" 
            },
            { status: 500 }
        );
    }
}

// POST /api/dispensaries - Create new dispensary (admin only)
export async function POST(request: NextRequest) {
    try {
        // Verify admin authentication
        const token =
            request.cookies.get("mm-session")?.value ||
            request.headers.get("Authorization")?.replace("Bearer ", "");
        const session = token ? verifySessionToken(token) : null;
        if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        // Validate required fields
        if (!body.name || !body.address || !body.city || !body.province) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: "Missing required fields: name, address, city, province" 
                },
                { status: 400 }
            );
        }

        // Generate slug
        const slug = body.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
            + "-" 
            + body.city.toLowerCase().replace(/\s+/g, "-");

        // Only allow specific fields (prevent mass assignment)
        const dispensary = await prisma.dispensary.create({
            data: {
                name: body.name,
                slug,
                address: body.address,
                city: body.city,
                province: body.province,
                postalCode: body.postalCode,
                phone: body.phone,
                email: body.email,
                website: body.website,
                description: body.description,
                isIndigenousOwned: body.isIndigenousOwned,
                isLicensed: body.isLicensed,
                latitude: body.latitude,
                longitude: body.longitude,
            },
        });

        return NextResponse.json({
            success: true,
            data: dispensary,
        }, { status: 201 });
    } catch (error) {
        log.admin.error("Error creating dispensary", { error: error instanceof Error ? error.message : "Unknown" });
        return NextResponse.json(
            { 
                success: false, 
                error: "Failed to create dispensary" 
            },
            { status: 500 }
        );
    }
}
