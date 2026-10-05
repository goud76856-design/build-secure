import { describe, it, expect } from "vitest";
import prisma from "@/lib/prisma";
import { comparePassword, hashPassword } from "@/lib/auth";
import { validateStatusTransition } from "@/lib/stateMachine";

describe("Database & Role Security Verification", () => {
  it("verifies seeded demo users exist and credentials match", async () => {
    const admin = await prisma.user.findUnique({ where: { email: "admin@shipflow.com" } });
    expect(admin).not.toBeNull();
    expect(admin?.role).toBe("ADMIN");

    const validPassword = await comparePassword("ShipFlow2026!", admin!.passwordHash);
    expect(validPassword).toBe(true);

    const wrongPassword = await comparePassword("WrongPassword!", admin!.passwordHash);
    expect(wrongPassword).toBe(false);
  });

  it("verifies drivers have associated DriverProfiles", async () => {
    const driver = await prisma.user.findUnique({
      where: { email: "driver.john@shipflow.com" },
      include: { driverProfile: true },
    });
    expect(driver).not.toBeNull();
    expect(driver?.role).toBe("DRIVER");
    expect(driver?.driverProfile?.vehicleType).toBe("VAN");
  });

  it("verifies customer cannot cancel an IN_TRANSIT shipment", async () => {
    const transition = validateStatusTransition("IN_TRANSIT", "CANCELLED", "CUSTOMER");
    expect(transition.allowed).toBe(false);
  });

  it("verifies driver cannot jump straight to DELIVERED from CREATED", async () => {
    const transition = validateStatusTransition("CREATED", "DELIVERED", "DRIVER");
    expect(transition.allowed).toBe(false);
  });

  it("verifies active service levels are loaded in database", async () => {
    const levels = await prisma.serviceLevel.findMany({ where: { isActive: true } });
    expect(levels.length).toBeGreaterThanOrEqual(3);
    const names = levels.map((l) => l.name);
    expect(names).toContain("Standard");
    expect(names).toContain("Express");
    expect(names).toContain("Same-Day");
  });
});
