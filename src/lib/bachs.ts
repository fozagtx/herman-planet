import "server-only";
import { Bachs } from "@bachs/sdk";

// Bachs payments. The key decides the environment: sk_sandbox_… is test mode,
// sk_live_… takes real money. No key = online payment is off and the shop falls
// back to "place an order, the team sends payment details".
let client: Bachs | null = null;

export function bachs(): Bachs | null {
  const key = process.env.BACHS_API_KEY;
  if (!key) return null;
  client ??= new Bachs({ apiKey: key });
  return client;
}

export const paymentsOn = () => !!process.env.BACHS_API_KEY;

/** Checkout statuses that mean the money arrived. */
export const isPaidStatus = (s: unknown) => typeof s === "string" && /^(paid|succeeded|success|completed|complete)$/i.test(s);
