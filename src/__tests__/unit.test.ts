import { describe, it, expect } from "vitest";
import { generateTrackingNumber, maskName, maskAddress } from "@/lib/tracking";
import { calculateShippingQuote, calculateEstimatedDeliveryDate } from "@/lib/pricing";
import { validateStatusTransition, ALLOWED_TRANSITIONS } from "@/lib/stateMachine";
import { loginSchema, createShipmentSchema } from "@/lib/validators";

describe("Tracking Number Generator & Privacy Masking", () => {
  it("generates formatted tracking numbers starting with SF-", () => {
    const num = generateTrackingNumber();
    expect(num).toMatch(/^SF-\d{4}-\d{5}$/);
  });

  it("masks personal names for public visibility", () => {
    expect(maskName("Alice Zhang")).toBe("A**** Z****");
    expect(maskName("John Davis")).toBe("J*** D****");
  });

  it("masks street address down to city, state, country", () => {
    expect(maskAddress("Austin", "TX", "US")).toBe("Austin, TX, US");
  });
});

describe("Pricing Engine & Volumetric Weight Calculations", () => {
  it("calculates cost using actual weight when greater than volumetric", () => {
    const quote = calculateShippingQuote({
      basePrice: 15.0,
      pricePerWeightUnit: 2.5,
      weight: 10.0,
      length: 10,
      width: 10,
      height: 10, // Volumetric = 0.2 kg
    });
    // 15 + 10 * 2.5 = 40.0
    expect(quote).toBe(40.0);
  });

  it("calculates cost using volumetric weight when dimensions are large", () => {
    const quote = calculateShippingQuote({
      basePrice: 15.0,
      pricePerWeightUnit: 2.0,
      weight: 1.0,
      length: 50,
      width: 50,
      height: 40, // Volumetric = (50*50*40)/5000 = 20.0 kg
    });
    // 15 + 20 * 2.0 = 55.0
    expect(quote).toBe(55.0);
  });

  it("applies fragile fee and declared value insurance surcharge", () => {
    const quote = calculateShippingQuote({
      basePrice: 15.0,
      pricePerWeightUnit: 2.0,
      weight: 2.0,
      length: 20,
      width: 20,
      height: 20,
      fragile: true, // +$5.00
      declaredValue: 300, // (300-100)*0.01 = +$2.00
    });
    // Base: 15 + (2*2) + 5 + 2 = 26.0
    expect(quote).toBe(26.0);
  });

  it("computes estimated arrival date accurately", () => {
    const now = new Date();
    const est = calculateEstimatedDeliveryDate(3);
    const diffDays = Math.round((est.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(3);
  });
});

describe("State Machine Transition Guard", () => {
  it("allows legal progression for driver", () => {
    const result1 = validateStatusTransition("CONFIRMED", "PICKED_UP", "DRIVER");
    expect(result1.allowed).toBe(true);

    const result2 = validateStatusTransition("PICKED_UP", "IN_TRANSIT", "DRIVER");
    expect(result2.allowed).toBe(true);

    const result3 = validateStatusTransition("IN_TRANSIT", "OUT_FOR_DELIVERY", "DRIVER");
    expect(result3.allowed).toBe(true);

    const result4 = validateStatusTransition("OUT_FOR_DELIVERY", "DELIVERED", "DRIVER");
    expect(result4.allowed).toBe(true);
  });

  it("strictly forbids illegal jumps", () => {
    const result = validateStatusTransition("CREATED", "DELIVERED", "DRIVER");
    expect(result.allowed).toBe(false);
  });

  it("allows customer to cancel only before pickup", () => {
    const allowedCancel = validateStatusTransition("CREATED", "CANCELLED", "CUSTOMER");
    expect(allowedCancel.allowed).toBe(true);

    const forbiddenCancel = validateStatusTransition("IN_TRANSIT", "CANCELLED", "CUSTOMER");
    expect(forbiddenCancel.allowed).toBe(false);
  });

  it("blocks any transition out of terminal states for standard roles", () => {
    const fromDelivered = validateStatusTransition("DELIVERED", "IN_TRANSIT", "DRIVER");
    expect(fromDelivered.allowed).toBe(false);

    const fromCancelled = validateStatusTransition("CANCELLED", "CREATED", "CUSTOMER");
    expect(fromCancelled.allowed).toBe(false);
  });

  it("permits admin override when explicit flag is passed", () => {
    const adminOverride = validateStatusTransition("DELIVERY_FAILED", "CONFIRMED", "ADMIN", true);
    expect(adminOverride.allowed).toBe(true);
  });
});

describe("Zod Validation Schemas", () => {
  it("validates login payload correctly", () => {
    const valid = loginSchema.safeParse({ email: "admin@shipflow.com", password: "Password123!" });
    expect(valid.success).toBe(true);

    const invalid = loginSchema.safeParse({ email: "not-an-email", password: "123" });
    expect(invalid.success).toBe(false);
  });

  it("validates comprehensive shipment creation payload", () => {
    const valid = createShipmentSchema.safeParse({
      sender: {
        name: "Alice Zhang",
        phone: "+1 555-123-4567",
        addressLine1: "123 Main St",
        city: "Austin",
        state: "TX",
        postalCode: "78701",
        country: "US",
      },
      recipient: {
        name: "Bob Sterling",
        phone: "+1 555-987-6543",
        addressLine1: "456 Market St",
        city: "Dallas",
        state: "TX",
        postalCode: "75201",
        country: "US",
      },
      packageDescription: "Precision Tools",
      packageType: "BOX",
      weight: 3.5,
      length: 25,
      width: 20,
      height: 15,
      quantity: 1,
      declaredValue: 150,
      fragile: true,
      serviceLevelId: "service-std-1",
      priority: "STANDARD",
    });

    expect(valid.success).toBe(true);
  });
});
