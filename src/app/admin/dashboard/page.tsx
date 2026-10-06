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
  AlertTriangle,
  IndianRupee,
  Users,
  Download,
  ArrowRight,
  Activity,
  Layers,
  Filter,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AdminDashboardPage() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/shipments?limit=100").then((r) => r.json()),
      fetch("/api/admin/drivers").then((r) => r.json()),
    ])
      .then(([shipData, driverData]) => {
        if (shipData.success) setShipments(shipData.data.shipments || []);
        if (driverData.success) setDrivers(driverData.data.drivers || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalShipments = shipments.length;
  const inTransitCount = shipments.filter((s) => ["PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(s.status)).length;
  const deliveredCount = shipments.filter((s) => s.status === "DELIVERED").length;
  const failedCount = shipments.filter((s) => s.status === "DELIVERY_FAILED").length;
  const unassignedCount = shipments.filter((s) => !s.assignedDriverId && !["DELIVERED", "CANCELLED"].includes(s.status)).length;
  const totalRevenue = shipments.reduce((acc, curr) => acc + (curr.price || 0), 0);

  // Status breakdown data for Recharts
  const statusCounts: Record<string, number> = {};
  shipments.forEach((s) => {
    statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
  });

  const chartData = Object.keys(statusCounts).map((statusKey) => ({
    name: statusKey.replace(/_/g, " "),
    count: statusCounts[statusKey],
  }));

  const pieData = [
    { name: "Delivered", value: deliveredCount, color: "#10b981" },
    { name: "In Transit", value: inTransitCount, color: "#3b82f6" },
    { name: "Exceptions", value: failedCount, color: "#f43f5e" },
    { name: "Pending", value: shipments.filter((s) => ["CREATED", "CONFIRMED"].includes(s.status)).length, color: "#8b5cf6" },
  ];

  return (
    <div className="space-y-8">
      {/* Header and Quick CSV Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Operations Command Center</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time logistical telemetry, fleet distribution, and dispatch control.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/admin/export"
            download
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>
          <Link
            href="/admin/shipments"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-brand-600 hover:bg-brand-700 text-white shadow-sm"
          >
            <Layers className="w-4 h-4" />
            <span>Dispatch Grid</span>
          </Link>
        </div>
      </div>

      {/* Macro Operational KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Total Shipments"
          value={totalShipments}
          subtitle="All platform orders"
          icon={<Package className="w-5 h-5" />}
        />
        <MetricCard
          title="In Transit"
          value={inTransitCount}
          subtitle="Active on routes"
          icon={<Truck className="w-5 h-5 text-sky-500" />}
        />
        <MetricCard
          title="Delivered"
          value={deliveredCount}
          subtitle="Verified with POD"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
        />
        <MetricCard
          title="Exceptions"
          value={failedCount}
          subtitle="Delivery failed"
          icon={<AlertTriangle className="w-5 h-5 text-rose-500" />}
        />
        <MetricCard
          title="Unassigned"
          value={unassignedCount}
          subtitle="Needs driver queue"
          icon={<Users className="w-5 h-5 text-amber-500" />}
        />
        <MetricCard
          title="Gross Revenue"
          value={`₹${totalRevenue.toFixed(0)}`}
          subtitle="Billed freight volume"
          icon={<IndianRupee className="w-5 h-5 text-emerald-600" />}
        />
      </div>

      {/* Analytics Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-navy-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Shipment Distribution by Lifecycle State
              </h2>
              <p className="text-xs text-slate-400">Current active parcels across states</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="name" fontSize={10} interval={0} angle={-20} textAnchor="end" />
                <YAxis fontSize={10} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Distribution */}
        <div className="bg-white dark:bg-navy-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Transit Health Ratio</h2>
            <p className="text-xs text-slate-400">Delivery completion vs exceptions</p>
          </div>

          <div className="h-48 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={40}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-slate-600 dark:text-slate-400">{d.name}:</span>
                <span className="font-bold text-slate-900 dark:text-white">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Needs Attention Alert List */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Dispatch Action Queue
            </h2>
            <p className="text-xs text-slate-500">Parcels requiring driver assignment or exception resolution</p>
          </div>
          <Link
            href="/admin/shipments"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>Open Dispatch Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {shipments
            .filter((s) => !s.assignedDriverId || s.status === "DELIVERY_FAILED")
            .slice(0, 5)
            .map((s) => {
              const recipient = s.addresses?.find((a: any) => a.type === "RECIPIENT");
              return (
                <div key={s.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={s.status} size="sm" />
                    <div>
                      <span className="font-mono font-bold text-brand-600">{s.trackingNumber}</span>
                      <span className="text-slate-400 ml-2">to {recipient?.name} ({recipient?.city})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-400">
                      {s.assignedDriver ? `Assigned: ${s.assignedDriver.name}` : "⚠️ Unassigned"}
                    </span>
                    <Link
                      href={`/admin/shipments`}
                      className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Dispatch
                    </Link>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
