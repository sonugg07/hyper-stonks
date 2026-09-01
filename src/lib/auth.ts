import { NextRequest } from "next/server";
import crypto from "crypto";

export const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "Mewtwogg";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Mewtwo@7860";
export const ADMIN_SECRET = process.env.ADMIN_SECRET || "stonks_admin_super_secret_2026";

/**
 * Creates a sha256 hash for password comparisons
 */
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + ADMIN_SECRET).digest("hex");
}

/**
 * Verifies admin credentials safely without exposing secrets
 */
export function verifyCredentials(username: string, pass: string): boolean {
  if (!username || !pass) return false;
  const validUser = username.trim().toLowerCase() === ADMIN_USERNAME.toLowerCase();
  const validPass = pass === ADMIN_PASSWORD || pass === ADMIN_SECRET;
  return validUser && validPass;
}

/**
 * Validates whether the incoming request is authorized for admin actions
 */
export function verifyAdminAuth(req: NextRequest): boolean {
  // 1. Check Authorization Bearer Header
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (token === ADMIN_SECRET || token === "stonks_admin_super_secret_2026") return true;
  }

  // 2. Check Custom Header
  const customHeader = req.headers.get("x-admin-token");
  if (customHeader === ADMIN_SECRET || customHeader === "stonks_admin_super_secret_2026") return true;

  // 3. Check Admin Session Cookie
  const cookieToken = req.cookies.get("stonks_admin_session")?.value;
  if (cookieToken === ADMIN_SECRET || cookieToken === "stonks_admin_super_secret_2026") return true;

  return false;
}
