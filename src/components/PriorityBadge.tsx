import React from "react";

export function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    LOW: "bg-slate-100 text-slate-700 border-slate-200",
    STANDARD: "bg-blue-50 text-blue-700 border-blue-200",
    HIGH: "bg-amber-50 text-amber-700 border-amber-200",
    URGENT: "bg-rose-50 text-rose-700 border-rose-200 animate-pulse",
  };

  const style = styles[priority] || styles.STANDARD;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${style}`}>
      {priority}
    </span>
  );
}
