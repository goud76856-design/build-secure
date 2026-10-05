export interface PricingInput {
  basePrice: number;
  pricePerWeightUnit: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  declaredValue?: number;
  fragile?: boolean;
}

export function calculateShippingQuote(input: PricingInput): number {
  const actualWeight = Math.max(0.1, input.weight);
  // Volumetric weight formula: (L x W x H in cm) / 5000
  const volumetricWeight = (input.length * input.width * input.height) / 5000;
  const billableWeight = Math.max(actualWeight, volumetricWeight);

  let total = input.basePrice + billableWeight * input.pricePerWeightUnit;

  // Fragile special handling surcharge ($5.00)
  if (input.fragile) {
    total += 5.0;
  }

  // Insurance fee (1% of declared value over $100)
  if (input.declaredValue && input.declaredValue > 100) {
    total += (input.declaredValue - 100) * 0.01;
  }

  return Math.round(total * 100) / 100;
}

export function calculateEstimatedDeliveryDate(estimatedDays: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + estimatedDays);
  return date;
}
