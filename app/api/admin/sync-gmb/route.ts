import { NextRequest, NextResponse } from "next/server";
import { getGMBIntegration } from "@/lib/gmb-integration";
import { requireAdmin, isAuthError } from "@/lib/adminAuth";

/**
 * POST /api/admin/sync-gmb
 * Admin endpoint to sync GMB data
 */
export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isAuthError(auth)) return auth;

  try {
    const result = await getGMBIntegration().syncAllLocations();

    return NextResponse.json({
      success: true,
      message: `Synced ${result.success} locations successfully`,
      failed: result.failed,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to sync GMB data" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/sync-gmb
 * Get GMB sync status
 */
export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isAuthError(auth)) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "locations") {
      const locations = await getGMBIntegration().fetchAllLocations();
      return NextResponse.json({
        success: true,
        count: locations.length,
        locations: locations.map((l: any) => ({
          name: l.name,
          locationName: l.locationName,
          address: l.address,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      status: "ready",
      message: "GMB integration is configured",
      envCheck: {
        hasClientEmail: !!process.env.GMB_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.GMB_PRIVATE_KEY,
        hasAccountName: !!process.env.GMB_ACCOUNT_NAME,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch GMB status" },
      { status: 500 }
    );
  }
}
