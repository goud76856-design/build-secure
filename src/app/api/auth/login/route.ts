import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { comparePassword, signSessionToken, setSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import { logAuditEvent, extractClientIp } from "@/lib/audit";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const ip = extractClientIp(req);
    const { allowed } = checkRateLimit(`login:${ip}`, 15, 60000);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: { message: "Too many login attempts. Please wait a minute before trying again." } },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid credentials format", fieldErrors: result.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid email or password" } },
        { status: 401 }
      );
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid email or password" } },
        { status: 401 }
      );
    }

    const token = await signSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "CUSTOMER" | "DRIVER" | "ADMIN",
    });

    setSessionCookie(token);

    await logAuditEvent({
      actorId: user.id,
      action: "LOGIN",
      entityType: "User",
      entityId: user.id,
      metadata: { role: user.role },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
    });

    // Determine default redirect path based on role
    let redirectPath = "/customer/dashboard";
    if (user.role === "DRIVER") redirectPath = "/driver/dashboard";
    if (user.role === "ADMIN") redirectPath = "/admin/dashboard";

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        redirectPath,
      },
      message: "Successfully signed in",
    });
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Authentication service error" } },
      { status: 500 }
    );
  }
}
