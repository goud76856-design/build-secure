import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { assignDriverSchema } from "@/lib/validators";
import { logAuditEvent } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: { message: "Only administrators can assign shipments to delivery personnel" } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const result = assignDriverSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid driver ID", fieldErrors: result.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const { driverId } = result.data;

    // Verify driver exists and has DRIVER role
    const driver = await prisma.user.findFirst({
      where: { id: driverId, role: "DRIVER", isActive: true },
      include: { driverProfile: true },
    });

    if (!driver) {
      return NextResponse.json(
        { success: false, error: { message: "Selected driver does not exist or is inactive" } },
        { status: 404 }
      );
    }

    const shipment = await prisma.shipment.update({
      where: { id: params.id },
      data: { assignedDriverId: driver.id },
      include: { addresses: true },
    });

    // Notify driver
    await prisma.notification.create({
      data: {
        recipientId: driver.id,
        type: "ASSIGNMENT",
        title: "New Shipment Assigned",
        message: `Shipment ${shipment.trackingNumber} has been assigned to your route.`,
        shipmentId: shipment.id,
      },
    });

    // Audit log
    await logAuditEvent({
      actorId: session.id,
      action: "ASSIGN_DRIVER",
      entityType: "Shipment",
      entityId: shipment.id,
      metadata: { driverId: driver.id, driverName: driver.name },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
    });

    return NextResponse.json({
      success: true,
      data: { shipment },
      message: `Shipment assigned to ${driver.name}`,
    });
  } catch (error: any) {
    console.error("Assign driver API error:", error);
    return NextResponse.json({ success: false, error: { message: "Failed to assign driver" } }, { status: 500 });
  }
}
