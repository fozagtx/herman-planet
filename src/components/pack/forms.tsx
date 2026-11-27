"use client";

import { useActionState, useEffect, useState } from "react";
import { enterGiveaway, joinWall, type PackState } from "@/app/pack-actions";

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
  if (state?.ok) return <div className="surface p-6"><p className="text-xl font-semibold tracking-tight">Howl received.</p><p className="mt-1 text-[15px] text-muted-foreground">{state.message}</p></div>;
  return (
    <form action={action} className="surface relative grid gap-4 p-6">
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

export function GiveawayForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState<PackState, FormData>(enterGiveaway, null);
  if (state?.ok) return <p role="status" className="rounded-[13px] bg-surface/10 p-4 text-[15px] font-medium text-surface">{state.message}</p>;
  const f = "min-h-11 w-full rounded-[11px] border border-white/15 bg-white/5 px-3.5 text-[15px] text-surface outline-none placeholder:text-surface/40 focus:border-white/40";
  return (
    <form action={action} className="relative grid gap-3">
      <Trap />
      <input type="hidden" name="giveawayId" value={id} />
      <div className="grid gap-3 sm:grid-cols-3">
        <input name="name" required maxLength={60} placeholder="Your name" aria-label="Your name" autoComplete="name" className={f} />
        <input name="contact" required maxLength={80} placeholder="Email or phone" aria-label="Email or phone" autoComplete="email" className={f} />
        <input name="city" maxLength={40} placeholder="City (optional)" aria-label="City" autoComplete="address-level2" className={f} />
      </div>
      <label className="flex items-start gap-2.5 text-sm text-surface/80">
        <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 accent-[#edff00]" />
        Herman&apos;s team can contact me if I win. Winners are shown by first name and city only.
      </label>
      {state && !state.ok && <p role="status" className="text-sm font-medium text-[#f6a19a]">{state.message}</p>}
      <button disabled={pending} className="press inline-flex min-h-11 items-center justify-center justify-self-start rounded-full bg-[#edff00] px-5 text-sm font-semibold text-ink hover:bg-[#edff00]/90 disabled:opacity-60">
        {pending ? "Entering" : "Enter the giveaway"}
      </button>
    </form>
  );
}

/** Live countdown to a giveaway's end, computed in the browser. */
export function Countdown({ endsAt }: { endsAt: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => { clearTimeout(first); clearInterval(id); };
  }, []);
  if (now === null) return <span className="num">Ends {new Date(endsAt).toUTCString().slice(5, 16)}</span>;
  const ms = Math.max(0, new Date(endsAt).getTime() - now);
  const d = Math.floor(ms / 86_400_000), h = Math.floor(ms / 3_600_000) % 24, m = Math.floor(ms / 60_000) % 60, s = Math.floor(ms / 1000) % 60;
  return <span className="num">{ms === 0 ? "Closed" : `${d}d ${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s left`}</span>;
}
