"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import {
  Package,
  Search,
  Filter,
  Download,
  Truck,
  UserCheck,
  ShieldAlert,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Check,
} from "lucide-react";

export default function AdminShipmentsPage() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, totalCount: 0 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // Assign Driver Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Status Override Modal
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideStatus, setOverrideStatus] = useState("IN_TRANSIT");
  const [overrideNote, setOverrideNote] = useState("");
  const [overriding, setOverriding] = useState(false);

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ page: page.toString(), limit: "10", search, status });
      const [shipRes, driverRes] = await Promise.all([
        fetch(`/api/shipments?${query.toString()}`).then((r) => r.json()),
        fetch("/api/admin/drivers").then((r) => r.json()),
      ]);

      if (shipRes.success) {
        setShipments(shipRes.data.shipments || []);
        setPagination(shipRes.data.pagination);
      }
      if (driverRes.success) {
        setDrivers(driverRes.data.drivers || []);
        if (driverRes.data.drivers.length > 0) {
          setSelectedDriverId(driverRes.data.drivers[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, [status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(1);
  };

  const handleAssignDriver = async () => {
    if (!selectedShipment || !selectedDriverId) return;
    setAssigning(true);
    try {
      const res = await fetch(`/api/shipments/${selectedShipment.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId: selectedDriverId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error?.message || "Failed to assign driver");
      } else {
        setAssignModalOpen(false);
        fetchData(pagination.page);
      }
    } catch {
      alert("Error assigning driver");
    } finally {
      setAssigning(false);
    }
  };

  const handleStatusOverride = async () => {
    if (!selectedShipment || !overrideNote.trim()) {
      alert("Admin status overrides require an explicit justification note.");
      return;
    }
    setOverriding(true);
    try {
      const res = await fetch(`/api/shipments/${selectedShipment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetStatus: overrideStatus,
          note: overrideNote,
          isOverride: true,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error?.message || "Failed to override status");
      } else {
        setOverrideModalOpen(false);
        fetchData(pagination.page);
      }
    } catch {
      alert("Error submitting override");
    } finally {
      setOverriding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shipments Dispatch Grid</h1>
          <p className="text-xs text-slate-500 mt-1">
            Assign delivery drivers, inspect customer orders, and enforce chain-of-custody rules.
          </p>
        </div>

        <a
          href="/api/admin/export"
          download
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export All to CSV</span>
        </a>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-navy-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search tracking, recipient, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-slate-500 font-medium">Filter Status:</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="CREATED">Created</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PICKED_UP">Picked Up</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="DELIVERY_FAILED">Delivery Failed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading operational records...</div>
        ) : shipments.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No shipments found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 dark:bg-navy-950/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Tracking Code</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Courier</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4 text-right">Dispatch Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {shipments.map((s) => {
                  const recipient = s.addresses?.find((a: any) => a.type === "RECIPIENT");
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-brand-600 block">{s.trackingNumber}</span>
                        <span className="text-[11px] text-slate-400">{s.serviceLevel?.name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-900 dark:text-white block">{s.customer?.name}</span>
                        <span className="text-[11px] text-slate-400">{s.customer?.email}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-900 dark:text-white block">{recipient?.name}</span>
                        <span className="text-[11px] text-slate-400">{recipient?.city}, {recipient?.state}</span>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={s.status} size="sm" />
                      </td>
                      <td className="py-3 px-4">
                        {s.assignedDriver ? (
                          <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                            <Truck className="w-3.5 h-3.5 text-brand-600" />
                            <span>{s.assignedDriver.name}</span>
                          </div>
                        ) : (
                          <span className="text-amber-600 font-semibold text-[11px]">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        ${s.price.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedShipment(s);
                            setSelectedDriverId(s.assignedDriverId || (drivers[0]?.id || ""));
                            setAssignModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-medium"
                          title="Assign Courier"
                        >
                          Assign
                        </button>
                        <button
                          onClick={() => {
                            setSelectedShipment(s);
                            setOverrideStatus(s.status);
                            setOverrideNote("");
                            setOverrideModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded border border-purple-200 dark:border-purple-800 text-purple-600 hover:bg-purple-50 font-medium"
                          title="Admin State Override"
                        >
                          Override
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total shipments)
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchData(pagination.page - 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchData(pagination.page + 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ASSIGN DRIVER MODAL */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 max-w-md w-full rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-brand-600 font-bold text-base">
              <Truck className="w-5 h-5" />
              <span>Assign Courier to Shipment</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Select an authorized driver for parcel <strong>{selectedShipment?.trackingNumber}</strong>.
            </p>

            <div>
              <label className="block font-semibold mb-1">Select Fleet Driver</label>
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none"
              >
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.driverProfile?.vehicleType} • {d.driverProfile?.currentZone} Zone)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={assigning}
                onClick={handleAssignDriver}
                className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold disabled:opacity-50"
              >
                {assigning ? "Assigning..." : "Confirm Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATUS OVERRIDE MODAL */}
      {overrideModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 max-w-md w-full rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-purple-600 font-bold text-base">
              <ShieldAlert className="w-5 h-5" />
              <span>Admin Status Override</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Directly override status for <strong>{selectedShipment?.trackingNumber}</strong>. An immutable audit log entry will be captured.
            </p>

            <div>
              <label className="block font-semibold mb-1">Target Override Status</label>
              <select
                value={overrideStatus}
                onChange={(e) => setOverrideStatus(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none"
              >
                <option value="CREATED">CREATED</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PICKED_UP">PICKED_UP</option>
                <option value="IN_TRANSIT">IN_TRANSIT</option>
                <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="DELIVERY_FAILED">DELIVERY_FAILED</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="RETURNED">RETURNED</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Administrative Justification (Mandatory) *</label>
              <textarea
                rows={2}
                required
                placeholder="Reason for manual operational override"
                value={overrideNote}
                onChange={(e) => setOverrideNote(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOverrideModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={overriding || !overrideNote.trim()}
                onClick={handleStatusOverride}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold disabled:opacity-50"
              >
                {overriding ? "Overriding..." : "Apply Override"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
