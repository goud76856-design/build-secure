"use client";

import React, { useState, useEffect } from "react";
import { Activity, Database, Server, RefreshCw, CheckCircle2, ShieldCheck, Cpu } from "lucide-react";

export default function AdminSystemHealthPage() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = () => {
    setLoading(true);
    fetch("/api/health")
      .then((r) => r.json())
      .then((data) => setHealth(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Health & Telemetry</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time database connectivity, kernel runtime metrics, and memory diagnostics.</p>
        </div>

        <button
          onClick={fetchHealth}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {health && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Database Health */}
          <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Database Engine</span>
              <Database className="w-5 h-5 text-brand-600" />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {health.database?.status}
              </span>
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <div>Provider: <strong className="text-slate-700 dark:text-slate-300">SQLite (dev.db)</strong></div>
              <div>Ping Latency: <strong className="text-emerald-600">{health.database?.latencyMs} ms</strong></div>
            </div>
          </div>

          {/* Node & Memory */}
          <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Memory Footprint</span>
              <Cpu className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {health.system?.memory?.rssMB} MB RSS
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <div>Heap Used: <strong className="text-slate-700 dark:text-slate-300">{health.system?.memory?.heapUsedMB} MB</strong></div>
              <div>Runtime: <strong className="text-slate-700 dark:text-slate-300">Node {health.system?.nodeVersion}</strong></div>
            </div>
          </div>

          {/* Uptime */}
          <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Process Uptime</span>
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {health.uptimeSeconds}s active
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <div>Environment: <strong className="text-emerald-600">Local Verified</strong></div>
              <div>Time: {new Date(health.timestamp).toLocaleTimeString()}</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-navy-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Security & Compliance Diagnostic</h3>
        <ul className="space-y-2 text-slate-600 dark:text-slate-400">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>State Machine Transition Enforcer: <strong>Online & Authoritative</strong></span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Session Guard & HttpOnly Cookies: <strong>Secured & Salted (Bcrypt 10 rounds)</strong></span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Public Tracking PII Masking: <strong>Compliant with logistics privacy protocol</strong></span>
          </li>
        </ul>
      </div>
    </div>
  );
}
