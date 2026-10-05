import React from "react";
import { CheckCircle2, Clock, AlertTriangle, Truck, Package, XCircle, ArrowRight } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

interface TimelineEvent {
  id: string;
  previousStatus?: string | null;
  newStatus: string;
  note?: string | null;
  failureReason?: string | null;
  signatureUrl?: string | null;
  proofOfDeliveryUrl?: string | null;
  createdAt: string | Date;
  createdBy?: { name: string; role: string } | null;
}

export function Timeline({ events }: { events: TimelineEvent[] }) {
  if (!events || events.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-slate-500">
        No tracking milestones recorded yet.
      </div>
    );
  }

  const getEventIcon = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "DELIVERY_FAILED":
      case "CANCELLED":
        return <XCircle className="w-5 h-5 text-rose-500" />;
      case "OUT_FOR_DELIVERY":
      case "IN_TRANSIT":
      case "PICKED_UP":
        return <Truck className="w-5 h-5 text-blue-500" />;
      default:
        return <Package className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
      {events.map((event, idx) => (
        <div key={event.id || idx} className="relative flex items-start group">
          <div className="absolute -left-6 mt-1 flex items-center justify-center bg-white dark:bg-navy-900 rounded-full p-0.5 ring-4 ring-white dark:ring-navy-900">
            {getEventIcon(event.newStatus)}
          </div>
          <div className="ml-4 flex-1 bg-white dark:bg-navy-900/60 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <StatusBadge status={event.newStatus} size="sm" />
                {event.previousStatus && (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    (from <span className="font-medium text-slate-600 dark:text-slate-300">{event.previousStatus}</span>)
                  </span>
                )}
              </div>
              <time className="text-xs text-slate-500 font-medium">
                {new Date(event.createdAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            </div>

            {event.note && (
              <p className="text-sm text-slate-700 dark:text-slate-200 mt-1">
                {event.note}
              </p>
            )}

            {event.failureReason && (
              <div className="mt-2.5 p-2.5 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2 text-rose-700 dark:text-rose-300 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Exception Reason:</span> {event.failureReason}
                </div>
              </div>
            )}

            {event.signatureUrl && (
              <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Recipient signature recorded on delivery file
              </div>
            )}

            {event.createdBy && (
              <div className="mt-2 text-[11px] text-slate-400">
                Logged by: {event.createdBy.name} ({event.createdBy.role})
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
