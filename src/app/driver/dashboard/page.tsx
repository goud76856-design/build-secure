"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import {
  Truck,
  CheckCircle2,
  XCircle,
  MapPin,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Navigation,
} from "lucide-react";

export default function DriverDashboard() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/shipments?limit=10")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setShipments(json.data.shipments || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalAssigned = shipments.length;
  const pickedUpCount = shipments.filter((s) => s.status === "PICKED_UP").length;
  const inTransitCount = shipments.filter((s) => s.status === "IN_TRANSIT").length;
  const outForDeliveryCount = shipments.filter((s) => s.status === "OUT_FOR_DELIVERY").length;
  const deliveredCount = shipments.filter((s) => s.status === "DELIVERED").length;
  const failedCount = shipments.filter((s) => s.status === "DELIVERY_FAILED").length;

  const completionRate =
    totalAssigned > 0 ? Math.round((deliveredCount / totalAssigned) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Driver Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Driver Run Sheet</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
              Shift Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Assigned route stops, custody status controls, and proof-of-delivery recorder.
          </p>
        </div>

        <Link
          href="/driver/assignments"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all"
        >
          <Navigation className="w-4 h-4" />
          <span>Full Route Manifest</span>
        </Link>
      </div>

      {/* Driver Shift Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Assigned Today"
          value={totalAssigned}
          subtitle="Total stops on run"
          icon={<Truck className="w-5 h-5" />}
        />
        <MetricCard
          title="Out For Delivery"
          value={outForDeliveryCount}
          subtitle="Currently on vehicle"
          icon={<Clock className="w-5 h-5 text-amber-500" />}
        />
        <MetricCard
          title="Delivered"
          value={deliveredCount}
          subtitle="Verified with POD"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
        />
        <MetricCard
          title="Failed / Exceptions"
          value={failedCount}
          subtitle="Recorded reasons"
          icon={<XCircle className="w-5 h-5 text-rose-500" />}
        />
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Completion Rate
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {completionRate}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Assigned Route Stops Table */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Today's Route Queue</h2>
            <p className="text-xs text-slate-500">Tap an assignment to update delivery progress</p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-brand-500 border-t-transparent" />
            <p>Fetching assigned stops...</p>
          </div>
        ) : shipments.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Truck className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-semibold">No Shipments Assigned</h3>
            <p className="text-xs text-slate-500">Your dispatcher has not assigned any stops for this run.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 dark:bg-navy-950/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Stop / Tracking</th>
                  <th className="py-3 px-4">Destination Address</th>
                  <th className="py-3 px-4">Recipient Name</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4 text-right">Execution Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {shipments.map((s, idx) => {
                  const recipient = s.addresses?.find((a: any) => a.type === "RECIPIENT");
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="font-mono font-semibold text-brand-600">{s.trackingNumber}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {recipient?.addressLine1}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {recipient?.city}, {recipient?.state} {recipient?.postalCode}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                        {recipient?.name}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={s.status} size="sm" />
                      </td>
                      <td className="py-3 px-4">
                        <PriorityBadge priority={s.priority} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/driver/assignments/${s.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm"
                        >
                          <span>Execute Stop</span>
                          <ArrowRight className="w-3.5 h-3.5" />
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
