"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PackagePlus,
  Package,
  Truck,
  Users,
  Activity,
  ShieldAlert,
  Bell,
  Settings,
  DollarSign,
  MapPin,
  ClipboardList,
} from "lucide-react";

interface SidebarProps {
  role: "CUSTOMER" | "DRIVER" | "ADMIN";
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const customerLinks = [
    { label: "Dashboard", href: "/customer/dashboard", icon: LayoutDashboard },
    { label: "Create Shipment", href: "/customer/shipments/new", icon: PackagePlus },
    { label: "My Shipments", href: "/customer/shipments", icon: Package },
    { label: "Notifications", href: "/customer/notifications", icon: Bell },
    { label: "Profile & Settings", href: "/customer/profile", icon: Settings },
  ];

  const driverLinks = [
    { label: "Driver Run Sheet", href: "/driver/dashboard", icon: LayoutDashboard },
    { label: "Assigned Deliveries", href: "/driver/assignments", icon: Truck },
    { label: "Notifications", href: "/driver/notifications", icon: Bell },
    { label: "Vehicle & Status", href: "/driver/profile", icon: Settings },
  ];

  const adminLinks = [
    { label: "Operations Command", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Shipments & Dispatch", href: "/admin/shipments", icon: Package },
    { label: "Fleet & Drivers", href: "/admin/drivers", icon: Truck },
    { label: "Users & Accounts", href: "/admin/users", icon: Users },
    { label: "Rates & Surcharges", href: "/admin/rates", icon: DollarSign },
    { label: "Audit Trails", href: "/admin/audit-logs", icon: ClipboardList },
    { label: "System Health", href: "/admin/system-health", icon: Activity },
  ];

  let links = customerLinks;
  if (role === "DRIVER") links = driverLinks;
  if (role === "ADMIN") links = adminLinks;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 min-h-[calc(100vh-4rem)]">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {role} PORTAL
        </span>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-500/20 text-brand-400 border border-brand-500/30">
          Live Sync
        </span>
      </div>

      <nav className="p-3 space-y-1 flex-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-600 text-white shadow-sm shadow-brand-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        <p className="font-medium text-slate-400">Build Secure 24 Edition</p>
        <p className="text-[11px] mt-0.5">Platform Kernel v1.4.0</p>
      </div>
    </aside>
  );
}
