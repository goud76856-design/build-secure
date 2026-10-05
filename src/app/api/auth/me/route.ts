import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json(
      { success: false, error: { message: "Unauthenticated" } },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      avatarUrl: true,
      customerProfile: true,
      driverProfile: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { success: false, error: { message: "User not found" } },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: { user },
  });
}
