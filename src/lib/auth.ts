import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import prisma from "./prisma";

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("FATAL: JWT_SECRET environment variable is missing in production!");
    }
    return new TextEncoder().encode("shipflow_enterprise_secret_auth_key_october_2026_production");
  }
  return new TextEncoder().encode(secret);
}

const SECRET_KEY = getSecretKey();

const SESSION_COOKIE_NAME = "shipflow_session";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "DRIVER" | "ADMIN";
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signSessionToken(user: AuthUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as AuthUser["role"],
    };
  } catch (error) {
    return null;
  }
}

export async function getSessionUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function getActiveSessionUser(): Promise<AuthUser | null> {
  const session = await getSessionUser();
  if (!session) return null;
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { isActive: true },
    });
    if (!user || !user.isActive) return null;
    return session;
  } catch {
    return session;
  }
}

export function setSessionCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

export function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
