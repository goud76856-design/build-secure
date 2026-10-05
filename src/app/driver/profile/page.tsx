"use client";

import React, { useState, useEffect } from "react";
import { Truck, ShieldCheck, User, Star, MapPin } from "lucide-react";

export default function DriverProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setUser(json.data.user);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !user) {
    return <div className="p-12 text-center text-xs text-slate-500">Loading driver credentials...</div>;
  }

  const p = user.driverProfile;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight">Driver & Vehicle Credentials</h1>
        <p className="text-xs text-slate-500 mt-1">Operational equipment specs, active zone assignment, and carrier rating.</p>
      </div>

      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-16 h-16 rounded-full bg-amber-600 text-white font-bold text-xl flex items-center justify-center">
            {user.name[0]}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{user.name}</h2>
            <p className="text-xs text-slate-500">{user.email} • {user.phone}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                {p?.availabilityStatus || "AVAILABLE"}
              </span>
              <span className="text-xs font-semibold text-amber-500 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-current" /> {p?.rating || 4.9} Performance Score
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-1">Employee Reference Number</span>
            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 font-mono font-semibold">
              {p?.employeeId || "DRV-101"} ({p?.driverReference || "REF-JDAVIS"})
            </div>
          </div>

          <div>
            <span className="text-slate-400 block mb-1">Assigned Operational Sector</span>
            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 font-semibold flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brand-600" />
              <span>{p?.currentZone || "NORTH"} METRO SECTOR</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 block mb-1">Assigned Vehicle Type</span>
            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 font-semibold flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-brand-600" />
              <span>{p?.vehicleType || "VAN"}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 block mb-1">License Plate / Vehicle Number</span>
            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 font-mono font-semibold">
              {p?.vehicleNumber || "TX-VAN-4402"}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Authorized Carrier Personnel ID</span>
          </div>
          <span>Driver User ID: {user.id}</span>
        </div>
      </div>
    </div>
  );
}
