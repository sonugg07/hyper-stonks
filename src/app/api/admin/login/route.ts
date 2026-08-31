import { NextRequest, NextResponse } from "next/server";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "stonks_admin_super_secret_2026";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (
      (username === "admin" && (password === "admin123" || password === ADMIN_SECRET)) ||
      password === ADMIN_SECRET
    ) {
      const response = NextResponse.json({
        success: true,
        message: "Admin authenticated successfully",
        token: ADMIN_SECRET,
      });

      // Set secure session cookie
      response.cookies.set("stonks_admin_session", ADMIN_SECRET, {
        httpOnly: false, // Accessible to client admin state
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Authentication failed" }, { status: 500 });
  }
}
