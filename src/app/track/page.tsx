"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { StatusBadge } from "@/components/StatusBadge";
import { Timeline } from "@/components/Timeline";
import {
  Search,
  Package,
  MapPin,
  Calendar,
  Copy,
  Check,
  Printer,
  Shield,
  HelpCircle,
  Truck,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

function TrackContent() {
  const searchParams = useSearchParams();
  const initialNumber = searchParams.get("number") || "";

  const [trackingNumber, setTrackingNumber] = useState(initialNumber);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchTracking = async (num: string) => {
    if (!num.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(`/api/track?number=${encodeURIComponent(num.trim())}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message || "Shipment not found with this tracking number.");
      } else {
        setData(json.data);
      }
    } catch {
      setError("Failed to load tracking data. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialNumber) {
      setTrackingNumber(initialNumber);
      fetchTracking(initialNumber);
    }
  }, [initialNumber]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(trackingNumber);
  };

  const copyTracking = () => {
    if (data?.trackingNumber) {
      navigator.clipboard.writeText(data.trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        {/* Header and Search */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">Public Shipment Tracking</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Enter your unique ShipFlow tracking number to view real-time transit milestones and estimated delivery dates.
          </p>

          <form onSubmit={handleSubmit} className="flex gap-2 max-w-lg mx-auto pt-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Enter your tracking number..."
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-sm transition-colors shadow-sm"
            >
              {loading ? "Searching..." : "Track"}
            </button>
          </form>
        </div>

        {/* Error State */}
        {error && (
          <div className="max-w-lg mx-auto p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-start gap-3 text-sm mb-8">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Tracking Lookup Failed</p>
              <p className="text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="max-w-3xl mx-auto py-16 text-center space-y-3">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand-500 border-t-transparent" />
            <p className="text-sm text-slate-500">Querying real-time shipment manifest...</p>
          </div>
        )}

        {/* Tracking Details View */}
        {data && !loading && (
          <div className="space-y-6">
            {/* Top Summary Card */}
            <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Tracking Number
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {data.trackingNumber}
                    </h2>
                    <button
                      onClick={copyTracking}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Copy tracking number"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={data.status} size="lg" />
                  <button
                    onClick={() => window.print()}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
                    title="Print manifest summary"
                  >
                    <Printer className="w-4 h-4" />
                    <span className="hidden sm:inline">Print</span>
                  </button>
                </div>
              </div>

              {/* Transit Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 text-sm">
                <div>
                  <span className="text-xs text-slate-500 block">Origin Location</span>
                  <div className="font-semibold text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-600" />
                    <span>{data.origin}</span>
                  </div>
                  {data.senderMaskedName && (
                    <span className="text-xs text-slate-400 mt-0.5 block">
                      Sender: {data.senderMaskedName}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-xs text-slate-500 block">Destination</span>
                  <div className="font-semibold text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{data.destination}</span>
                  </div>
                  {data.recipientMaskedName && (
                    <span className="text-xs text-slate-400 mt-0.5 block">
                      Recipient: {data.recipientMaskedName}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-xs text-slate-500 block">Service Level</span>
                  <div className="font-semibold text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-purple-600" />
                    <span>{data.serviceLevel}</span>
                  </div>
                  <span className="text-xs text-slate-400 mt-0.5 block">
                    Type: {data.packageType}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-500 block">Estimated Delivery</span>
                  <div className="font-semibold text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>
                      {new Date(data.estimatedDeliveryDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {data.actualDeliveryDate && (
                    <span className="text-xs text-emerald-600 mt-0.5 block font-medium">
                      Delivered on: {new Date(data.actualDeliveryDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 text-xs text-slate-500">
                <Shield className="w-3.5 h-3.5 text-brand-600" />
                <span>
                  Privacy Protected: Street addresses and direct personal identifiers are masked under logistics compliance standards.
                </span>
              </div>
            </div>

            {/* Vertical Milestones Timeline */}
            <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">
                Chain of Custody Milestones
              </h3>
              <Timeline events={data.timeline} />
            </div>

            {/* Support Box */}
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-brand-600" />
                <span>Need assistance with delivery instructions or rescheduling?</span>
              </div>
              <span className="font-medium text-brand-600">Contact Support: support@shipflow.com</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-xs text-slate-500">Loading tracking portal...</div>}>
      <TrackContent />
    </Suspense>
  );
}
