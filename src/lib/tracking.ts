import crypto from "crypto";

export function generateTrackingNumber(): string {
  const year = new Date().getFullYear();
  // Cryptographically secure non-predictable PRNG (CSPRNG)
  const randomDigits = crypto.randomInt(10000, 100000);
  return `SF-${year}-${randomDigits}`;
}

export function maskName(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(" ");
  return parts
    .map((part) => (part.length > 1 ? `${part[0]}${"*".repeat(part.length - 1)}` : part))
    .join(" ");
}

export function maskAddress(city: string, state: string, country: string): string {
  return `${city}, ${state}, ${country}`;
}
