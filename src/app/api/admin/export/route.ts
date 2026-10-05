import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

function sanitizeCsvCell(val: any): string {
  if (val === null || val === undefined) return '""';
  let str = String(val).replace(/"/g, '""');
  // Formula injection defense (prevent excel/calc execution)
  if (str.startsWith("=") || str.startsWith("+") || str.startsWith("-") || str.startsWith("@")) {
    str = `'${str}`;
  }
  return `"${str}"`;
}

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 403 });
    }

    const shipments = await prisma.shipment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        addresses: true,
        serviceLevel: true,
        assignedDriver: { select: { name: true } },
        customer: { select: { name: true, email: true } },
      },
    });

    const headers = [
      "Tracking Number",
      "Status",
      "Priority",
      "Customer Name",
      "Customer Email",
      "Assigned Driver",
      "Service Level",
      "Price (USD)",
      "Package Type",
      "Weight (kg)",
      "Sender City",
      "Recipient City",
      "Created At",
      "Estimated Delivery",
      "Actual Delivery",
    ];

    const rows = shipments.map((s) => {
      const sender = s.addresses.find((a) => a.type === "SENDER");
      const recipient = s.addresses.find((a) => a.type === "RECIPIENT");
      return [
        s.trackingNumber,
        s.status,
        s.priority,
        s.customer?.name || "",
        s.customer?.email || "",
        s.assignedDriver?.name || "Unassigned",
        s.serviceLevel?.name || "",
        s.price.toFixed(2),
        s.packageType,
        s.weight.toString(),
        sender?.city || "",
        recipient?.city || "",
        s.createdAt.toISOString(),
        s.estimatedDeliveryDate.toISOString(),
        s.actualDeliveryDate ? s.actualDeliveryDate.toISOString() : "",
      ]
        .map(sanitizeCsvCell)
        .join(",");
    });

    const csvContent = [headers.map(sanitizeCsvCell).join(","), ...rows].join("\r\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="shipflow_shipments_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error: any) {
    console.error("Export CSV error:", error);
    return NextResponse.json({ success: false, error: { message: "Export failed" } }, { status: 500 });
  }
}
