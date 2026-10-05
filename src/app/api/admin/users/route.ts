import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
        customerProfile: true,
        driverProfile: true,
      },
    });

    return NextResponse.json({ success: true, data: { users } });
  } catch (error) {
    return NextResponse.json({ success: false, error: { message: "Failed to fetch users" } }, { status: 500 });
  }
}
