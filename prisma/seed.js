const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting ShipFlow database seed...");

  // 1. Clear existing records cleanly
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.shipmentEvent.deleteMany();
  await prisma.shipmentAddress.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.pricingRule.deleteMany();
  await prisma.serviceLevel.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.driverProfile.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.user.deleteMany();

  // Common password hash for demo accounts: "ShipFlow2026!"
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("ShipFlow2026!", salt);

  // 2. Seed System Settings
  await prisma.systemSetting.createMany({
    data: [
      { key: "COMPANY_NAME", value: "ShipFlow Logistics Inc.", description: "Corporate platform branding" },
      { key: "SUPPORT_EMAIL", value: "support@shipflow.com", description: "Default customer service contact" },
      { key: "DEFAULT_CURRENCY", value: "INR", description: "Base billing currency" },
      { key: "SYSTEM_VERSION", value: "v1.4.0-prod", description: "Current deployed kernel release" },
    ],
  });

  // 3. Seed Service Levels
  const standardLevel = await prisma.serviceLevel.create({
    data: {
      name: "Standard",
      description: "Economical reliable ground freight across regional zones",
      estimatedDays: 4,
      basePrice: 15.0,
      pricePerWeightUnit: 2.5,
      isActive: true,
    },
  });

  const expressLevel = await prisma.serviceLevel.create({
    data: {
      name: "Express",
      description: "Priority expedited air shipping with guaranteed SLA",
      estimatedDays: 2,
      basePrice: 35.0,
      pricePerWeightUnit: 4.5,
      isActive: true,
    },
  });

  const sameDayLevel = await prisma.serviceLevel.create({
    data: {
      name: "Same-Day",
      description: "Direct on-demand courier dispatch in metropolitan zones",
      estimatedDays: 0,
      basePrice: 65.0,
      pricePerWeightUnit: 8.0,
      isActive: true,
    },
  });

  // 4. Seed Pricing Rules
  await prisma.pricingRule.createMany({
    data: [
      { serviceLevelId: standardLevel.id, originZone: "NORTH", destinationZone: "NORTH", minimumPrice: 15.0, weightPrice: 2.0, surcharge: 0.0 },
      { serviceLevelId: standardLevel.id, originZone: "NORTH", destinationZone: "SOUTH", minimumPrice: 25.0, weightPrice: 3.5, surcharge: 5.0 },
      { serviceLevelId: expressLevel.id, originZone: "NORTH", destinationZone: "SOUTH", minimumPrice: 45.0, weightPrice: 5.0, surcharge: 10.0 },
      { serviceLevelId: sameDayLevel.id, originZone: "METRO", destinationZone: "METRO", minimumPrice: 65.0, weightPrice: 8.0, surcharge: 15.0 },
    ],
  });

  // 5. Seed Users & Profiles
  // Admin
  const admin = await prisma.user.create({
    data: {
      name: "Eleanor Vance",
      email: "admin@shipflow.com",
      phone: "+1 (555) 019-2834",
      passwordHash,
      role: "ADMIN",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  // Drivers
  const driverJohn = await prisma.user.create({
    data: {
      name: "John Davis",
      email: "driver.john@shipflow.com",
      phone: "+1 (555) 432-1098",
      passwordHash,
      role: "DRIVER",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      driverProfile: {
        create: {
          employeeId: "DRV-101",
          driverReference: "REF-JDAVIS",
          vehicleType: "VAN",
          vehicleNumber: "TX-VAN-4402",
          availabilityStatus: "AVAILABLE",
          rating: 4.92,
          currentZone: "NORTH",
        },
      },
    },
  });

  const driverSarah = await prisma.user.create({
    data: {
      name: "Sarah Jenkins",
      email: "driver.sarah@shipflow.com",
      phone: "+1 (555) 765-4321",
      passwordHash,
      role: "DRIVER",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      driverProfile: {
        create: {
          employeeId: "DRV-102",
          driverReference: "REF-SJENK",
          vehicleType: "BIKE",
          vehicleNumber: "TX-BIK-9104",
          availabilityStatus: "ON_DUTY",
          rating: 4.98,
          currentZone: "CENTRAL",
        },
      },
    },
  });

  const driverMike = await prisma.user.create({
    data: {
      name: "Mike Kowalski",
      email: "driver.mike@shipflow.com",
      phone: "+1 (555) 889-1234",
      passwordHash,
      role: "DRIVER",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      driverProfile: {
        create: {
          employeeId: "DRV-103",
          driverReference: "REF-MKOW",
          vehicleType: "TRUCK",
          vehicleNumber: "TX-TRK-7721",
          availabilityStatus: "AVAILABLE",
          rating: 4.85,
          currentZone: "METRO",
        },
      },
    },
  });

  // Customers
  const customerAlice = await prisma.user.create({
    data: {
      name: "Alice Zhang",
      email: "customer.alice@gmail.com",
      phone: "+1 (555) 234-5678",
      passwordHash,
      role: "CUSTOMER",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      customerProfile: {
        create: {
          companyName: "Acmetron Technologies Ltd.",
          defaultAddress: "100 Tech Ridge Parkway, Austin, TX 78753",
          preferredContactMethod: "EMAIL",
        },
      },
    },
  });

  const customerBob = await prisma.user.create({
    data: {
      name: "Robert (Bob) Sterling",
      email: "customer.bob@gmail.com",
      phone: "+1 (555) 345-6789",
      passwordHash,
      role: "CUSTOMER",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      customerProfile: {
        create: {
          companyName: "Apex Retail Group",
          defaultAddress: "450 Broadway Suite 900, New York, NY 10013",
          preferredContactMethod: "SMS",
        },
      },
    },
  });

  const customerClara = await prisma.user.create({
    data: {
      name: "Clara Oswald",
      email: "customer.clara@gmail.com",
      phone: "+1 (555) 987-6543",
      passwordHash,
      role: "CUSTOMER",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      customerProfile: {
        create: {
          companyName: "Cosmic Antiquities Studio",
          defaultAddress: "88 Market St, San Francisco, CA 94105",
          preferredContactMethod: "EMAIL",
        },
      },
    },
  });

  // 6. Seed Shipments (12 shipments with full histories and realistic transitions)
  const now = new Date();
  const subDays = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const addDays = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const shipmentSeeds = [
    {
      trackingNumber: "SF-2026-90412",
      customerId: customerAlice.id,
      assignedDriverId: driverJohn.id,
      serviceLevelId: expressLevel.id,
      status: "OUT_FOR_DELIVERY",
      priority: "HIGH",
      estimatedDeliveryDate: addDays(0),
      price: 52.5,
      packageDescription: "Precision Optical Sensors & Circuit Boards",
      packageType: "BOX",
      weight: 3.8,
      length: 30,
      width: 25,
      height: 15,
      fragile: true,
      sender: { name: "Alice Zhang", phone: "+1 555-234-5678", addressLine1: "100 Tech Ridge Pkwy", city: "Austin", state: "TX", postalCode: "78753", country: "US" },
      recipient: { name: "Quantum Labs Austin", phone: "+1 555-888-0011", addressLine1: "400 W Cesar Chavez St", city: "Austin", state: "TX", postalCode: "78701", country: "US" },
      events: [
        { status: "CREATED", prevStatus: null, note: "Shipment manifest generated online", date: subDays(1), actorId: customerAlice.id },
        { status: "CONFIRMED", prevStatus: "CREATED", note: "Dispatch payment pre-authorized", date: subDays(1), actorId: admin.id },
        { status: "PICKED_UP", prevStatus: "CONFIRMED", note: "Package collected by Driver John Davis (VAN-4402)", date: subDays(0.5), actorId: driverJohn.id },
        { status: "IN_TRANSIT", prevStatus: "PICKED_UP", note: "Arrived at Austin Sort Facility Hub", date: subDays(0.3), actorId: driverJohn.id },
        { status: "OUT_FOR_DELIVERY", prevStatus: "IN_TRANSIT", note: "Loaded onto delivery vehicle for final mile delivery", date: subDays(0.1), actorId: driverJohn.id },
      ],
    },
    {
      trackingNumber: "SF-2026-88193",
      customerId: customerAlice.id,
      assignedDriverId: driverJohn.id,
      serviceLevelId: standardLevel.id,
      status: "DELIVERED",
      priority: "STANDARD",
      estimatedDeliveryDate: subDays(1),
      actualDeliveryDate: subDays(1),
      price: 24.0,
      packageDescription: "Commercial Office Stationary Supplies",
      packageType: "BOX",
      weight: 4.2,
      length: 40,
      width: 30,
      height: 20,
      fragile: false,
      sender: { name: "Alice Zhang", phone: "+1 555-234-5678", addressLine1: "100 Tech Ridge Pkwy", city: "Austin", state: "TX", postalCode: "78753", country: "US" },
      recipient: { name: "Apex Financial Corp", phone: "+1 555-999-1122", addressLine1: "800 Congress Ave", city: "Austin", state: "TX", postalCode: "78701", country: "US" },
      events: [
        { status: "CREATED", prevStatus: null, note: "Order placed online", date: subDays(3), actorId: customerAlice.id },
        { status: "CONFIRMED", prevStatus: "CREATED", note: "Order verified", date: subDays(3), actorId: admin.id },
        { status: "PICKED_UP", prevStatus: "CONFIRMED", note: "Collected from facility", date: subDays(2), actorId: driverJohn.id },
        { status: "IN_TRANSIT", prevStatus: "PICKED_UP", note: "In transit on route 4", date: subDays(1.5), actorId: driverJohn.id },
        { status: "OUT_FOR_DELIVERY", prevStatus: "IN_TRANSIT", note: "Out for final delivery", date: subDays(1.1), actorId: driverJohn.id },
        { status: "DELIVERED", prevStatus: "OUT_FOR_DELIVERY", note: "Delivered to Reception Desk. Signature captured: M. Henderson", date: subDays(1), actorId: driverJohn.id, signatureUrl: "signature-demo-placeholder" },
      ],
    },
    {
      trackingNumber: "SF-2026-10495",
      customerId: customerBob.id,
      assignedDriverId: driverSarah.id,
      serviceLevelId: sameDayLevel.id,
      status: "IN_TRANSIT",
      priority: "URGENT",
      estimatedDeliveryDate: addDays(0),
      price: 78.5,
      packageDescription: "Urgent Legal Contract Binder & Certified Documents",
      packageType: "DOCUMENT",
      weight: 1.2,
      length: 35,
      width: 25,
      height: 5,
      fragile: false,
      sender: { name: "Robert Sterling", phone: "+1 555-345-6789", addressLine1: "450 Broadway Suite 900", city: "New York", state: "NY", postalCode: "10013", country: "US" },
      recipient: { name: "Sullivan & Cromwell LLP", phone: "+1 555-444-2233", addressLine1: "125 Broad St", city: "New York", state: "NY", postalCode: "10004", country: "US" },
      events: [
        { status: "CREATED", prevStatus: null, note: "Urgent pickup scheduled", date: subDays(0.2), actorId: customerBob.id },
        { status: "CONFIRMED", prevStatus: "CREATED", note: "Priority courier dispatched", date: subDays(0.15), actorId: admin.id },
        { status: "PICKED_UP", prevStatus: "CONFIRMED", note: "Picked up by Courier Sarah Jenkins (BIKE-9104)", date: subDays(0.1), actorId: driverSarah.id },
        { status: "IN_TRANSIT", prevStatus: "PICKED_UP", note: "En route via downtown transit corridor", date: subDays(0.05), actorId: driverSarah.id },
      ],
    },
    {
      trackingNumber: "SF-2026-77321",
      customerId: customerBob.id,
      assignedDriverId: driverSarah.id,
      serviceLevelId: expressLevel.id,
      status: "DELIVERY_FAILED",
      priority: "STANDARD",
      estimatedDeliveryDate: subDays(0.2),
      price: 42.0,
      packageDescription: "Designer Leather Accessories Sample Box",
      packageType: "BOX",
      weight: 2.5,
      length: 25,
      width: 25,
      height: 15,
      fragile: true,
      sender: { name: "Robert Sterling", phone: "+1 555-345-6789", addressLine1: "450 Broadway Suite 900", city: "New York", state: "NY", postalCode: "10013", country: "US" },
      recipient: { name: "Fifth Ave Boutique", phone: "+1 555-777-6655", addressLine1: "710 5th Ave", city: "New York", state: "NY", postalCode: "10019", country: "US" },
      events: [
        { status: "CREATED", prevStatus: null, note: "Manifest submitted", date: subDays(1), actorId: customerBob.id },
        { status: "CONFIRMED", prevStatus: "CREATED", note: "Confirmed by system", date: subDays(0.9), actorId: admin.id },
        { status: "PICKED_UP", prevStatus: "CONFIRMED", note: "Picked up by Driver Sarah", date: subDays(0.5), actorId: driverSarah.id },
        { status: "OUT_FOR_DELIVERY", prevStatus: "PICKED_UP", note: "Attempting delivery", date: subDays(0.3), actorId: driverSarah.id },
        { status: "DELIVERY_FAILED", prevStatus: "OUT_FOR_DELIVERY", note: "Premises closed during standard business hours; gate access locked", failureReason: "Business closed - no secure delivery locker", date: subDays(0.1), actorId: driverSarah.id },
      ],
    },
    {
      trackingNumber: "SF-2026-65284",
      customerId: customerClara.id,
      assignedDriverId: driverMike.id,
      serviceLevelId: standardLevel.id,
      status: "PICKED_UP",
      priority: "STANDARD",
      estimatedDeliveryDate: addDays(3),
      price: 32.0,
      packageDescription: "Handcrafted Ceramic Vases (Custom Glaze)",
      packageType: "FRAGILE",
      weight: 5.5,
      length: 35,
      width: 35,
      height: 40,
      fragile: true,
      sender: { name: "Clara Oswald", phone: "+1 555-987-6543", addressLine1: "88 Market St", city: "San Francisco", state: "CA", postalCode: "94105", country: "US" },
      recipient: { name: "Modern Living Gallery", phone: "+1 555-333-8899", addressLine1: "1200 Pine St", city: "Seattle", state: "WA", postalCode: "98101", country: "US" },
      events: [
        { status: "CREATED", prevStatus: null, note: "Order placed online", date: subDays(1), actorId: customerClara.id },
        { status: "CONFIRMED", prevStatus: "CREATED", note: "Payment verified", date: subDays(0.8), actorId: admin.id },
        { status: "PICKED_UP", prevStatus: "CONFIRMED", note: "Carefully loaded onto Heavy Haul Truck TX-TRK-7721", date: subDays(0.2), actorId: driverMike.id },
      ],
    },
    {
      trackingNumber: "SF-2026-55419",
      customerId: customerClara.id,
      assignedDriverId: null,
      serviceLevelId: standardLevel.id,
      status: "CREATED",
      priority: "STANDARD",
      estimatedDeliveryDate: addDays(4),
      price: 18.5,
      packageDescription: "Framed Fine Art Archival Prints",
      packageType: "BOX",
      weight: 1.8,
      length: 60,
      width: 45,
      height: 10,
      fragile: true,
      sender: { name: "Clara Oswald", phone: "+1 555-987-6543", addressLine1: "88 Market St", city: "San Francisco", state: "CA", postalCode: "94105", country: "US" },
      recipient: { name: "The Bay Arts Foundation", phone: "+1 555-222-1144", addressLine1: "300 Frank H Ogawa Plaza", city: "Oakland", state: "CA", postalCode: "94612", country: "US" },
      events: [
        { status: "CREATED", prevStatus: null, note: "Shipment order initialized by customer", date: subDays(0.1), actorId: customerClara.id },
      ],
    },
    {
      trackingNumber: "SF-2026-44390",
      customerId: customerAlice.id,
      assignedDriverId: null,
      serviceLevelId: expressLevel.id,
      status: "CONFIRMED",
      priority: "HIGH",
      estimatedDeliveryDate: addDays(2),
      price: 48.0,
      packageDescription: "Server Rack Replacement Power Supply Units",
      packageType: "BOX",
      weight: 6.2,
      length: 45,
      width: 30,
      height: 20,
      fragile: false,
      sender: { name: "Alice Zhang", phone: "+1 555-234-5678", addressLine1: "100 Tech Ridge Pkwy", city: "Austin", state: "TX", postalCode: "78753", country: "US" },
      recipient: { name: "Dallas Data Solutions Center", phone: "+1 555-666-4433", addressLine1: "2100 Stemmons Fwy", city: "Dallas", state: "TX", postalCode: "75207", country: "US" },
      events: [
        { status: "CREATED", prevStatus: null, note: "Created via API portal", date: subDays(0.3), actorId: customerAlice.id },
        { status: "CONFIRMED", prevStatus: "CREATED", note: "Dispatch queue assigned; awaiting pickup vehicle", date: subDays(0.1), actorId: admin.id },
      ],
    },
    {
      trackingNumber: "SF-2026-33219",
      customerId: customerAlice.id,
      assignedDriverId: null,
      serviceLevelId: standardLevel.id,
      status: "CANCELLED",
      priority: "LOW",
      estimatedDeliveryDate: subDays(1),
      price: 15.0,
      packageDescription: "Redundant Marketing Flyers",
      packageType: "DOCUMENT",
      weight: 2.0,
      length: 30,
      width: 20,
      height: 5,
      fragile: false,
      sender: { name: "Alice Zhang", phone: "+1 555-234-5678", addressLine1: "100 Tech Ridge Pkwy", city: "Austin", state: "TX", postalCode: "78753", country: "US" },
      recipient: { name: "Convention Center Booth 410", phone: "+1 555-111-9988", addressLine1: "500 E Cesar Chavez", city: "Austin", state: "TX", postalCode: "78701", country: "US" },
      events: [
        { status: "CREATED", prevStatus: null, note: "Order placed", date: subDays(4), actorId: customerAlice.id },
        { status: "CONFIRMED", prevStatus: "CREATED", note: "Confirmed", date: subDays(3.9), actorId: admin.id },
        { status: "CANCELLED", prevStatus: "CONFIRMED", note: "Cancelled by customer before pickup dispatch", date: subDays(3.5), actorId: customerAlice.id },
      ],
    },
  ];

  for (const s of shipmentSeeds) {
    const shipment = await prisma.shipment.create({
      data: {
        trackingNumber: s.trackingNumber,
        customerId: s.customerId,
        assignedDriverId: s.assignedDriverId,
        serviceLevelId: s.serviceLevelId,
        status: s.status,
        priority: s.priority,
        estimatedDeliveryDate: s.estimatedDeliveryDate,
        actualDeliveryDate: s.actualDeliveryDate,
        price: s.price,
        currency: "INR",
        packageDescription: s.packageDescription,
        packageType: s.packageType,
        weight: s.weight,
        length: s.length,
        width: s.width,
        height: s.height,
        quantity: 1,
        declaredValue: s.price * 2,
        fragile: s.fragile,
        addresses: {
          create: [
            { type: "SENDER", ...s.sender },
            { type: "RECIPIENT", ...s.recipient },
          ],
        },
      },
    });

    for (const ev of s.events) {
      await prisma.shipmentEvent.create({
        data: {
          shipmentId: shipment.id,
          previousStatus: ev.prevStatus,
          newStatus: ev.status,
          note: ev.note,
          failureReason: ev.failureReason || null,
          signatureUrl: ev.signatureUrl || null,
          createdById: ev.actorId,
          createdAt: ev.date,
        },
      });
    }

    // Add initial audit log
    await prisma.auditLog.create({
      data: {
        actorId: s.customerId,
        action: "CREATE_SHIPMENT",
        entityType: "Shipment",
        entityId: shipment.id,
        metadata: JSON.stringify({ trackingNumber: s.trackingNumber, price: s.price, status: s.status }),
      },
    });
  }

  // 7. Seed Notifications
  await prisma.notification.createMany({
    data: [
      { recipientId: customerAlice.id, type: "STATUS_CHANGE", title: "Shipment Out for Delivery", message: "Your shipment SF-2026-90412 is currently on the delivery vehicle.", isRead: false },
      { recipientId: customerAlice.id, type: "STATUS_CHANGE", title: "Shipment Delivered Successfully", message: "Package SF-2026-88193 was delivered and signed for.", isRead: true },
      { recipientId: driverJohn.id, type: "ASSIGNMENT", title: "New Route Assignment", message: "You have 2 deliveries assigned for today's North Zone shift.", isRead: false },
      { recipientId: admin.id, type: "SYSTEM_ALERT", title: "Delivery Exception Alert", message: "Shipment SF-2026-77321 marked DELIVERY_FAILED: Business closed.", isRead: false },
    ],
  });

  console.log("Database successfully seeded with deterministic demo data!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
