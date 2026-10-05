"use client";

import React, { useState } from "react";
import { Bell, Truck, Navigation, CheckCircle2 } from "lucide-react";

export default function DriverNotificationsPage() {
  const [notifications] = useState([
    {
      id: "1",
      title: "New Shipment Assigned",
      message: "Shipment SF-2026-90412 has been assigned to your North Zone morning run.",
      time: "1 hour ago",
      type: "ASSIGNMENT",
      isRead: false,
    },
    {
      id: "2",
      title: "Dispatch Priority Update",
      message: "Shipment SF-2026-10495 marked as URGENT delivery window.",
      time: "3 hours ago",
      type: "ALERT",
      isRead: true,
    },
    {
      id: "3",
      title: "Shift Run Manifest Ready",
      message: "Route optimization completed for vehicle TX-VAN-4402.",
      time: "Today, 08:00 AM",
      type: "SYSTEM",
      isRead: true,
    },
  ]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight">Driver Route Alerts</h1>
        <p className="text-xs text-slate-500 mt-1">Live dispatch updates, newly assigned stops, and schedule changes.</p>
      </div>

      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
        {notifications.map((n) => (
          <div key={n.id} className={`p-4 flex items-start gap-4 ${!n.isRead ? "bg-amber-50/30" : ""}`}>
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 mt-0.5">
              <Truck className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{n.title}</h3>
                <span className="text-slate-400 text-[11px]">{n.time}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{n.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
