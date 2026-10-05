import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { updateStatusSchema } from "@/lib/validators";
import { validateStatusTransition } from "@/lib/stateMachine";
import { logAuditEvent } from "@/lib/audit";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });
    }

    const shipment = await prisma.shipment.findUnique({
      where: { id: params.id },
      include: {
        addresses: true,
        events: {
          orderBy: { createdAt: "desc" },
          include: { createdBy: { select: { name: true, role: true } } },
        },
        serviceLevel: true,
        assignedDriver: { select: { id: true, name: true, phone: true, driverProfile: true } },
        customer: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!shipment) {
      return NextResponse.json({ success: false, error: { message: "Shipment not found" } }, { status: 404 });
    }

    // Role-based access check
    if (session.role === "CUSTOMER" && shipment.customerId !== session.id) {
      return NextResponse.json({ success: false, error: { message: "Access forbidden" } }, { status: 403 });
    }

    if (session.role === "DRIVER" && shipment.assignedDriverId !== session.id) {
      return NextResponse.json({ success: false, error: { message: "Access forbidden" } }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: { shipment },
    });
  } catch (error: any) {
    console.error("Get shipment API error:", error);
    return NextResponse.json({ success: false, error: { message: "Failed to retrieve shipment" } }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });
    }

    const body = await req.json();
    const result = updateStatusSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid payload", fieldErrors: result.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const { targetStatus, note, failureReason, signatureUrl, proofOfDeliveryUrl, isOverride } = result.data;

    const shipment = await prisma.shipment.findUnique({
      where: { id: params.id },
    });

    if (!shipment) {
      return NextResponse.json({ success: false, error: { message: "Shipment not found" } }, { status: 404 });
    }

    // Authorization checks
    if (session.role === "CUSTOMER") {
      if (shipment.customerId !== session.id) {
        return NextResponse.json({ success: false, error: { message: "Unauthorized to modify this shipment" } }, { status: 403 });
      }
    } else if (session.role === "DRIVER") {
      if (shipment.assignedDriverId !== session.id) {
        return NextResponse.json({ success: false, error: { message: "Cannot modify unassigned shipment" } }, { status: 403 });
      }
    } else if (session.role === "ADMIN") {
      // Admin has override capabilities when justified
      if (isOverride && !note) {
        return NextResponse.json(
          { success: false, error: { message: "Admin status overrides require an explicit justification note" } },
          { status: 400 }
        );
      }
    }

    // State machine transition validation
    const transitionCheck = validateStatusTransition(
      shipment.status,
      targetStatus,
      session.role,
      isOverride && session.role === "ADMIN"
    );

    if (!transitionCheck.allowed) {
      return NextResponse.json(
        { success: false, error: { message: transitionCheck.reason || "Invalid status transition" } },
        { status: 400 }
      );
    }

    // Validation for specific terminal/failure states
    if (targetStatus === "DELIVERY_FAILED" && !failureReason) {
      return NextResponse.json(
        { success: false, error: { message: "Failure reason is required when marking DELIVERY_FAILED" } },
        { status: 400 }
      );
    }

    const updateData: any = {
      status: targetStatus,
    };

    if (targetStatus === "DELIVERED") {
      updateData.actualDeliveryDate = new Date();
    }

    const updatedShipment = await prisma.shipment.update({
      where: { id: params.id },
      data: updateData,
    });

    // Create timeline event
    await prisma.shipmentEvent.create({
      data: {
        shipmentId: shipment.id,
        previousStatus: shipment.status,
        newStatus: targetStatus,
        note: note || (isOverride ? `Admin override: ${note}` : `Status updated to ${targetStatus}`),
        failureReason: failureReason || null,
        signatureUrl: signatureUrl || null,
        proofOfDeliveryUrl: proofOfDeliveryUrl || null,
        createdById: session.id,
      },
    });

    // Notify customer
    await prisma.notification.create({
      data: {
        recipientId: shipment.customerId,
        type: "STATUS_CHANGE",
        title: `Shipment Status: ${targetStatus}`,
        message: `Your package ${shipment.trackingNumber} status is now ${targetStatus}. ${note || ""}`,
        shipmentId: shipment.id,
      },
    });

    // Record audit log
    await logAuditEvent({
      actorId: session.id,
      action: "UPDATE_STATUS",
      entityType: "Shipment",
      entityId: shipment.id,
      metadata: {
        previousStatus: shipment.status,
        newStatus: targetStatus,
        isOverride: Boolean(isOverride),
        reason: failureReason || note,
      },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
    });

    return NextResponse.json({
      success: true,
      data: { shipment: updatedShipment },
      message: `Status updated to ${targetStatus}`,
    });
  } catch (error: any) {
    console.error("Update shipment API error:", error);
    return NextResponse.json({ success: false, error: { message: "Failed to update shipment" } }, { status: 500 });
  }
}
