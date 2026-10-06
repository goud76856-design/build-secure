"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import {
  Truck,
  ShieldCheck,
  Search,
  ArrowRight,
  Package,
  Clock,
  CheckCircle2,
  Lock,
  BarChart3,
  Layers,
  MapPin,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [quickTrackNumber, setQuickTrackNumber] = useState("");

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickTrackNumber.trim()) {
      router.push(`/track?number=${encodeURIComponent(quickTrackNumber.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 border-b border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50/60 via-transparent to-transparent dark:from-brand-950/20 dark:via-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-100 dark:bg-brand-900/50 text-brand-800 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Autonomous Logistics & Security Kernel</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Intelligent Shipment Orchestration.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-sky-400">
                Guaranteed Chain of Custody.
              </span>
            </h1>

            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              ShipFlow delivers enterprise supply chain clarity. From dynamic multi-step booking to automated driver run-sheets and cryptographic state verification.
            </p>

            {/* Quick Track Search Bar */}
            <form onSubmit={handleTrackSubmit} className="pt-4 max-w-xl mx-auto">
              <div className="relative flex items-center shadow-lg rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 p-2">
                <Search className="w-5 h-5 text-slate-400 ml-3 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Enter your tracking number..."
                  value={quickTrackNumber}
                  onChange={(e) => setQuickTrackNumber(e.target.value)}
                  className="w-full bg-transparent text-sm focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md transition-all shrink-0"
                >
                  <span>Track</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* CTAs */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth/register"
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold text-sm shadow-sm transition-all flex items-center gap-2"
              >
                <span>Create Customer Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/auth/login"
                className="px-6 py-3 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-all"
              >
                Sign In to Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Role Portals Section */}
      <section id="roles" className="py-20 bg-white dark:bg-navy-900/40 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight">Dedicated Role Experiences</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              Purpose-built tools tailored for each participant in the logistics lifecycle.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Customer Card */}
            <div className="bg-slate-50 dark:bg-navy-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-6">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Customer Portal</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  Create shipments in 5 simple steps, generate instant volumetric rate quotes, inspect vertical tracking timelines, and receive status notifications.
                </p>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Instant price calculation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Print-ready summaries & manifests
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> In-app alerts on milestone transitions
                  </li>
                </ul>
              </div>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs transition-colors"
              >
                Sign In as Customer
              </Link>
            </div>

            {/* Driver Card */}
            <div className="bg-slate-50 dark:bg-navy-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-6">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Delivery Personnel (Driver)</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  Mobile-friendly run sheets, step-by-step stop execution, mandatory proof-of-delivery signatures, exception logging, and completion statistics.
                </p>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> State transition engine safeguards
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Proof of delivery & reason recorder
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Daily completion rate meters
                  </li>
                </ul>
              </div>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition-colors"
              >
                Sign In as Driver
              </Link>
            </div>

            {/* Admin Card */}
            <div className="bg-slate-50 dark:bg-navy-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-6">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Operations Command (Admin)</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  Macro operational metrics, live driver dispatching, zone SLA management, pricing rules, immutable audit logs, and one-click CSV exporting.
                </p>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Fleet dispatch & assignment grid
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Immutable audit logging & override justification
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Live system health & DB latency diagnostics
                  </li>
                </ul>
              </div>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs transition-colors"
              >
                Sign In as Administrator
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Security Architecture Section */}
      <section id="security" className="py-20 bg-slate-50 dark:bg-navy-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="w-4 h-4" />
                <span>Security First Design</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Engineered for High-Assurance Chain of Custody
              </h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                ShipFlow protects physical and digital integrity using defense-in-depth principles:
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm text-brand-600">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Authoritative Finite State Machine</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Prevents arbitrary status manipulation. Only authorized roles can advance parcels along verified lifecycle states.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm text-brand-600">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Privacy-Preserving Public Tracking</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Public queries via `/track` mask names, street addresses, and contact numbers while providing complete milestone visibility.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm text-brand-600">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Full Audit Trail & Tamper Evidence</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Every administrative override, assignment, and status transition is immutably logged with actor ID and client IP address.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-navy-900 text-slate-200 p-8 rounded-2xl border border-navy-800 shadow-xl space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-navy-800 pb-3 text-slate-400">
                <span>SECURITY KERNEL AUDIT</span>
                <span className="text-emerald-400">● PASSING (100%)</span>
              </div>
              <p className="text-slate-400">// AUTHORITATIVE STATE CHECK</p>
              <p className="text-sky-300">
                validateStatusTransition(<span className="text-amber-300">"CREATED"</span>, <span className="text-amber-300">"DELIVERED"</span>, <span className="text-emerald-300">"DRIVER"</span>)
              </p>
              <p className="text-rose-400">
                → {"{"} allowed: false, reason: "Illegal transition from CREATED to DELIVERED" {"}"}
              </p>
              <div className="pt-2 border-t border-navy-800">
                <p className="text-slate-400">// PII MASKING PROTOCOL</p>
                <p className="text-sky-300">
                  maskName(<span className="text-amber-300">"Alice Zhang"</span>) → <span className="text-emerald-300">"A**** Z****"</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-10 bg-white dark:bg-navy-900 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-brand-600" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">ShipFlow</span>
            <span>— Build Secure 24 Edition (Team 61 Soul Reapers)</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/track" className="hover:text-brand-600">Track Package</Link>
            <Link href="/auth/login" className="hover:text-brand-600">Sign In</Link>
            <Link href="/api/health" className="hover:text-brand-600">System Diagnostics</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
