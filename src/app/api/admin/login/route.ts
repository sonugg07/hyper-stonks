import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials, ADMIN_SECRET } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Please provide both username and password." },
        { status: 400 }
      );
    }

    if (verifyCredentials(username, password)) {
      const response = NextResponse.json({
        success: true,
        message: "Admin authenticated successfully",
        token: ADMIN_SECRET,
      });

      // Set secure session cookie
      response.cookies.set("stonks_admin_session", ADMIN_SECRET, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: "Invalid username or password." },
      { status: 401 }
    );
  } catch (error) {
    console.error("[Admin Login Error]:", error);
    return NextResponse.json(
      { success: false, error: "Authentication service encountered an error." },
      { status: 500 }
    );
  }
}
