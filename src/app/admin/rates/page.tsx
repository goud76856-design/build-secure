"use client";

import React, { useState, useEffect } from "react";
import { DollarSign, Truck, ShieldCheck, Check } from "lucide-react";

export default function AdminRatesPage() {
  const [serviceLevels, setServiceLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/service-levels")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setServiceLevels(data.data.serviceLevels || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight">Service Tiers & Rate Cards</h1>
        <p className="text-xs text-slate-500 mt-1">Configure base transport tariffs, weight surcharges, and SLA thresholds.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {serviceLevels.map((lvl) => (
          <div
            key={lvl.id}
            className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 text-xs"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{lvl.name}</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                Active Tier
              </span>
            </div>

            <p className="text-slate-500">{lvl.description}</p>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span>Base Departure Rate:</span>
                <span className="font-bold text-slate-900 dark:text-white">${lvl.basePrice.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between">
                <span>Weight Surcharge:</span>
                <span className="font-semibold text-slate-900 dark:text-white">${lvl.pricePerWeightUnit.toFixed(2)} / kg</span>
              </div>
              <div className="flex justify-between">
                <span>Target SLA:</span>
                <span className="font-semibold">{lvl.estimatedDays === 0 ? "Same-Day" : `${lvl.estimatedDays} Business Days`}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
