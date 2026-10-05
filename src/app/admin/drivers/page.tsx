"use client";

import React, { useState, useEffect } from "react";
import { Truck, Star, MapPin, CheckCircle2, ShieldCheck } from "lucide-react";

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/drivers")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setDrivers(data.data.drivers || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight">Fleet Drivers Directory</h1>
        <p className="text-xs text-slate-500 mt-1">
          Active courier personnel, vehicle specs, and active load assignments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {drivers.map((d) => {
          const p = d.driverProfile;
          const activeDeliveries = d.assignedDeliveries?.length || 0;
          return (
            <div
              key={d.id}
              className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-600 text-white font-bold flex items-center justify-center text-base">
                  {d.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{d.name}</h3>
                  <p className="text-slate-400">{d.email}</p>
                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                    {p?.availabilityStatus || "AVAILABLE"}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Employee ID:</span>
                  <span className="font-mono font-semibold">{p?.employeeId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vehicle:</span>
                  <span className="font-semibold">{p?.vehicleType} ({p?.vehicleNumber})</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Zone:</span>
                  <span className="font-semibold">{p?.currentZone} SECTOR</span>
                </div>
                <div className="flex justify-between">
                  <span>Driver Rating:</span>
                  <span className="font-semibold text-amber-500 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" /> {p?.rating || 4.9}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Active Run Stops:</span>
                  <span className="font-bold text-brand-600">{activeDeliveries} parcels</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
