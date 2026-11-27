import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Studio (admin) access: one access code shared with Herman's team and staff.
// Set STUDIO_ACCESS_CODE (STUDIO_PASSCODE still works). Without the code nobody can
// open Studio or run any admin action. The cookie holds an HMAC of the code, never the code.
const COOKIE = "studio_session";

const accessCode = () => process.env.STUDIO_ACCESS_CODE || process.env.STUDIO_PASSCODE || "";

function sessionToken(): string | null {
  const pass = accessCode();
  if (!pass) return null;
  return createHmac("sha256", pass).update("behind-the-hook-studio-v1").digest("hex");
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export async function isTeam(): Promise<boolean> {
  const token = sessionToken();
  if (!token) return false;
  const value = (await cookies()).get(COOKIE)?.value;
  return !!value && safeEqual(value, token);
}

/** Call at the top of every Studio server action. */
export async function requireTeam() {
  if (!(await isTeam())) throw new Error("Sign in to Studio first.");
}

export async function startSession(passcode: string): Promise<boolean> {
  const pass = accessCode();
  const token = sessionToken();
  if (!pass || !token || !safeEqual(passcode, pass)) return false;
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return true;
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}
