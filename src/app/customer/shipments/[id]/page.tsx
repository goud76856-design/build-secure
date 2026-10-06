"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { Timeline } from "@/components/Timeline";
import {
  Package,
  MapPin,
  Calendar,
  Truck,
  Copy,
  Check,
  Printer,
  ArrowLeft,
  XCircle,
  AlertCircle,
  Clock,
  ShieldCheck,
  User,
} from "lucide-react";

export default function CustomerShipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [shipment, setShipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/shipments/${id}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message || "Shipment not found");
      } else {
        setShipment(json.data.shipment);
      }
    } catch {
      setError("Failed to load shipment details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await fetch(`/api/shipments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetStatus: "CANCELLED",
          note: cancelReason || "Cancelled by customer via portal request",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error?.message || "Failed to cancel shipment");
      } else {
        setCancelModalOpen(false);
        fetchDetail();
      }
    } catch {
      alert("Error cancelling shipment");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center space-y-3">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand-500 border-t-transparent" />
        <p className="text-sm text-slate-500">Loading shipment records...</p>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="max-w-md mx-auto p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold">Unable to Load Shipment</h2>
        <p className="text-xs text-slate-500">{error}</p>
        <Link
          href="/customer/shipments"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shipments</span>
        </Link>
      </div>
    );
  }

  const sender = shipment.addresses?.find((a: any) => a.type === "SENDER");
  const recipient = shipment.addresses?.find((a: any) => a.type === "RECIPIENT");
  const canCancel = ["CREATED", "CONFIRMED"].includes(shipment.status);

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/customer/shipments"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Shipments</span>
        </Link>

        <div className="flex items-center gap-2">
          {canCancel && (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-medium"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel Shipment</span>
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Summary</span>
          </button>
        </div>
      </div>

      {/* Main Overview Card */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Shipment Tracking Identifier
            </span>
            <div className="flex items-center gap-3 mt-1">
              <h1 className="text-2xl font-mono font-bold text-brand-600">
                {shipment.trackingNumber}
              </h1>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shipment.trackingNumber);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                title="Copy tracking number"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={shipment.status} size="lg" />
            <PriorityBadge priority={shipment.priority} />
          </div>
        </div>

        {/* Sender and Recipient Address Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">
              <MapPin className="w-3.5 h-3.5 text-brand-600" />
              <span>Sender (Pickup Address)</span>
            </div>
            <p className="font-bold text-sm text-slate-900 dark:text-white">
              {sender?.name} {sender?.companyName && `(${sender.companyName})`}
            </p>
            <p className="text-slate-600 dark:text-slate-300">{sender?.addressLine1}</p>
            {sender?.addressLine2 && <p className="text-slate-600 dark:text-slate-300">{sender.addressLine2}</p>}
            <p className="text-slate-600 dark:text-slate-300">
              {sender?.city}, {sender?.state} {sender?.postalCode}, {sender?.country}
            </p>
            <p className="text-slate-500">Phone: {sender?.phone} • Email: {sender?.email || "N/A"}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Recipient (Delivery Address)</span>
            </div>
            <p className="font-bold text-sm text-slate-900 dark:text-white">
              {recipient?.name} {recipient?.companyName && `(${recipient.companyName})`}
            </p>
            <p className="text-slate-600 dark:text-slate-300">{recipient?.addressLine1}</p>
            {recipient?.addressLine2 && <p className="text-slate-600 dark:text-slate-300">{recipient.addressLine2}</p>}
            <p className="text-slate-600 dark:text-slate-300">
              {recipient?.city}, {recipient?.state} {recipient?.postalCode}, {recipient?.country}
            </p>
            <p className="text-slate-500">Phone: {recipient?.phone} • Email: {recipient?.email || "N/A"}</p>
          </div>
        </div>

        {/* Specifications and Dispatch Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block">Package Specs</span>
            <span className="font-semibold text-slate-900 dark:text-white mt-1 block">
              {shipment.packageType} ({shipment.weight} kg)
            </span>
            <span className="text-[11px] text-slate-500">
              {shipment.length} × {shipment.width} × {shipment.height} cm
            </span>
          </div>

          <div>
            <span className="text-slate-400 block">Service Level</span>
            <span className="font-semibold text-slate-900 dark:text-white mt-1 block">
              {shipment.serviceLevel?.name}
            </span>
            <span className="text-[11px] text-slate-500">
              {shipment.serviceLevel?.estimatedDays === 0 ? "Same-Day Dispatch" : `${shipment.serviceLevel?.estimatedDays} Days SLA`}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block">Estimated Delivery</span>
            <span className="font-semibold text-slate-900 dark:text-white mt-1 block">
              {new Date(shipment.estimatedDeliveryDate).toLocaleDateString()}
            </span>
            {shipment.actualDeliveryDate && (
              <span className="text-[11px] text-emerald-600 font-semibold block">
                Delivered: {new Date(shipment.actualDeliveryDate).toLocaleDateString()}
              </span>
            )}
          </div>

          <div>
            <span className="text-slate-400 block">Total Price</span>
            <span className="font-bold text-base text-slate-900 dark:text-white mt-1 block">
              ₹{shipment.price.toFixed(2)} INR
            </span>
            <span className="text-[11px] text-emerald-600">Paid & Verified</span>
          </div>
        </div>

        {shipment.assignedDriver && (
          <div className="p-3.5 rounded-xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-900/40 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-brand-600" />
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">Assigned Courier: </span>
                <span>{shipment.assignedDriver.name} ({shipment.assignedDriver.phone})</span>
              </div>
            </div>
            <span className="text-[11px] text-brand-600 font-medium">On-Duty</span>
          </div>
        )}
      </div>

      {/* Timeline Section */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-6">
          Real-Time Tracking Timeline
        </h2>
        <Timeline events={shipment.events || []} />
      </div>

      {/* Cancel Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 max-w-md w-full rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
              <XCircle className="w-5 h-5" />
              <span>Cancel Shipment</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Are you sure you want to cancel shipment <strong>{shipment.trackingNumber}</strong>? Once cancelled, the parcel will be pulled from courier dispatch queues.
            </p>
            <div>
              <label className="block font-semibold mb-1">Reason for Cancellation (Optional)</label>
              <textarea
                rows={2}
                placeholder="e.g. Recipient address changed, order cancelled by buyer"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 dark:text-slate-300"
              >
                Keep Shipment
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white font-semibold disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
