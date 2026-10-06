import prisma from "./prisma";

export function extractClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded.split(",").map((ip) => ip.trim());
    const validIp = ips.find((ip) => /^(\d{1,3}\.){3}\d{1,3}$|^[a-fA-F0-9:]+$/.test(ip));
    if (validIp) return validIp;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp && /^(\d{1,3}\.){3}\d{1,3}$|^[a-fA-F0-9:]+$/.test(realIp)) {
    return realIp;
  }
  return "127.0.0.1";
}

export async function logAuditEvent(params: {
  actorId?: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
}) {
  try {
    return await prisma.auditLog.create({
      data: {
        actorId: params.actorId || null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
        ipAddress: params.ipAddress || null,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log entry:", error);
  }
}
