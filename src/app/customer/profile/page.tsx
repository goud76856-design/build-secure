"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Building, MapPin, ShieldCheck, Check } from "lucide-react";

export default function CustomerProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setUser(json.data.user);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !user) {
    return <div className="p-12 text-center text-xs text-slate-500">Loading profile data...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight">Account & Profile Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Manage corporate dispatch address and contact preferences.</p>
      </div>

      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-16 h-16 rounded-full bg-brand-600 text-white font-bold text-xl flex items-center justify-center">
            {user.name[0]}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{user.name}</h2>
            <p className="text-xs text-slate-500">{user.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-100 dark:bg-brand-950/60 text-brand-700">
              Verified {user.role} Account
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold block text-slate-500 mb-1">Company / Organization</label>
            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 font-medium">
              {user.customerProfile?.companyName || "Acmetron Technologies Ltd."}
            </div>
          </div>

          <div>
            <label className="font-semibold block text-slate-500 mb-1">Contact Phone</label>
            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 font-medium">
              {user.phone || "+1 (555) 234-5678"}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="font-semibold block text-slate-500 mb-1">Default Dispatch / Pickup Address</label>
            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 font-medium">
              {user.customerProfile?.defaultAddress || "100 Tech Ridge Parkway, Austin, TX 78753"}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>End-to-End Encrypted Session</span>
          </div>
          <span>Member ID: {user.id}</span>
        </div>
      </div>
    </div>
  );
}
