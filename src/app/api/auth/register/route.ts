import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, signSessionToken, setSessionCookie } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";
import { logAuditEvent } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid registration data", fieldErrors: result.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const { name, email, phone, password, companyName, defaultAddress } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: { message: "An account with this email already exists" } },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        phone: phone || null,
        passwordHash,
        role: "CUSTOMER", // Public registration strictly creates CUSTOMER accounts
        customerProfile: {
          create: {
            companyName: companyName || null,
            defaultAddress: defaultAddress || null,
          },
        },
      },
    });

    const token = await signSessionToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: "CUSTOMER",
    });

    setSessionCookie(token);

    await logAuditEvent({
      actorId: newUser.id,
      action: "REGISTER",
      entityType: "User",
      entityId: newUser.id,
      metadata: { role: "CUSTOMER" },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
    });

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: "CUSTOMER",
        },
        redirectPath: "/customer/dashboard",
      },
      message: "Customer account successfully created",
    });
  } catch (error: any) {
    console.error("Register API error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to create account" } },
      { status: 500 }
    );
  }
}
