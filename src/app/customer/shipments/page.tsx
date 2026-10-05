"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import {
  Package,
  Search,
  Filter,
  PlusCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
} from "lucide-react";

export default function CustomerShipmentsPage() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, totalCount: 0 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchShipments = async (pageToFetch = 1) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: pageToFetch.toString(),
        limit: "10",
        search,
        status,
      });

      const res = await fetch(`/api/shipments?${query.toString()}`);
      const json = await res.json();
      if (json.success) {
        setShipments(json.data.shipments || []);
        setPagination(json.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments(1);
  }, [status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchShipments(1);
  };

  const copyTracking = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedId(num);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header & New Shipment Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Shipments</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse all historical and active shipments booked under your account.
          </p>
        </div>
        <Link
          href="/customer/shipments/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Shipment</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-navy-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search tracking, city, description..."
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
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
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

      {/* Shipments Table */}
      <div className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500 space-y-2">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-brand-500 border-t-transparent" />
            <p>Loading shipment records...</p>
          </div>
        ) : shipments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-semibold">No Shipments Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No matching records found for the current search filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 dark:bg-navy-950/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Tracking Code</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Weight</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4">Est. Delivery</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {shipments.map((s) => {
                  const recipient = s.addresses?.find((a: any) => a.type === "RECIPIENT");
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-mono font-semibold text-brand-600">
                          <Link href={`/customer/shipments/${s.id}`} className="hover:underline">
                            {s.trackingNumber}
                          </Link>
                          <button
                            onClick={() => copyTracking(s.trackingNumber)}
                            className="text-slate-400 hover:text-slate-600"
                            title="Copy tracking number"
                          >
                            {copiedId === s.trackingNumber ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                          {s.packageDescription}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {recipient?.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {recipient?.city}, {recipient?.state}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={s.status} size="sm" />
                      </td>
                      <td className="py-3 px-4">
                        <PriorityBadge priority={s.priority} />
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {s.weight} kg
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {new Date(s.estimatedDeliveryDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        ${s.price.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/customer/shipments/${s.id}`}
                          className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-semibold"
                        >
                          <span>View</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total shipments)
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchShipments(pagination.page - 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchShipments(pagination.page + 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
