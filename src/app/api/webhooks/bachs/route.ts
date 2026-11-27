import { BachsWebhookError, webhooks } from "@bachs/sdk";
import { isPaidStatus } from "@/lib/bachs";
import { getTicket, markTicketPaid } from "@/lib/events";
import { getOrder, markPaid } from "@/lib/pack";

// Bachs webhook: the source of truth for "this order is paid".
// Verified with BACHS_WEBHOOK_SECRET on the raw body before anything is read.
export async function POST(request: Request) {
  const secret = process.env.BACHS_WEBHOOK_SECRET;
  if (!secret) return new Response("Webhook not configured", { status: 503 });
  const body = await request.text();
  let event;
  try {
    event = webhooks.constructEvent(body, request.headers, secret);
  } catch (err) {
    if (err instanceof BachsWebhookError) return new Response("Invalid signature", { status: 400 });
    throw err;
  }

  const data = event.data as Record<string, unknown>;
  const meta = (data.metadata ?? {}) as Record<string, unknown>;
  const orderId = String(data.reference ?? meta.order_id ?? "");
  const paidEvent = /(succeeded|completed|paid)$/i.test(event.type) || isPaidStatus(data.status);

  if (orderId && paidEvent && /^[0-9a-f-]{36}$/i.test(orderId)) {
    if (meta.kind === "ticket") {
      const ticket = await getTicket(orderId);
      if (ticket && !ticket.sample) await markTicketPaid(ticket.id);
    } else {
      const order = await getOrder(orderId);
      if (order && !order.sample) await markPaid(order.id);
    }
  } else {
    console.info("Bachs webhook received", event.type);
  }
  return new Response(null, { status: 200 });
}
