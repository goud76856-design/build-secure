import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "HEALTHY";
  let dbLatencyMs = 0;

  try {
    await prisma.$queryRaw`SELECT 1 as ping`;
    dbLatencyMs = Date.now() - startTime;
  } catch (error) {
    dbStatus = "UNHEALTHY";
  }

  const session = await getSessionUser();
  const isHealthy = dbStatus === "HEALTHY";

  // Public callers receive safe non-fingerprinting status
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({
      status: isHealthy ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
    });
  }

  // Admin callers receive detailed diagnostics
  const memoryUsage = process.memoryUsage();
  return NextResponse.json({
    status: isHealthy ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
      provider: "sqlite",
    },
    system: {
      nodeVersion: process.version,
      memory: {
        rssMB: Math.round(memoryUsage.rss / 1024 / 1024),
        heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      },
    },
  });
}
