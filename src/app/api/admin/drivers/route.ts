import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 403 });
    }

    const drivers = await prisma.user.findMany({
      where: { role: "DRIVER" },
      include: {
        driverProfile: true,
        assignedDeliveries: {
          where: { status: { in: ["PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY"] } },
          select: { id: true, trackingNumber: true, status: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: { drivers },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: "Failed to fetch drivers" } }, { status: 500 });
  }
}
