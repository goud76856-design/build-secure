"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Truck, Lock, Mail, ArrowRight, AlertCircle, ShieldCheck, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error?.message || "Invalid credentials");
      } else {
        router.push(data.data.redirectPath || "/customer/dashboard");
      }
    } catch {
      setError("Unable to connect to authentication server");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("ShipFlow2026!");
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md space-y-6">
          {/* Form Card */}
          <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <div className="text-center space-y-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-sm shadow-brand-500/20">
                <Truck className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Sign in to ShipFlow</h1>
              <p className="text-xs text-slate-500">
                Access your customer, driver, or operations command portal.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                {loading ? "Authenticating..." : "Sign In"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
              New customer?{" "}
              <Link href="/auth/register" className="font-semibold text-brand-600 hover:underline">
                Create an account
              </Link>
            </div>
          </div>

          {/* Quick Demo Credentials Assistant */}
          <div className="bg-slate-100 dark:bg-navy-900/60 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              <span>Instant Evaluator Demo Quick-Fill</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Click any role below to pre-populate verified seeded test credentials:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemo("admin@shipflow.com")}
                className="p-2 rounded-lg bg-white dark:bg-navy-800 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-brand-600 hover:border-brand-500 transition-colors text-center"
              >
                👑 Admin
              </button>
              <button
                type="button"
                onClick={() => fillDemo("driver.john@shipflow.com")}
                className="p-2 rounded-lg bg-white dark:bg-navy-800 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-amber-600 hover:border-amber-500 transition-colors text-center"
              >
                🚚 Driver
              </button>
              <button
                type="button"
                onClick={() => fillDemo("customer.alice@gmail.com")}
                className="p-2 rounded-lg bg-white dark:bg-navy-800 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-sky-600 hover:border-sky-500 transition-colors text-center"
              >
                📦 Customer
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
