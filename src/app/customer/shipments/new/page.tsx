"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Package,
  User,
  MapPin,
  Truck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Calendar,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface ServiceLevel {
  id: string;
  name: string;
  description: string;
  estimatedDays: number;
  basePrice: number;
  pricePerWeightUnit: number;
}

export default function NewShipmentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [serviceLevels, setServiceLevels] = useState<ServiceLevel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdShipment, setCreatedShipment] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Form State
  const [form, setForm] = useState({
    sender: {
      name: "",
      companyName: "",
      email: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "United States",
    },
    recipient: {
      name: "",
      companyName: "",
      email: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "United States",
    },
    packageDescription: "",
    packageType: "BOX",
    weight: 2.5,
    length: 30,
    width: 25,
    height: 15,
    quantity: 1,
    declaredValue: 50,
    fragile: false,
    specialInstructions: "",
    serviceLevelId: "",
    priority: "STANDARD",
    agreeTerms: false,
  });

  // Load service levels
  useEffect(() => {
    fetch("/api/service-levels")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.serviceLevels?.length > 0) {
          setServiceLevels(data.data.serviceLevels);
          setForm((prev) => ({ ...prev, serviceLevelId: data.data.serviceLevels[0].id }));
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Autofill user profile if available
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.user) {
          const u = data.data.user;
          setForm((prev) => ({
            ...prev,
            sender: {
              ...prev.sender,
              name: u.name || prev.sender.name,
              email: u.email || prev.sender.email,
              phone: u.phone || prev.sender.phone,
              companyName: u.customerProfile?.companyName || prev.sender.companyName,
              addressLine1: u.customerProfile?.defaultAddress || prev.sender.addressLine1,
            },
          }));
        }
      })
      .catch(() => {});
  }, []);

  const calculateEstimate = () => {
    const selectedLevel = serviceLevels.find((s) => s.id === form.serviceLevelId);
    if (!selectedLevel) return 0;

    const actualWeight = Math.max(0.1, Number(form.weight) || 1);
    const volumetricWeight = (Number(form.length) * Number(form.width) * Number(form.height)) / 5000;
    const billableWeight = Math.max(actualWeight, volumetricWeight);

    let price = selectedLevel.basePrice + billableWeight * selectedLevel.pricePerWeightUnit;
    if (form.fragile) price += 5.0;
    if (form.declaredValue > 100) price += (form.declaredValue - 100) * 0.01;

    return Math.round(price * 100) / 100;
  };

  const getEstimatedDate = () => {
    const selectedLevel = serviceLevels.find((s) => s.id === form.serviceLevelId);
    const days = selectedLevel?.estimatedDays || 3;
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const validateStep = (currentStep: number) => {
    setError(null);
    if (currentStep === 1) {
      if (!form.sender.name || !form.sender.phone || !form.sender.addressLine1 || !form.sender.city || !form.sender.state || !form.sender.postalCode) {
        setError("Please complete all required sender address fields.");
        return false;
      }
    }
    if (currentStep === 2) {
      if (!form.recipient.name || !form.recipient.phone || !form.recipient.addressLine1 || !form.recipient.city || !form.recipient.state || !form.recipient.postalCode) {
        setError("Please complete all required recipient address fields.");
        return false;
      }
    }
    if (currentStep === 3) {
      if (!form.packageDescription || form.weight <= 0 || form.length <= 0 || form.width <= 0 || form.height <= 0) {
        setError("Please provide a valid package description and positive dimensions.");
        return false;
      }
    }
    if (currentStep === 4) {
      if (!form.serviceLevelId) {
        setError("Please select a service delivery tier.");
        return false;
      }
      if (!form.agreeTerms) {
        setError("Please agree to the logistics terms and conditions to proceed.");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(5, prev + 1));
    }
  };

  const prevStep = () => {
    setError(null);
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error?.message || "Failed to book shipment.");
      } else {
        setCreatedShipment(data.data.shipment);
      }
    } catch {
      setError("Network error while submitting shipment order.");
    } finally {
      setLoading(false);
    }
  };

  // Step Indicators
  const steps = [
    { num: 1, title: "Sender" },
    { num: 2, title: "Recipient" },
    { num: 3, title: "Package" },
    { num: 4, title: "Service" },
    { num: 5, title: "Review" },
  ];

  if (createdShipment) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Shipment Booked Successfully!
          </h1>
          <p className="text-sm text-slate-500">
            Your package has been registered on the ShipFlow dispatch network.
          </p>
        </div>

        <div className="bg-white dark:bg-navy-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 max-w-md mx-auto text-left">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Tracking Number</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-mono font-bold text-brand-600">
                {createdShipment.trackingNumber}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(createdShipment.trackingNumber);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-2 text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Billed Amount:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                ${createdShipment.price.toFixed(2)} USD
              </span>
            </div>
            <div className="flex justify-between">
              <span>Service Level:</span>
              <span className="font-semibold">{createdShipment.serviceLevel?.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Delivery:</span>
              <span className="font-semibold">
                {new Date(createdShipment.estimatedDeliveryDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 pt-4">
          <Link
            href={`/customer/shipments/${createdShipment.id}`}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm"
          >
            Open Shipment Details
          </Link>
          <Link
            href={`/track?number=${createdShipment.trackingNumber}`}
            className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold text-xs"
          >
            Public Tracking Page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create New Shipment</h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete the 5-step manifest to calculate rate quotes and schedule courier pickup.
        </p>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-5 gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
        {steps.map((s) => (
          <div
            key={s.num}
            className={`text-center space-y-1 ${
              step === s.num
                ? "text-brand-600 font-bold"
                : step > s.num
                ? "text-emerald-600 font-medium"
                : "text-slate-400"
            }`}
          >
            <div
              className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-semibold ${
                step === s.num
                  ? "bg-brand-600 text-white"
                  : step > s.num
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500"
              }`}
            >
              {step > s.num ? <Check className="w-4 h-4" /> : s.num}
            </div>
            <span className="text-[11px] block">{s.title}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Wizard Container */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
        {/* STEP 1: Sender Details */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-base font-bold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-600" />
                <span>Step 1: Origin & Sender Information</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">Where will the package be picked up?</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Sender Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Full name"
                  value={form.sender.name}
                  onChange={(e) => setForm({ ...form, sender: { ...form.sender, name: e.target.value } })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Company (Optional)</label>
                <input
                  type="text"
                  placeholder="Company name"
                  value={form.sender.companyName}
                  onChange={(e) => setForm({ ...form, sender: { ...form.sender, companyName: e.target.value } })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={form.sender.phone}
                  onChange={(e) => setForm({ ...form, sender: { ...form.sender, phone: e.target.value } })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="sender@example.com"
                  value={form.sender.email}
                  onChange={(e) => setForm({ ...form, sender: { ...form.sender, email: e.target.value } })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="font-semibold block mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  placeholder="123 Logistics Way, Suite 400"
                  value={form.sender.addressLine1}
                  onChange={(e) => setForm({ ...form, sender: { ...form.sender, addressLine1: e.target.value } })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">City *</label>
                <input
                  type="text"
                  required
                  placeholder="Austin"
                  value={form.sender.city}
                  onChange={(e) => setForm({ ...form, sender: { ...form.sender, city: e.target.value } })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">State / Province *</label>
                <input
                  type="text"
                  required
                  placeholder="TX"
                  value={form.sender.state}
                  onChange={(e) => setForm({ ...form, sender: { ...form.sender, state: e.target.value } })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Postal Code *</label>
                <input
                  type="text"
                  required
                  placeholder="78701"
                  value={form.sender.postalCode}
                  onChange={(e) => setForm({ ...form, sender: { ...form.sender, postalCode: e.target.value } })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Country</label>
                <input
                  type="text"
                  value={form.sender.country}
                  onChange={(e) => setForm({ ...form, sender: { ...form.sender, country: e.target.value } })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Recipient Details */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-base font-bold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Step 2: Destination & Recipient Information</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">Who will receive this delivery?</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Recipient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Full name or Department"
                  value={form.recipient.name}
                  onChange={(e) => setForm({ ...form, recipient: { ...form.recipient, name: e.target.value } })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Company (Optional)</label>
                <input
                  type="text"
                  placeholder="Recipient company"
                  value={form.recipient.companyName}
                  onChange={(e) => setForm({ ...form, recipient: { ...form.recipient, companyName: e.target.value } })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 999-9999"
                  value={form.recipient.phone}
                  onChange={(e) => setForm({ ...form, recipient: { ...form.recipient, phone: e.target.value } })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="recipient@example.com"
                  value={form.recipient.email}
                  onChange={(e) => setForm({ ...form, recipient: { ...form.recipient, email: e.target.value } })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="font-semibold block mb-1">Delivery Street Address *</label>
                <input
                  type="text"
                  required
                  placeholder="700 Main Street, Floor 12"
                  value={form.recipient.addressLine1}
                  onChange={(e) => setForm({ ...form, recipient: { ...form.recipient, addressLine1: e.target.value } })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">City *</label>
                <input
                  type="text"
                  required
                  placeholder="New York"
                  value={form.recipient.city}
                  onChange={(e) => setForm({ ...form, recipient: { ...form.recipient, city: e.target.value } })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">State / Province *</label>
                <input
                  type="text"
                  required
                  placeholder="NY"
                  value={form.recipient.state}
                  onChange={(e) => setForm({ ...form, recipient: { ...form.recipient, state: e.target.value } })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Postal Code *</label>
                <input
                  type="text"
                  required
                  placeholder="10001"
                  value={form.recipient.postalCode}
                  onChange={(e) => setForm({ ...form, recipient: { ...form.recipient, postalCode: e.target.value } })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Country</label>
                <input
                  type="text"
                  value={form.recipient.country}
                  onChange={(e) => setForm({ ...form, recipient: { ...form.recipient, country: e.target.value } })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Package Details */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Package className="w-4 h-4 text-purple-600" />
                <span>Step 3: Package Dimensions & Specifications</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">Provide weight and dimensions for volumetric calculation.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Package Content Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Industrial microchips and sensor harnesses"
                  value={form.packageDescription}
                  onChange={(e) => setForm({ ...form, packageDescription: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="font-semibold block mb-1">Package Type</label>
                  <select
                    value={form.packageType}
                    onChange={(e) => setForm({ ...form, packageType: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="BOX">Standard Box</option>
                    <option value="PALLET">Freight Pallet</option>
                    <option value="DOCUMENT">Document / Envelope</option>
                    <option value="FRAGILE">Fragile Spec</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: parseFloat(e.target.value) || 0.1 })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="STANDARD">Standard</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent Expedited</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Declared Value ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.declaredValue}
                    onChange={(e) => setForm({ ...form, declaredValue: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="font-semibold block mb-1">Length (cm) *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.length}
                    onChange={(e) => setForm({ ...form, length: parseFloat(e.target.value) || 1 })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Width (cm) *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.width}
                    onChange={(e) => setForm({ ...form, width: parseFloat(e.target.value) || 1 })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Height (cm) *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.height}
                    onChange={(e) => setForm({ ...form, height: parseFloat(e.target.value) || 1 })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="fragile"
                  checked={form.fragile}
                  onChange={(e) => setForm({ ...form, fragile: e.target.checked })}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="fragile" className="font-medium text-slate-700 dark:text-slate-300">
                  Fragile contents (Requires specialized cushioned courier transport + $5.00)
                </label>
              </div>

              <div>
                <label className="font-semibold block mb-1">Handling Notes / Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Gate code, dock number, or specific delivery window"
                  value={form.specialInstructions}
                  onChange={(e) => setForm({ ...form, specialInstructions: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Service Selection & Dynamic Rate Quote */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Truck className="w-4 h-4 text-brand-600" />
                <span>Step 4: Select Service Tier & Live Rate Quote</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">Choose delivery speed based on your transit requirement.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {serviceLevels.map((lvl) => {
                const isSelected = form.serviceLevelId === lvl.id;
                return (
                  <div
                    key={lvl.id}
                    onClick={() => setForm({ ...form, serviceLevelId: lvl.id })}
                    className={`cursor-pointer p-5 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                      isSelected
                        ? "border-brand-600 bg-brand-50/50 dark:bg-brand-950/40 ring-2 ring-brand-500"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-navy-950"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {lvl.name}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                        {lvl.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] text-slate-400">SLA Timeline</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {lvl.estimatedDays === 0 ? "Same-Day Dispatch" : `${lvl.estimatedDays} Business Days`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Calculated Quote Preview Card */}
            <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Guaranteed Rate Estimate
                </span>
                <div className="text-2xl font-bold mt-0.5 text-white flex items-baseline gap-1">
                  <span>${calculateEstimate().toFixed(2)}</span>
                  <span className="text-xs font-normal text-slate-400">USD (all surcharges incl.)</span>
                </div>
              </div>

              <div className="text-xs text-slate-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-400" />
                <span>Estimated Arrival by: <strong>{getEstimatedDate()}</strong></span>
              </div>
            </div>

            <div className="pt-2 flex items-start gap-2 text-xs">
              <input
                type="checkbox"
                id="terms"
                checked={form.agreeTerms}
                onChange={(e) => setForm({ ...form, agreeTerms: e.target.checked })}
                className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="terms" className="text-slate-600 dark:text-slate-400">
                I agree to ShipFlow logistics carriage terms, declared value liability conditions, and carrier transit guidelines.
              </label>
            </div>
          </div>
        )}

        {/* STEP 5: Final Review & Confirmation */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-base font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Step 5: Final Manifest Review</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Please verify all shipping details before generating the carrier booking.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="bg-slate-50 dark:bg-navy-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="font-bold text-slate-900 dark:text-white">Origin (Sender)</span>
                  <button onClick={() => setStep(1)} className="text-brand-600 hover:underline">Edit</button>
                </div>
                <p className="font-semibold">{form.sender.name} {form.sender.companyName && `(${form.sender.companyName})`}</p>
                <p className="text-slate-500">{form.sender.addressLine1}</p>
                <p className="text-slate-500">{form.sender.city}, {form.sender.state} {form.sender.postalCode}, {form.sender.country}</p>
                <p className="text-slate-500">{form.sender.phone}</p>
              </div>

              <div className="bg-slate-50 dark:bg-navy-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="font-bold text-slate-900 dark:text-white">Destination (Recipient)</span>
                  <button onClick={() => setStep(2)} className="text-brand-600 hover:underline">Edit</button>
                </div>
                <p className="font-semibold">{form.recipient.name} {form.recipient.companyName && `(${form.recipient.companyName})`}</p>
                <p className="text-slate-500">{form.recipient.addressLine1}</p>
                <p className="text-slate-500">{form.recipient.city}, {form.recipient.state} {form.recipient.postalCode}, {form.recipient.country}</p>
                <p className="text-slate-500">{form.recipient.phone}</p>
              </div>

              <div className="bg-slate-50 dark:bg-navy-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="font-bold text-slate-900 dark:text-white">Package Manifest</span>
                  <button onClick={() => setStep(3)} className="text-brand-600 hover:underline">Edit</button>
                </div>
                <p className="font-semibold">{form.packageDescription}</p>
                <p className="text-slate-500">Type: {form.packageType} • Weight: {form.weight} kg</p>
                <p className="text-slate-500">Dimensions: {form.length} x {form.width} x {form.height} cm</p>
                <p className="text-slate-500">Priority: {form.priority} • Fragile: {form.fragile ? "Yes" : "No"}</p>
              </div>

              <div className="bg-slate-50 dark:bg-navy-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="font-bold text-slate-900 dark:text-white">Billing & SLA</span>
                  <button onClick={() => setStep(4)} className="text-brand-600 hover:underline">Edit</button>
                </div>
                <p className="font-semibold">
                  Service: {serviceLevels.find((s) => s.id === form.serviceLevelId)?.name}
                </p>
                <p className="text-slate-500">Est. Delivery: {getEstimatedDate()}</p>
                <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  Total Quote: ${calculateEstimate().toFixed(2)} USD
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-xs font-semibold text-white shadow-sm transition-colors"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-xs font-semibold text-white shadow-sm transition-colors"
            >
              <span>{loading ? "Confirming Booking..." : "Submit & Book Shipment"}</span>
              {!loading && <Check className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
