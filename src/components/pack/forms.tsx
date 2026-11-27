"use client";

import { useBlocked } from "@/lib/use-blocked";
import { useActionState, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { enterGiveaway, joinWall, placeOrder, type PackState } from "@/app/pack-actions";

const field = "min-h-11 w-full rounded-[11px] border border-line bg-paper px-3.5 text-[15px] outline-none focus:border-ink/40";
const label = "grid gap-1.5 text-[13px] font-medium text-muted-foreground";
const btn = "press inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-medium text-surface hover:bg-ink/85 disabled:opacity-60";

function Done({ state }: { state: PackState }) {
  if (!state) return null;
  return <p role="status" className={`text-sm font-medium ${state.ok ? "text-ok" : "text-alert"}`}>{state.message}</p>;
}

/** A hidden field bots fill and people don't. */
const Trap = () => (
  <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute left-[-9999px] h-0 w-0 opacity-0" />
);

export function WallForm({ songs }: { songs: string[] }) {
  const [state, action, pending] = useActionState<PackState, FormData>(joinWall, null);
  useBlocked(state, "wall");
  if (state?.ok) return <div className="surface p-6"><p className="text-xl font-semibold tracking-tight">Howl received.</p><p className="mt-1 text-[15px] text-muted-foreground">{state.message}</p></div>;
  return (
    <form action={action} data-flow="wall" className="surface relative grid gap-4 p-6">
      <Trap />
      <div>
        <p className="text-xl font-semibold tracking-tight">Leave your mark on the wall</p>
        <p className="mt-1 text-[15px] text-muted-foreground">Tell Herman what his music means to you. The team features notes they love.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={label}>Name or handle<input name="name" required maxLength={40} autoComplete="nickname" className={field} /></label>
        <label className={label}>City (optional)<input name="city" maxLength={40} autoComplete="address-level2" className={field} /></label>
      </div>
      <label className={label}>
        The song that got you (optional)
        <select name="song" defaultValue="" className={field}>
          <option value="">Pick a song</option>
          {songs.map((s) => <option key={s}>{s}</option>)}
        </select>
      </label>
      <label className={label}>Your note<textarea name="message" required maxLength={220} rows={3} className={`${field} py-2.5`} /></label>
      <label className="flex items-start gap-2.5 text-sm">
        <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 accent-[#1d1730]" />
        Herman&apos;s team can show my name, city and note on this site.
      </label>
      <Done state={state} />
      <button disabled={pending} className={`${btn} justify-self-start`}>{pending ? "Sending" : "Send to the wall"}</button>
    </form>
  );
}

export function GiveawayForm({ id, sample }: { id: string; sample: boolean }) {
  const [state, action, pending] = useActionState<PackState, FormData>(enterGiveaway, null);
  useBlocked(state, "giveaway");
  if (state?.ok) return <p role="status" className="rounded-[13px] bg-sunk p-4 text-[15px] font-medium">{state.message}</p>;
  return (
    <form action={action} data-flow="giveaway" className="relative grid gap-3">
      <Trap />
      <input type="hidden" name="giveawayId" value={id} />
      <div className="grid gap-3 sm:grid-cols-3">
        <input name="name" required maxLength={60} placeholder="Your name" aria-label="Your name" autoComplete="name" className={field} />
        <input name="contact" required maxLength={80} placeholder="Email or phone" aria-label="Email or phone" autoComplete="email" className={field} />
        <input name="city" maxLength={40} placeholder="City (optional)" aria-label="City" autoComplete="address-level2" className={field} />
      </div>
      <label className="flex items-start gap-2.5 text-sm text-ink/80">
        <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 accent-[#1d1730]" />
        Herman&apos;s team can contact me if I win. Winners are shown by first name and city only.
      </label>
      {sample && <p className="text-xs text-muted-foreground">Sample giveaway: entries are a test so you can see how it works.</p>}
      {state && !state.ok && <p role="status" className="text-sm font-medium text-alert">{state.message}</p>}
      <button disabled={pending} className={`${btn} justify-self-start`}>{pending ? "Entering" : "Enter the giveaway"}</button>
    </form>
  );
}

/** Live countdown to a giveaway's end, computed in the browser. "boxes" shows days, hours, minutes, seconds. */
export function Countdown({ endsAt, variant = "inline" }: { endsAt: string; variant?: "inline" | "boxes" }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => { clearTimeout(first); clearInterval(id); };
  }, []);
  const ms = now === null ? null : Math.max(0, new Date(endsAt).getTime() - now);
  const parts = ms === null ? null : [
    { v: Math.floor(ms / 86_400_000), l: "Days" },
    { v: Math.floor(ms / 3_600_000) % 24, l: "Hours" },
    { v: Math.floor(ms / 60_000) % 60, l: "Mins" },
    { v: Math.floor(ms / 1000) % 60, l: "Secs" },
  ];
  if (variant === "boxes") {
    return (
      <div className="grid grid-cols-4 gap-2" role="timer" aria-label="Time left to enter">
        {(parts ?? [{ v: 0, l: "Days" }, { v: 0, l: "Hours" }, { v: 0, l: "Mins" }, { v: 0, l: "Secs" }]).map((p) => (
          <div key={p.l} className="rounded-[13px] bg-ink px-2 py-3 text-center text-surface">
            <p className="num font-[family-name:var(--font-serif)] text-[34px] leading-none md:text-[40px]">{parts ? String(p.v).padStart(2, "0") : "··"}</p>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-surface/55">{p.l}</p>
          </div>
        ))}
      </div>
    );
  }
  if (!parts) return <span className="num">Ends {new Date(endsAt).toUTCString().slice(5, 16)}</span>;
  return <span className="num">{ms === 0 ? "Closed" : `${parts[0].v}d ${parts[1].v}h ${String(parts[2].v).padStart(2, "0")}m ${String(parts[3].v).padStart(2, "0")}s left`}</span>;
}

type BuyItem = { id: string; title: string; price: string; imageUrl: string | null; sizes: string | null; buyUrl: string | null; sample: boolean; kind: "merch" | "unreleased"; online: boolean };

/** Buy: opens an order sheet (size, quantity, details). The team confirms and sends payment details. */
export function BuyButton({ item }: { item: BuyItem }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState<PackState, FormData>(placeOrder, null);
  useBlocked(state, "buy");
  const sizes = (item.sizes ?? "").split(",").map((x) => x.trim()).filter(Boolean);
  const [pay, setPay] = useState<"bachs" | "contact">("bachs");
  useEffect(() => {
    if (state?.redirect) window.location.assign(state.redirect);
  }, [state]);
  return (
    <>
      <button type="button" onClick={() => ref.current?.showModal()} className={btn}>
        Buy · <span className="num ml-1">{item.price}</span>
      </button>
      <dialog
        ref={ref}
        aria-label={`Order ${item.title}`}
        className="m-auto w-[min(92vw,480px)] rounded-[18px] border border-line bg-surface p-0 text-ink shadow-[0_30px_80px_-30px_rgba(29,23,48,0.5)] backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && ref.current?.close()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            {item.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.imageUrl} alt="" className="h-20 w-20 shrink-0 rounded-[13px] object-cover" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold tracking-tight">{item.title}</p>
              <p className="num text-muted-foreground">{item.price}</p>
              {item.sample && <span className="mt-1 inline-block rounded-full bg-sunk px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Sample</span>}
            </div>
            <button type="button" onClick={() => ref.current?.close()} aria-label="Close" className="-m-2 flex h-11 w-11 items-center justify-center rounded-full hover:bg-sunk">
              <X className="h-4 w-4" />
            </button>
          </div>
          {state?.ok ? (
            <p role="status" className="mt-5 rounded-[13px] bg-sunk p-4 text-[15px] font-medium">{state.message}</p>
          ) : (
            <form action={action} data-flow="buy" className="relative mt-5 grid gap-3">
              <Trap />
              <input type="hidden" name="itemId" value={item.id} />
              <div className="grid grid-cols-[1fr_96px] gap-3">
                {sizes.length > 0 ? (
                  <label className={label}>
                    Size
                    <select name="size" required defaultValue="" className={field}>
                      <option value="" disabled>Pick a size</option>
                      {sizes.map((z) => <option key={z}>{z}</option>)}
                    </select>
                  </label>
                ) : <span />}
                <label className={label}>Qty<input name="quantity" type="number" min={1} max={10} defaultValue={1} className={field} /></label>
              </div>
              <label className={label}>Name<input name="name" required maxLength={60} autoComplete="name" className={field} /></label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={label}>Email or phone<input name="contact" required maxLength={80} autoComplete="email" className={field} /></label>
                <label className={label}>City<input name="city" required maxLength={40} autoComplete="address-level2" className={field} /></label>
              </div>
              <label className={label}>Note (optional)<input name="note" maxLength={200} className={field} /></label>
              <label className="flex items-start gap-2.5 text-sm">
                <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 accent-[#1d1730]" />
                Herman&apos;s team can contact me about payment and delivery.
              </label>
              {item.online && !item.sample ? (
                <fieldset className="grid gap-2">
                  <legend className="mb-1 text-[13px] font-medium text-muted-foreground">How do you want to pay?</legend>
                  <label className="flex cursor-pointer items-start gap-3 rounded-[13px] border border-line p-3 has-[:checked]:border-ink">
                    <input type="radio" name="pay" value="bachs" defaultChecked className="mt-1 h-4 w-4 accent-[#1d1730]" onChange={() => setPay("bachs")} />
                    <span><span className="block text-sm font-medium">Pay now with Bachs</span><span className="text-[13px] text-muted-foreground">Card or mobile money, on secure checkout.</span></span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-3 rounded-[13px] border border-line p-3 has-[:checked]:border-ink">
                    <input type="radio" name="pay" value="contact" className="mt-1 h-4 w-4 accent-[#1d1730]" onChange={() => setPay("contact")} />
                    <span><span className="block text-sm font-medium">Have Herman&apos;s team contact me</span><span className="text-[13px] text-muted-foreground">They confirm your order and send payment details.</span></span>
                  </label>
                </fieldset>
              ) : (
                <p className="text-xs text-muted-foreground">No payment here. Herman&apos;s team confirms your order and sends payment details.</p>
              )}
              <Done state={state} />
              <button disabled={pending} className={btn}>{pending ? "Placing order" : item.online && !item.sample && pay === "bachs" ? "Continue to payment" : "Place order"}</button>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
