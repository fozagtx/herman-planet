import { Suspense } from "react";
import Link from "next/link";
import { getFollows } from "@/lib/store";
import { AutoRefresh } from "./auto-refresh";

export const metadata = { title: "Demand · Behind the Hook" };

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function Team() {
  return (
    <div className="min-h-svh bg-paper px-5 py-8 text-ink">
      <AutoRefresh />
      <div className="mx-auto max-w-3xl">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-ink">For Herman&apos;s team & promoters</p>
            <h1 className="text-3xl font-semibold tracking-tight">Where the fans are</h1>
            <p className="mt-1 max-w-lg text-sm text-muted-foreground">
              Every follower opted in and named a city. Followers, people who said they&apos;d buy a ticket, and the moment that brought them in are counted separately. A follow is not a ticket sale.
            </p>
          </div>
          <nav className="flex gap-2 text-sm font-semibold">
            <Link href="/studio" className="rounded-full border border-line px-4 py-2">Studio</Link>
            <a href="/team/export" className="rounded-full bg-ink px-4 py-2 text-surface">Export CSV</a>
          </nav>
        </header>
        <Suspense fallback={<p className="mt-8 text-muted-foreground">Loading…</p>}>
          <Demand />
        </Suspense>
      </div>
    </div>
  );
}

async function Demand() {
  const follows = await getFollows();
  const byCity = new Map<string, { followers: number; tickets: number; moments: Map<number, number> }>();
  for (const f of follows) {
    const c = byCity.get(f.city) ?? { followers: 0, tickets: 0, moments: new Map() };
    c.followers++;
    if (f.ticketIntent) c.tickets++;
    if (f.momentT != null) c.moments.set(f.momentT, (c.moments.get(f.momentT) ?? 0) + 1);
    byCity.set(f.city, c);
  }
  const rows = [...byCity.entries()].sort((a, b) => b[1].tickets - a[1].tickets || b[1].followers - a[1].followers);
  const max = Math.max(1, ...rows.map(([, c]) => c.followers));
  const totalTickets = follows.filter((f) => f.ticketIntent).length;

  return (
    <>
      <div className="mt-8 grid grid-cols-3 gap-3">
        <Stat label="Followers" value={follows.length} />
        <Stat label="Would buy a ticket" value={totalTickets} />
        <Stat label="Cities" value={rows.length} />
      </div>
      {rows.length === 0 ? (
        <p className="mt-8 rounded-[15px] border border-dashed border-line p-6 text-muted-foreground">
          No follows yet. They appear here within a few seconds of a fan signing up on the track page.
        </p>
      ) : (
        <ol className="mt-8 space-y-2">
          {rows.map(([city, c], i) => {
            const top = [...c.moments.entries()].sort((a, b) => b[1] - a[1])[0];
            return (
              <li key={city} className="surface p-4">
                <div className="flex items-baseline gap-3">
                  <span className="w-6 font-mono text-sm text-muted-foreground">{i + 1}</span>
                  <span className="flex-1 text-lg font-bold">{city}</span>
                  <span className="text-sm"><b className="text-ink">{c.tickets}</b> <span className="text-muted-foreground">would buy</span></span>
                  <span className="text-sm"><b>{c.followers}</b> <span className="text-muted-foreground">{c.followers === 1 ? "follower" : "followers"}</span></span>
                </div>
                <div className="ml-9 mt-2 h-2 overflow-hidden rounded-full bg-sunk">
                  <div className="relative h-full rounded-full bg-ink/25" style={{ width: `${(c.followers / max) * 100}%` }}>
                    <div className="absolute inset-y-0 left-0 rounded-full bg-ink" style={{ width: `${(c.tickets / c.followers) * 100}%` }} />
                  </div>
                </div>
                {top && <p className="ml-9 mt-2 text-xs text-muted-foreground">Most came in at {fmt(top[0])}</p>}
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface p-4">
      <p className="num text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
