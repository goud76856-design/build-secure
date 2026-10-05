"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { Truck, Search, Filter, ArrowRight, MapPin, Package } from "lucide-react";

export default function DriverAssignmentsPage() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ status });
      const res = await fetch(`/api/shipments?${query.toString()}`);
      const json = await res.json();
      if (json.success) setShipments(json.data.shipments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Driver Route Assignments</h1>
          <p className="text-xs text-slate-500 mt-1">Full shift delivery stops and pickup assignments.</p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-slate-500 font-medium">Filter Status:</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none"
          >
            <option value="ALL">All Stops</option>
            <option value="CONFIRMED">Awaiting Pickup</option>
            <option value="PICKED_UP">Picked Up</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="DELIVERY_FAILED">Failed Deliveries</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading route stops...</div>
        ) : shipments.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Truck className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-semibold">No Stops in Queue</h3>
            <p className="text-xs text-slate-500">No shipments found for the selected filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {shipments.map((s, idx) => {
              const recipient = s.addresses?.find((a: any) => a.type === "RECIPIENT");
              return (
                <div
                  key={s.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-start gap-3 text-xs">
                    <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-950/60 text-brand-600 font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-brand-600">
                          {s.trackingNumber}
                        </span>
                        <StatusBadge status={s.status} size="sm" />
                        <PriorityBadge priority={s.priority} />
                      </div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {recipient?.name} {recipient?.companyName && `(${recipient.companyName})`}
                      </p>
                      <p className="text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{recipient?.addressLine1}, {recipient?.city}, {recipient?.state}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <Link
                      href={`/driver/assignments/${s.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm"
                    >
                      <span>Execute Stop</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
