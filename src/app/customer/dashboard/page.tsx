"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  PlusCircle,
  Search,
  ArrowRight,
  ExternalLink,
  IndianRupee,
  AlertCircle,
} from "lucide-react";

export default function CustomerDashboard() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/shipments?limit=6")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setShipments(json.data.shipments || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const totalActive = shipments.filter((s) =>
    ["CREATED", "CONFIRMED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(s.status)
  ).length;

  const totalDelivered = shipments.filter((s) => s.status === "DELIVERED").length;
  const totalExceptions = shipments.filter((s) => ["DELIVERY_FAILED", "CANCELLED"].includes(s.status)).length;
  const totalSpend = shipments.reduce((acc, curr) => acc + (curr.price || 0), 0);

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customer Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor active parcels, schedule courier pickups, and review invoices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/track"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Track by Number</span>
          </Link>
          <Link
            href="/customer/shipments/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-500/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Shipment</span>
          </Link>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Shipments"
          value={totalActive}
          subtitle="Currently in transit or processing"
          icon={<Truck className="w-5 h-5" />}
        />
        <MetricCard
          title="Successfully Delivered"
          value={totalDelivered}
          subtitle="Completed with verified POD"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
        />
        <MetricCard
          title="Exceptions / Alerts"
          value={totalExceptions}
          subtitle="Requires attention or failed"
          icon={<AlertCircle className="w-5 h-5 text-rose-500" />}
        />
        <MetricCard
          title="Total Shipping Spend"
          value={`₹${totalSpend.toFixed(2)}`}
          subtitle="Current billed shipments"
          icon={<IndianRupee className="w-5 h-5 text-brand-600" />}
        />
      </div>

      {/* Recent Shipments Section */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Shipments</h2>
            <p className="text-xs text-slate-500">Latest active orders and transit manifests</p>
          </div>
          <Link
            href="/customer/shipments"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View All ({shipments.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500 space-y-2">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-brand-500 border-t-transparent" />
            <p>Loading your shipments...</p>
          </div>
        ) : shipments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-semibold">No Shipments Booked Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Ready to send a package? Book a shipment now to calculate real-time rates and generate tracking labels.
            </p>
            <Link
              href="/customer/shipments/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-brand-600 text-white"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Book Your First Shipment</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 dark:bg-navy-950/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Tracking Code</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Service Level</th>
                  <th className="py-3 px-4">Est. Delivery</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {shipments.map((s) => {
                  const recipient = s.addresses?.find((a: any) => a.type === "RECIPIENT");
                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-brand-600">
                        <Link href={`/customer/shipments/${s.id}`} className="hover:underline">
                          {s.trackingNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {recipient?.name || "Recipient"}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {recipient?.city}, {recipient?.state}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={s.status} size="sm" />
                      </td>
                      <td className="py-3 px-4">
                        <PriorityBadge priority={s.priority} />
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {s.serviceLevel?.name || "Standard"}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {new Date(s.estimatedDeliveryDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        ₹{s.price.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/customer/shipments/${s.id}`}
                          className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-semibold"
                        >
                          <span>Details</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
