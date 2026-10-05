"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { Timeline } from "@/components/Timeline";
import {
  Truck,
  MapPin,
  Phone,
  Package,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  PenTool,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function DriverStopExecutionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [shipment, setShipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Delivery Modal State
  const [deliverModalOpen, setDeliverModalOpen] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState("Delivered to front door / recipient in person.");
  const [signatureName, setSignatureName] = useState("");

  // Failure Modal State
  const [failModalOpen, setFailModalOpen] = useState(false);
  const [failureReason, setFailureReason] = useState("Business closed - no secure delivery locker");
  const [failureNote, setFailureNote] = useState("");

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/shipments/${id}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message || "Stop details not found");
      } else {
        setShipment(json.data.shipment);
      }
    } catch {
      setError("Failed to load delivery stop");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleStatusTransition = async (targetStatus: string, extraData: any = {}) => {
    setUpdating(true);
    setError(null);
    try {
      const res = await fetch(`/api/shipments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetStatus,
          ...extraData,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message || "Failed to update status");
      } else {
        setDeliverModalOpen(false);
        setFailModalOpen(false);
        fetchDetail();
      }
    } catch {
      setError("Network error updating stop progress");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center space-y-2 text-xs text-slate-500">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand-500 border-t-transparent" />
        <p>Opening stop manifest...</p>
      </div>
    );
  }

  if (error && !shipment) {
    return (
      <div className="max-w-md mx-auto p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold">Assignment Access Blocked</h2>
        <p className="text-xs text-slate-500">{error}</p>
        <Link
          href="/driver/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Run Sheet</span>
        </Link>
      </div>
    );
  }

  const recipient = shipment.addresses?.find((a: any) => a.type === "RECIPIENT");
  const sender = shipment.addresses?.find((a: any) => a.type === "SENDER");

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Back link */}
      <div className="flex items-center justify-between">
        <Link
          href="/driver/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Run Sheet</span>
        </Link>
        <div className="flex items-center gap-2">
          <StatusBadge status={shipment.status} size="md" />
          <PriorityBadge priority={shipment.priority} />
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Stop Execution Card */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Active Stop Manifest</span>
            <h1 className="text-2xl font-mono font-bold text-brand-600 mt-0.5">
              {shipment.trackingNumber}
            </h1>
          </div>

          <div className="text-right text-xs">
            <span className="text-slate-400 block">Service Level</span>
            <span className="font-bold text-slate-900 dark:text-white">{shipment.serviceLevel?.name}</span>
          </div>
        </div>

        {/* Destination & Recipient Card */}
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Destination Delivery Point</span>
            </div>
            {recipient?.phone && (
              <a
                href={`tel:${recipient.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-semibold"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Recipient</span>
              </a>
            )}
          </div>

          <div>
            <p className="font-bold text-base text-slate-900 dark:text-white">
              {recipient?.name} {recipient?.companyName && `(${recipient.companyName})`}
            </p>
            <p className="text-slate-600 dark:text-slate-300 text-sm mt-0.5">{recipient?.addressLine1}</p>
            {recipient?.addressLine2 && <p className="text-slate-600 dark:text-slate-300">{recipient.addressLine2}</p>}
            <p className="text-slate-600 dark:text-slate-300">
              {recipient?.city}, {recipient?.state} {recipient?.postalCode}
            </p>
          </div>

          {shipment.specialInstructions && (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300">
              <span className="font-semibold">Special Courier Instructions:</span> {shipment.specialInstructions}
            </div>
          )}
        </div>

        {/* Package Specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
          <div>
            <span className="text-slate-400">Package Type:</span>
            <p className="font-semibold text-slate-900 dark:text-white">{shipment.packageType}</p>
          </div>
          <div>
            <span className="text-slate-400">Weight:</span>
            <p className="font-semibold text-slate-900 dark:text-white">{shipment.weight} kg</p>
          </div>
          <div>
            <span className="text-slate-400">Fragile Status:</span>
            <p className={`font-semibold ${shipment.fragile ? "text-rose-600" : "text-slate-600"}`}>
              {shipment.fragile ? "FRAGILE - HANDLE WITH CARE" : "Standard Freight"}
            </p>
          </div>
          <div>
            <span className="text-slate-400">Dimensions:</span>
            <p className="font-semibold text-slate-900 dark:text-white">
              {shipment.length}×{shipment.width}×{shipment.height} cm
            </p>
          </div>
        </div>

        {/* CUSTODY TRANSITION CONTROL PANEL */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Custody Status Actions
            </h3>
            <span className="text-[11px] text-slate-400">Enforced by state transition engine</span>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Transition: CONFIRMED -> PICKED_UP */}
            {shipment.status === "CONFIRMED" && (
              <button
                disabled={updating}
                onClick={() =>
                  handleStatusTransition("PICKED_UP", {
                    note: "Package collected from pickup dock by driver.",
                  })
                }
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm"
              >
                <Package className="w-4 h-4" />
                <span>Mark as Picked Up</span>
              </button>
            )}

            {/* Transition: PICKED_UP -> IN_TRANSIT */}
            {shipment.status === "PICKED_UP" && (
              <button
                disabled={updating}
                onClick={() =>
                  handleStatusTransition("IN_TRANSIT", {
                    note: "Departed pickup location; in transit to regional sector.",
                  })
                }
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm"
              >
                <Truck className="w-4 h-4" />
                <span>Depart on Transit</span>
              </button>
            )}

            {/* Transition: IN_TRANSIT -> OUT_FOR_DELIVERY */}
            {shipment.status === "IN_TRANSIT" && (
              <button
                disabled={updating}
                onClick={() =>
                  handleStatusTransition("OUT_FOR_DELIVERY", {
                    note: "Loaded onto delivery vehicle for final mile delivery.",
                  })
                }
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm"
              >
                <Clock className="w-4 h-4" />
                <span>Load for Out for Delivery</span>
              </button>
            )}

            {/* Transition: OUT_FOR_DELIVERY -> DELIVERED / DELIVERY_FAILED */}
            {shipment.status === "OUT_FOR_DELIVERY" && (
              <>
                <button
                  disabled={updating}
                  onClick={() => setDeliverModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark as Delivered (with POD)</span>
                </button>
                <button
                  disabled={updating}
                  onClick={() => setFailModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Report Failed Delivery</span>
                </button>
              </>
            )}

            {/* Transition: DELIVERY_FAILED -> RETRY or RETURN */}
            {shipment.status === "DELIVERY_FAILED" && (
              <>
                <button
                  disabled={updating}
                  onClick={() =>
                    handleStatusTransition("OUT_FOR_DELIVERY", {
                      note: "Re-attempting delivery run on next dispatch window.",
                    })
                  }
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm"
                >
                  <Clock className="w-4 h-4" />
                  <span>Re-Attempt Delivery</span>
                </button>
                <button
                  disabled={updating}
                  onClick={() =>
                    handleStatusTransition("RETURNED", {
                      note: "Package returned to central depot after failed attempts.",
                    })
                  }
                  className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm"
                >
                  <Package className="w-4 h-4" />
                  <span>Return to Depot</span>
                </button>
              </>
            )}

            {["DELIVERED", "CANCELLED", "RETURNED"].includes(shipment.status) && (
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs">
                This shipment has reached terminal state (<strong>{shipment.status}</strong>). No further courier transitions permitted.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stop History Timeline */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">
          Milestones & Custody Records
        </h3>
        <Timeline events={shipment.events || []} />
      </div>

      {/* DELIVERED MODAL */}
      {deliverModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 max-w-md w-full rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-base">
              <CheckCircle2 className="w-5 h-5" />
              <span>Complete Delivery (POD)</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Confirm package handover for tracking <strong>{shipment.trackingNumber}</strong>.
            </p>
            <div>
              <label className="block font-semibold mb-1">Recipient Name / Signature Reference *</label>
              <input
                type="text"
                required
                placeholder="e.g. Received by M. Henderson"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Handover Delivery Note</label>
              <textarea
                rows={2}
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeliverModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updating || !signatureName.trim()}
                onClick={() =>
                  handleStatusTransition("DELIVERED", {
                    note: `${deliveryNote} (Signed: ${signatureName})`,
                    signatureUrl: `sig_${Date.now()}`,
                  })
                }
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:opacity-50"
              >
                {updating ? "Saving..." : "Verify & Mark Delivered"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAILURE MODAL */}
      {failModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 max-w-md w-full rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
              <XCircle className="w-5 h-5" />
              <span>Report Delivery Exception</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Select the exception reason preventing delivery at this time.
            </p>
            <div>
              <label className="block font-semibold mb-1">Standard Failure Reason *</label>
              <select
                value={failureReason}
                onChange={(e) => setFailureReason(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none"
              >
                <option value="Business closed - no secure delivery locker">Business closed / outside operating hours</option>
                <option value="Recipient not available / signature required">Recipient not available</option>
                <option value="Access blocked / gate code invalid">Access blocked / gate locked</option>
                <option value="Incorrect address provided">Incorrect address provided</option>
                <option value="Package damaged in transit">Package damaged in transit</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Additional Courier Notes</label>
              <textarea
                rows={2}
                placeholder="Details of the delivery attempt"
                value={failureNote}
                onChange={(e) => setFailureNote(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFailModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={() =>
                  handleStatusTransition("DELIVERY_FAILED", {
                    failureReason,
                    note: failureNote || `Delivery failed: ${failureReason}`,
                  })
                }
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold disabled:opacity-50"
              >
                {updating ? "Logging Exception..." : "Submit Exception"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
