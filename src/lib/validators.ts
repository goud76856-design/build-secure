import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(72, "Password cannot exceed 72 characters (Bcrypt limit)"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please provide a valid email address"),
  phone: z.string().max(20).optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password cannot exceed 72 characters (Bcrypt limit)"),
  companyName: z.string().max(100).optional(),
  defaultAddress: z.string().max(300).optional(),
});

export const addressSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  companyName: z.string().max(100).optional(),
  email: z.string().email().max(100).optional().or(z.literal("")),
  phone: z.string().min(7, "Phone number is required").max(25),
  addressLine1: z.string().min(3, "Street address is required").max(150),
  addressLine2: z.string().max(150).optional(),
  city: z.string().min(2, "City is required").max(60),
  state: z.string().min(2, "State or province is required").max(60),
  postalCode: z.string().min(3, "Postal code is required").max(20),
  country: z.string().min(2, "Country is required").max(60),
});

export const createShipmentSchema = z.object({
  sender: addressSchema,
  recipient: addressSchema,
  packageDescription: z.string().min(3, "Package description is required").max(200),
  packageType: z.enum(["BOX", "PALLET", "DOCUMENT", "FRAGILE"]),
  weight: z.coerce
    .number()
    .positive("Weight must be greater than 0")
    .max(50000, "Weight exceeds maximum allowed capacity (50,000 kg)"),
  length: z.coerce
    .number()
    .positive("Length must be greater than 0")
    .max(2000, "Length exceeds maximum dimension (2,000 cm)"),
  width: z.coerce
    .number()
    .positive("Width must be greater than 0")
    .max(2000, "Width exceeds maximum dimension (2,000 cm)"),
  height: z.coerce
    .number()
    .positive("Height must be greater than 0")
    .max(2000, "Height exceeds maximum dimension (2,000 cm)"),
  quantity: z.coerce.number().int().min(1).max(1000).default(1),
  declaredValue: z.coerce.number().min(0).max(10000000, "Declared value exceeds maximum limit").default(0),
  fragile: z.boolean().default(false),
  specialInstructions: z.string().max(500).optional(),
  serviceLevelId: z.string().min(1, "Service level must be selected"),
  priority: z.enum(["LOW", "STANDARD", "HIGH", "URGENT"]).default("STANDARD"),
});

export const safeMediaUrlSchema = z
  .string()
  .refine(
    (val) =>
      !val ||
      val.startsWith("data:image/") ||
      val.startsWith("https://") ||
      val.startsWith("/uploads/") ||
      val.startsWith("sig_"),
    { message: "Must be a safe data URI or HTTPS URL" }
  )
  .optional();

export const updateStatusSchema = z.object({
  targetStatus: z.string(),
  note: z.string().max(500).optional(),
  failureReason: z.string().max(200).optional(),
  signatureUrl: safeMediaUrlSchema,
  proofOfDeliveryUrl: safeMediaUrlSchema,
  isOverride: z.boolean().optional(),
});

export const assignDriverSchema = z.object({
  driverId: z.string().min(1, "Driver ID is required"),
});
