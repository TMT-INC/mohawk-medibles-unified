import { NextResponse } from "next/server";
import { log } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

interface RouteParams {
    params: Promise<{ slug: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { slug } = await params;

        const dispensary = await prisma.dispensary.findUnique({
            where: { slug },
            include: {
                hours: true,
                reviews: {
                    orderBy: { createdAt: "desc" },
                },
                products: true,
                images: true,
            },
        });

        if (!dispensary) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: "Dispensary not found" 
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: dispensary,
        });
    } catch (error) {
        log.admin.error("Error fetching dispensary", { error: error instanceof Error ? error.message : "Unknown" });
        return NextResponse.json(
            { 
                success: false, 
                error: "Failed to fetch dispensary" 
            },
            { status: 500 }
        );
    }
}

// PATCH /api/dispensaries/[slug] - Update dispensary
export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        const { slug } = await params;
        const body = await request.json();

        const dispensary = await prisma.dispensary.update({
            where: { slug },
            data: body,
        });

        return NextResponse.json({
            success: true,
            data: dispensary,
        });
    } catch (error) {
        log.admin.error("Error updating dispensary", { error: error instanceof Error ? error.message : "Unknown" });
        return NextResponse.json(
            { 
                success: false, 
                error: "Failed to update dispensary" 
            },
            { status: 500 }
        );
    }
}

// DELETE /api/dispensaries/[slug] - Delete dispensary
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { slug } = await params;

        await prisma.dispensary.delete({
            where: { slug },
        });

        return NextResponse.json({
            success: true,
            message: "Dispensary deleted successfully",
        });
    } catch (error) {
        log.admin.error("Error deleting dispensary", { error: error instanceof Error ? error.message : "Unknown" });
        return NextResponse.json(
            { 
                success: false, 
                error: "Failed to delete dispensary" 
            },
            { status: 500 }
        );
    }
}
