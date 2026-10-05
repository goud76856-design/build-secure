import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShipFlow — Intelligent Logistics & Shipment Management",
  description: "Enterprise shipment orchestration, real-time tracking, driver execution, and supply chain intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-brand-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
