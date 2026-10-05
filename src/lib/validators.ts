import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please provide a valid email address"),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  companyName: z.string().optional(),
  defaultAddress: z.string().optional(),
});

export const addressSchema = z.object({
  name: z.string().min(2, "Name is required"),
  companyName: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(7, "Phone number is required"),
  addressLine1: z.string().min(3, "Street address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State or province is required"),
  postalCode: z.string().min(3, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
});

export const createShipmentSchema = z.object({
  sender: addressSchema,
  recipient: addressSchema,
  packageDescription: z.string().min(3, "Package description is required"),
  packageType: z.enum(["BOX", "PALLET", "DOCUMENT", "FRAGILE"]),
  weight: z.coerce.number().positive("Weight must be greater than 0"),
  length: z.coerce.number().positive("Length must be greater than 0"),
  width: z.coerce.number().positive("Width must be greater than 0"),
  height: z.coerce.number().positive("Height must be greater than 0"),
  quantity: z.coerce.number().int().min(1).default(1),
  declaredValue: z.coerce.number().min(0).default(0),
  fragile: z.boolean().default(false),
  specialInstructions: z.string().optional(),
  serviceLevelId: z.string().min(1, "Service level must be selected"),
  priority: z.enum(["LOW", "STANDARD", "HIGH", "URGENT"]).default("STANDARD"),
});

export const updateStatusSchema = z.object({
  targetStatus: z.string(),
  note: z.string().optional(),
  failureReason: z.string().optional(),
  signatureUrl: z.string().optional(),
  proofOfDeliveryUrl: z.string().optional(),
  isOverride: z.boolean().optional(),
});

export const assignDriverSchema = z.object({
  driverId: z.string().min(1, "Driver ID is required"),
});
