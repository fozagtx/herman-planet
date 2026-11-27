import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { bachs, isPaidStatus } from "@/lib/bachs";
import { getOrder, markPaid } from "@/lib/pack";

export const metadata = { title: "Your order · The Pack", robots: { index: false } };

export default function OrderPage({ params }: PageProps<"/pack/order/[id]">) {
  return (
    <main className="grid min-h-svh place-items-center bg-paper px-6 text-ink">
      <Suspense fallback={<div className="h-48 w-full max-w-md animate-pulse rounded-[15px] bg-sunk" />}>
        <Result id={params.then((p) => p.id)} />
      </Suspense>
    </main>
  );
}

async function Result({ id }: { id: Promise<string> }) {
  const orderId = await id;
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) notFound();
  let order = await getOrder(orderId);
  if (!order) notFound();

  // Don't trust the redirect alone: ask Bachs whether this checkout was paid.
  const client = bachs();
  if (client && order.checkoutId && (order.status === "new" || order.status === "confirmed")) {
    try {
      const session = await client.checkoutSessions.get(order.checkoutId);
      if (isPaidStatus(session.status)) {
        await markPaid(order.id);
        order = (await getOrder(orderId))!;
      }
    } catch (e) {
      console.error("Bachs checkout lookup failed", (e as { errorCode?: string }).errorCode ?? e);
    }
  }
  const paid = order.status === "paid" || order.status === "fulfilled";
  return (
    <div className="surface w-full max-w-md p-6 text-center">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">The Pack</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">{paid ? "Paid. You're in the pack." : "Order received"}</h1>
      <p className="mt-2 text-[15px] text-muted-foreground">
        {order.quantity} × {order.item}{order.size ? ` (${order.size})` : ""}.{" "}
        {paid ? "Herman's team will be in touch about delivery." : "If you finished paying, this updates in a moment. Herman's team will contact you either way."}
      </p>
      <Link href="/pack" className="press mt-6 inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-surface hover:bg-ink/85">Back to the pack</Link>
    </div>
  );
}
