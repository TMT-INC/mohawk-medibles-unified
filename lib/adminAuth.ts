/**
 * Admin Route Auth — Defense-in-Depth
 * ════════════════════════════════════
 * Verifies JWT from cookie directly in route handlers.
 * Middleware already validates, but this provides a second layer.
 */
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "LOGISTICS", "SUPPORT"];

interface AdminUser {
  userId: string;
  role: string;
  email: string;
}

/**
 * Verify the caller is an authenticated admin.
 * Returns the user info or a 401/403 NextResponse.
 */
export function requireAdmin(
  req: NextRequest
): AdminUser | NextResponse {
  const token =
    req.cookies.get("mm-session")?.value ||
    req.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const payload = verifySessionToken(token);
  if (!payload) {
    return NextResponse.json(
      { error: "Invalid or expired session" },
      { status: 401 }
    );
  }

  if (!ADMIN_ROLES.includes(payload.role)) {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }

  return {
    userId: payload.sub,
    role: payload.role,
    email: payload.email,
  };
}

/** Type guard: true if the result is an error response */
export function isAuthError(
  result: AdminUser | NextResponse
): result is NextResponse {
  return result instanceof NextResponse;
}
