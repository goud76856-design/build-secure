import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const serviceLevels = await prisma.serviceLevel.findMany({
      where: { isActive: true },
      orderBy: { basePrice: "asc" },
    });
    return NextResponse.json({
      success: true,
      data: { serviceLevels },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: "Failed to load service levels" } }, { status: 500 });
  }
}
