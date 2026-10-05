import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "HEALTHY";
  let dbLatencyMs = 0;

  try {
    const dbPing = await prisma.$queryRaw`SELECT 1 as ping`;
    dbLatencyMs = Date.now() - startTime;
  } catch (error) {
    dbStatus = "UNHEALTHY";
  }

  const memoryUsage = process.memoryUsage();

  return NextResponse.json({
    status: dbStatus === "HEALTHY" ? "ok" : "degraded",
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
