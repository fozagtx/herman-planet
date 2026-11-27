import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { bachs, isPaidStatus } from "@/lib/bachs";
import { getTicket, markTicketPaid } from "@/lib/events";

export const metadata = { title: "Your tickets · The Pack", robots: { index: false } };

export default function TicketPage({ params }: PageProps<"/pack/ticket/[id]">) {
  return (
    <main className="grid min-h-svh place-items-center bg-paper px-6 text-ink">
      <Suspense fallback={<div className="h-48 w-full max-w-md animate-pulse rounded-[15px] bg-sunk" />}>
        <Result id={params.then((p) => p.id)} />
      </Suspense>
    </main>
  );
}

async function Result({ id }: { id: Promise<string> }) {
  const ticketId = await id;
  if (!/^[0-9a-f-]{36}$/i.test(ticketId)) notFound();
  let t = await getTicket(ticketId);
  if (!t) notFound();
  // Ask Bachs, don't trust the redirect.
  const client = bachs();
  if (client && t.checkoutId && (t.status === "new" || t.status === "confirmed")) {
    try {
      const s = await client.checkoutSessions.get(t.checkoutId);
      if (isPaidStatus(s.status)) {
        await markTicketPaid(t.id);
        t = (await getTicket(ticketId))!;
      }
    } catch (e) {
      console.error("Bachs checkout lookup failed", (e as { errorCode?: string }).errorCode ?? e);
    }
  }
  const paid = t.status === "paid" || t.status === "fulfilled";
  const when = t.event.startsAt.toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Accra" });
  return (
    <div className="surface w-full max-w-md p-6 text-center">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">The Pack</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">{paid ? "Paid. See you there." : "Tickets held"}</h1>
      <p className="mt-2 text-[15px] text-muted-foreground">
        {t.quantity} × {t.event.title} · {t.event.venue}, {t.event.city} · {when}.{" "}
        {paid ? "Your tickets are confirmed." : "If you finished paying, this updates in a moment. Herman's team will contact you either way."}
      </p>
      <Link href="/pack#events" className="press mt-6 inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-surface hover:bg-ink/85">Back to the pack</Link>
    </div>
  );
}
