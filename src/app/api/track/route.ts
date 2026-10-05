import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { maskName, maskAddress } from "@/lib/tracking";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const trackingNumber = searchParams.get("number")?.trim();

    if (!trackingNumber) {
      return NextResponse.json(
        { success: false, error: { message: "Tracking number is required" } },
        { status: 400 }
      );
    }

    const shipment = await prisma.shipment.findUnique({
      where: { trackingNumber },
      include: {
        addresses: true,
        events: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            previousStatus: true,
            newStatus: true,
            note: true,
            failureReason: true,
            createdAt: true,
          },
        },
        serviceLevel: {
          select: { name: true, estimatedDays: true },
        },
      },
    });

    if (!shipment) {
      return NextResponse.json(
        { success: false, error: { message: "No shipment found with this tracking number" } },
        { status: 404 }
      );
    }

    const senderAddr = shipment.addresses.find((a) => a.type === "SENDER");
    const recipientAddr = shipment.addresses.find((a) => a.type === "RECIPIENT");

    // Privacy-safe DTO
    const trackingData = {
      trackingNumber: shipment.trackingNumber,
      status: shipment.status,
      priority: shipment.priority,
      packageType: shipment.packageType,
      estimatedDeliveryDate: shipment.estimatedDeliveryDate,
      actualDeliveryDate: shipment.actualDeliveryDate,
      serviceLevel: shipment.serviceLevel.name,
      origin: senderAddr ? maskAddress(senderAddr.city, senderAddr.state, senderAddr.country) : "Unknown Origin",
      destination: recipientAddr ? maskAddress(recipientAddr.city, recipientAddr.state, recipientAddr.country) : "Unknown Destination",
      senderMaskedName: senderAddr ? maskName(senderAddr.name) : "",
      recipientMaskedName: recipientAddr ? maskName(recipientAddr.name) : "",
      timeline: shipment.events,
    };

    return NextResponse.json({
      success: true,
      data: trackingData,
    });
  } catch (error: any) {
    console.error("Public tracking API error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to query tracking information" } },
      { status: 500 }
    );
  }
}
