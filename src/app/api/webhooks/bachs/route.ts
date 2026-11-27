import { BachsWebhookError, webhooks } from "@bachs/sdk";
import { getTicketByCheckout, markTicketPaid } from "@/lib/events";
import { getOrderByCheckout, markPaid } from "@/lib/pack";

// Bachs webhook: the source of truth for "this order or ticket is paid".
// Docs: https://docs.bachs.io/guides/checkout/checkout-sessions
// A paid checkout sends checkout.completed and collection.succeeded, in either order;
// both carry data.checkout_id. We fulfil on whichever arrives first, once (markPaid only
// moves an order forward), and only if the amount paid matches what it should cost.
const PAID_EVENTS = new Set(["checkout.completed", "collection.succeeded"]);

export async function POST(request: Request) {
  const secret = process.env.BACHS_WEBHOOK_SECRET;
  if (!secret) return new Response("Webhook not configured", { status: 503 });

  // Verify the signature on the raw body before reading anything.
  const body = await request.text();
  let event;
  try {
    event = webhooks.constructEvent(body, request.headers, secret);
  } catch (err) {
    if (err instanceof BachsWebhookError) return new Response("Invalid signature", { status: 400 });
    throw err;
  }

  if (!PAID_EVENTS.has(event.type)) return new Response(null, { status: 200 });
  const data = event.data as Record<string, unknown>;
  const checkoutId = typeof data.checkout_id === "string" ? data.checkout_id : "";
  if (event.type === "collection.succeeded" && String(data.status ?? "").toUpperCase() !== "SUCCEEDED") return new Response(null, { status: 200 });
  if (!checkoutId) return new Response(null, { status: 200 });

  const amountOk = (unit: string | null, qty: number) => {
    if (data.amount === undefined || unit === null) return true; // checkout.completed may not carry an amount
    return Number(data.amount).toFixed(2) === (Number(unit) * qty).toFixed(2);
  };

  const order = await getOrderByCheckout(checkoutId);
  if (order) {
    if (!order.sample && amountOk(order.unitAmount, order.quantity)) await markPaid(order.id);
    else if (!order.sample) console.error("Bachs amount mismatch on order", order.id);
    return new Response(null, { status: 200 });
  }
  const ticket = await getTicketByCheckout(checkoutId);
  if (ticket) {
    if (!ticket.sample && amountOk(ticket.unitAmount, ticket.quantity)) await markTicketPaid(ticket.id);
    else if (!ticket.sample) console.error("Bachs amount mismatch on ticket", ticket.id);
  }
  return new Response(null, { status: 200 });
}
