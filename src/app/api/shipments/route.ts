import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { createShipmentSchema } from "@/lib/validators";
import { generateTrackingNumber } from "@/lib/tracking";
import { calculateShippingQuote, calculateEstimatedDeliveryDate } from "@/lib/pricing";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const search = searchParams.get("search")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const skip = (page - 1) * limit;

    // Role-based where condition
    const where: any = {};

    if (session.role === "CUSTOMER") {
      where.customerId = session.id;
    } else if (session.role === "DRIVER") {
      where.assignedDriverId = session.id;
    }
    // Admin has access to all

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (priority && priority !== "ALL") {
      where.priority = priority;
    }

    if (search) {
      where.OR = [
        { trackingNumber: { contains: search } },
        { packageDescription: { contains: search } },
        { addresses: { some: { name: { contains: search } } } },
        { addresses: { some: { city: { contains: search } } } },
      ];
    }

    const [shipments, totalCount] = await Promise.all([
      prisma.shipment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          addresses: true,
          serviceLevel: { select: { name: true, estimatedDays: true } },
          assignedDriver: { select: { id: true, name: true, phone: true } },
          customer: { select: { id: true, name: true, email: true } },
          events: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      }),
      prisma.shipment.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        shipments,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error: any) {
    console.error("List shipments API error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to retrieve shipments" } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });
    }

    if (session.role === "DRIVER") {
      return NextResponse.json(
        { success: false, error: { message: "Delivery personnel are not permitted to create shipments" } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const result = createShipmentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid shipment form data", fieldErrors: result.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const data = result.data;

    // Fetch service level to verify and calculate pricing
    const serviceLevel = await prisma.serviceLevel.findUnique({
      where: { id: data.serviceLevelId },
    });

    if (!serviceLevel || !serviceLevel.isActive) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid or inactive service level selected" } },
        { status: 400 }
      );
    }

    const calculatedPrice = calculateShippingQuote({
      basePrice: serviceLevel.basePrice,
      pricePerWeightUnit: serviceLevel.pricePerWeightUnit,
      weight: data.weight,
      length: data.length,
      width: data.width,
      height: data.height,
      declaredValue: data.declaredValue,
      fragile: data.fragile,
    });

    const estimatedDeliveryDate = calculateEstimatedDeliveryDate(serviceLevel.estimatedDays);
    const trackingNumber = generateTrackingNumber();

    const shipment = await prisma.shipment.create({
      data: {
        trackingNumber,
        customerId: session.id,
        serviceLevelId: serviceLevel.id,
        status: "CREATED",
        priority: data.priority,
        estimatedDeliveryDate,
        price: calculatedPrice,
        currency: "USD",
        packageDescription: data.packageDescription,
        packageType: data.packageType,
        weight: data.weight,
        length: data.length,
        width: data.width,
        height: data.height,
        quantity: data.quantity,
        declaredValue: data.declaredValue,
        fragile: data.fragile,
        specialInstructions: data.specialInstructions || null,
        addresses: {
          create: [
            {
              type: "SENDER",
              name: data.sender.name,
              companyName: data.sender.companyName || null,
              email: data.sender.email || null,
              phone: data.sender.phone,
              addressLine1: data.sender.addressLine1,
              addressLine2: data.sender.addressLine2 || null,
              city: data.sender.city,
              state: data.sender.state,
              postalCode: data.sender.postalCode,
              country: data.sender.country,
            },
            {
              type: "RECIPIENT",
              name: data.recipient.name,
              companyName: data.recipient.companyName || null,
              email: data.recipient.email || null,
              phone: data.recipient.phone,
              addressLine1: data.recipient.addressLine1,
              addressLine2: data.recipient.addressLine2 || null,
              city: data.recipient.city,
              state: data.recipient.state,
              postalCode: data.recipient.postalCode,
              country: data.recipient.country,
            },
          ],
        },
        events: {
          create: {
            previousStatus: null,
            newStatus: "CREATED",
            note: "Shipment manifest created online by customer",
            createdById: session.id,
          },
        },
      },
      include: {
        addresses: true,
        serviceLevel: true,
      },
    });

    await logAuditEvent({
      actorId: session.id,
      action: "CREATE_SHIPMENT",
      entityType: "Shipment",
      entityId: shipment.id,
      metadata: { trackingNumber, price: calculatedPrice, serviceLevel: serviceLevel.name },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
    });

    return NextResponse.json({
      success: true,
      data: { shipment },
      message: "Shipment created successfully",
    });
  } catch (error: any) {
    console.error("Create shipment API error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to create shipment" } },
      { status: 500 }
    );
  }
}
