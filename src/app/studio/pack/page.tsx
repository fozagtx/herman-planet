import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { clearSamples, giveawayStatus, moderatePost, orderStatus, toggleItem } from "@/app/pack-actions";
import { isTeam } from "@/lib/auth";
import { paymentsOn } from "@/lib/bachs";
import { countSamples, getAllGiveaways, getAllItems, getAllPosts, getOrders, getPackName } from "@/lib/pack";
import { IslandSubmit, SignInForm } from "../forms";
import { DrawWinner, GiveawayEditor, ItemEditor, PackNameForm } from "./forms";

export const metadata = { title: "Studio · The Pack", robots: { index: false } };

const pill = "press inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium";
const fmtDate = (d: Date) => d.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC" }) + " UTC";

export default function StudioPack() {
  return (
    <div className="min-h-svh bg-paper px-5 pb-24 pt-6 text-ink md:pt-10">
      <div className="mx-auto max-w-3xl">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-[15px] bg-sunk" />}>
          <Body />
        </Suspense>
      </div>
    </div>
  );
}

function Panel({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <section className="surface mt-6 p-5 md:p-6">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mb-4 mt-1 text-sm text-muted-foreground">{hint}</p>
      {children}
    </section>
  );
}

async function Body() {
  if (!(await isTeam())) return <SignInForm />;
  const [name, posts, giveaways, items, orders, samples] = await Promise.all([getPackName(), getAllPosts(), getAllGiveaways(), getAllItems(), getOrders(), countSamples()]);
  const newOrders = orders.filter((o) => o.status === "new");
  const pending = posts.filter((p) => p.status === "pending");
  return (
    <>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/studio" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-ink"><ArrowLeft className="h-4 w-4" /> Studio</Link>
          <h1 className="text-[28px] font-semibold tracking-tight md:text-3xl">The Pack</h1>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">Fan wall, giveaways and the shop. Nothing shows on the site until you put it live.</p>
        </div>
        <Link href="/pack" className={`${pill} gap-1.5 border border-line bg-surface hover:border-ink/30`}>View page <ArrowUpRight className="h-3.5 w-3.5" /></Link>
      </header>

      {samples > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-[13px] border border-dashed border-line p-4">
          <p className="flex-1 text-sm text-muted-foreground">
            <b className="text-ink">{samples} sample items</b> are on the page so you can see how it works. They&apos;re tagged &ldquo;Sample&rdquo; for fans.
          </p>
          <form action={clearSamples}>
            <IslandSubmit what="Sample data" done="Removed" className={`${pill} border border-line bg-surface hover:border-ink/30`}>Remove all sample data</IslandSubmit>
          </form>
        </div>
      )}

      <Panel title={`Orders · ${newOrders.length} new`} hint={paymentsOn() ? "Items with an amount are paid online with Bachs and arrive here as Paid. Others: confirm, send payment details, then mark delivered." : "Online payment is off (no Bachs key yet). Fans order here; you confirm, send payment details, then mark delivered."}>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <ul className="space-y-3">
            {orders.map((o) => (
              <li key={o.id} className="rounded-[13px] border border-line bg-paper/60 p-4">
                <p className="font-medium">
                  {o.quantity} × {o.item}{o.size ? ` (${o.size})` : ""} <span className="num text-muted-foreground">· {o.price} each</span>
                  {o.sample && <span className="ml-2 rounded-full bg-sunk px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Sample</span>}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {o.name} · {o.contact} · {o.city}{o.note ? ` · “${o.note}”` : ""} · {fmtDate(o.createdAt)} · <b>{o.status}</b>
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {o.status === "paid" && <span className="inline-flex min-h-11 items-center rounded-full bg-ok/15 px-4 text-sm font-medium text-ok">Paid online{o.checkoutId ? ` · ${o.checkoutId.slice(0, 14)}…` : ""}</span>}
                  {(o.status === "new" ? (["confirmed", "cancelled"] as const) : o.status === "confirmed" || o.status === "paid" ? (["fulfilled", "cancelled"] as const) : ([] as const)).map((to) => (
                    <form key={to} action={orderStatus}>
                      <input type="hidden" name="id" value={o.id} />
                      <input type="hidden" name="status" value={to} />
                      <IslandSubmit what="Order" done={to === "cancelled" ? "Cancelled" : "Saved"}
                        className={`${pill} ${to === "cancelled" ? "border border-line bg-surface hover:border-ink/30" : "bg-ink text-surface hover:bg-ink/85"}`}>
                        {to === "confirmed" ? "Confirm order" : to === "fulfilled" ? "Mark delivered" : "Cancel"}
                      </IslandSubmit>
                    </form>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Name" hint="Shown as the page title and across the site.">
        <PackNameForm name={name} />
      </Panel>

      <Panel title={`Fan wall · ${pending.length} waiting`} hint="Feature a note to put it on the wall. Fans agreed to have their name, city and note shown.">
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notes yet. Share /pack with the fans to start the wall.</p>
        ) : (
          <ul className="space-y-3">
            {posts.map((p) => (
              <li key={p.id} className="rounded-[13px] border border-line bg-paper/60 p-4">
                <p className="text-[15px] leading-relaxed">“{p.message}”</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {p.name}{p.city ? `, ${p.city}` : ""}{p.song ? ` · ${p.song}` : ""} · {fmtDate(p.createdAt)} · <b>{p.status}</b>
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(p.status === "featured" ? (["hidden"] as const) : (["featured", "hidden"] as const)).filter((x) => x !== p.status).map((to) => (
                    <form key={to} action={moderatePost}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="status" value={to} />
                      <IslandSubmit what="Wall note" done={to === "featured" ? "Live" : "Hidden"}
                        className={`${pill} ${to === "featured" ? "bg-ink text-surface hover:bg-ink/85" : "border border-line bg-surface hover:border-ink/30"}`}>
                        {to === "featured" ? "Feature on the wall" : p.status === "featured" ? "Take down" : "Hide"}
                      </IslandSubmit>
                    </form>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Giveaways" hint="Open one with a prize and an end date. Entries are private to you; the site shows a winner's first name and city only.">
        {giveaways.length > 0 && (
          <ul className="mb-5 space-y-3">
            {giveaways.map((g) => (
              <li key={g.id} className="rounded-[13px] border border-line bg-paper/60 p-4">
                <p className="font-medium">{g.title} <span className="text-muted-foreground">· {g.prize}</span></p>
                <p className="mt-1 text-xs text-muted-foreground">
                  <b>{g.status}</b> · ends {fmtDate(g.endsAt)} · <span className="num">{g.entries}</span> entries{g.winner ? ` · winner shown as ${g.winner}` : ""}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {g.status !== "live" && g.status !== "closed" && (
                    <form action={giveawayStatus}><input type="hidden" name="id" value={g.id} /><input type="hidden" name="status" value="live" />
                      <IslandSubmit what="Giveaway" done="Live" className={`${pill} bg-ink text-surface hover:bg-ink/85`}>Open it</IslandSubmit></form>
                  )}
                  {g.status === "live" && (
                    <form action={giveawayStatus}><input type="hidden" name="id" value={g.id} /><input type="hidden" name="status" value="draft" />
                      <IslandSubmit what="Giveaway" className={`${pill} border border-line bg-surface hover:border-ink/30`}>Pause</IslandSubmit></form>
                  )}
                  {g.status !== "closed" && <DrawWinner id={g.id} disabled={g.entries === 0} />}
                </div>
              </li>
            ))}
          </ul>
        )}
        <details className="rounded-[13px] border border-line p-4" open={giveaways.length === 0}>
          <summary className="cursor-pointer text-sm font-medium">+ New giveaway</summary>
          <div className="mt-3"><GiveawayEditor /></div>
        </details>
      </Panel>

      <Panel title="Shop" hint="Merch and unreleased music. Payment happens on your own checkout link; this site doesn't take money.">
        {items.length > 0 && (
          <ul className="mb-5 space-y-3">
            {items.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center gap-3 rounded-[13px] border border-line bg-paper/60 p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{i.title} <span className="num text-muted-foreground">· {i.price}</span></p>
                  <p className="text-xs text-muted-foreground">{i.kind === "merch" ? "Merch" : "Unreleased music"} · <b>{i.status}</b></p>
                </div>
                <form action={toggleItem}>
                  <input type="hidden" name="id" value={i.id} />
                  <input type="hidden" name="status" value={i.status === "live" ? "draft" : "live"} />
                  <IslandSubmit what={i.title} done={i.status === "live" ? "Hidden" : "Live"}
                    className={`${pill} ${i.status === "live" ? "border border-line bg-surface hover:border-ink/30" : "bg-ink text-surface hover:bg-ink/85"}`}>
                    {i.status === "live" ? "Take out of shop" : "Put in shop"}
                  </IslandSubmit>
                </form>
              </li>
            ))}
          </ul>
        )}
        <details className="rounded-[13px] border border-line p-4" open={items.length === 0}>
          <summary className="cursor-pointer text-sm font-medium">+ New item</summary>
          <div className="mt-3"><ItemEditor /></div>
        </details>
      </Panel>
    </>
  );
}
