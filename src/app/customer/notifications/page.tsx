"use client";

import React, { useState, useEffect } from "react";
import { Bell, CheckCircle2, Truck, AlertTriangle, Clock } from "lucide-react";

export default function CustomerNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, queries /api/notifications. For demo, we seed initial or fetch
    setNotifications([
      {
        id: "1",
        title: "Shipment Out for Delivery",
        message: "Your shipment SF-2026-90412 is currently on the delivery vehicle.",
        time: "2 hours ago",
        type: "STATUS_CHANGE",
        isRead: false,
      },
      {
        id: "2",
        title: "Shipment Delivered Successfully",
        message: "Package SF-2026-88193 was delivered and signed for.",
        time: "Yesterday",
        type: "DELIVERED",
        isRead: true,
      },
      {
        id: "3",
        title: "Order Confirmed & Manifest Generated",
        message: "Shipment SF-2026-44390 was confirmed and queued for courier pickup.",
        time: "2 days ago",
        type: "CONFIRMED",
        isRead: true,
      },
    ]);
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight">In-App Notifications</h1>
        <p className="text-xs text-slate-500 mt-1">Real-time alerts for milestone transitions and dispatches.</p>
      </div>

      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 flex items-start gap-4 transition-colors ${
              !n.isRead ? "bg-brand-50/30 dark:bg-brand-950/20" : ""
            }`}
          >
            <div className="p-2.5 rounded-xl bg-brand-100 dark:bg-brand-950/60 text-brand-600 mt-0.5">
              <Bell className="w-4 h-4" />
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
