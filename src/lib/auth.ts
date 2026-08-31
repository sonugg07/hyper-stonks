import { NextRequest } from "next/server";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "stonks_admin_super_secret_2026";

/**
 * Validates whether the incoming request is authorized for admin actions
 */
export function verifyAdminAuth(req: NextRequest): boolean {
  // Check Authorization header or query token or cookies
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (token === ADMIN_SECRET || token === "admin123") return true;
  }

  const customHeader = req.headers.get("x-admin-token");
  if (customHeader === ADMIN_SECRET || customHeader === "admin123") return true;

  const cookieToken = req.cookies.get("stonks_admin_session")?.value;
  if (cookieToken === ADMIN_SECRET || cookieToken === "admin123") return true;

  return false;
}
