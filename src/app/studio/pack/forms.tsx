"use client";

import { useActionState } from "react";
import { pickWinner, saveGiveawayAction, savePackName, saveShopItem, type PackState } from "@/app/pack-actions";
import { SaveIsland } from "@/components/islands";

const field = "w-full min-h-11 rounded-[11px] border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-ink/40";
const label = "grid gap-1.5 text-[13px] font-medium text-muted-foreground";
const btn = "press inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-medium text-surface hover:bg-ink/85 disabled:opacity-60";

const Status = ({ s }: { s: PackState }) => (s ? <p role="status" className={`text-sm font-medium ${s.ok ? "text-ok" : "text-alert"}`}>{s.message}</p> : null);

export function PackNameForm({ name }: { name: string }) {
  const [s, a, p] = useActionState<PackState, FormData>(savePackName, null);
  return (
    <form action={a} className="flex flex-wrap items-end gap-3">
      <SaveIsland what="Pack name" pending={p} result={s} />
      <label className={`${label} min-w-56 flex-1`}>What Herman calls his fans<input name="name" required maxLength={40} defaultValue={name} className={field} /></label>
      <button disabled={p} className={btn}>{p ? "Saving" : "Save name"}</button>
      <div className="w-full"><Status s={s} /></div>
    </form>
  );
}

export function GiveawayEditor() {
  const [s, a, p] = useActionState<PackState, FormData>(saveGiveawayAction, null);
  return (
    <form action={a} className="grid gap-3">
      <SaveIsland what="Giveaway" pending={p} result={s} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={label}>Title<input name="title" required maxLength={80} placeholder="She Get launch giveaway" className={field} /></label>
        <label className={label}>Prize<input name="prize" required maxLength={120} placeholder="Signed tee and a video call" className={field} /></label>
      </div>
      <label className={label}>How it works (optional)<textarea name="details" rows={2} maxLength={400} className={field} /></label>
      <div className="flex flex-wrap items-end gap-3">
        <label className={label}>Ends<input name="endsAt" type="datetime-local" required className={field} /></label>
        <label className="flex min-h-11 items-center gap-2.5 text-sm"><input type="checkbox" name="live" className="h-4 w-4 accent-[#1d1730]" /> Open it now</label>
        <button disabled={p} className={btn}>{p ? "Saving" : "Save giveaway"}</button>
      </div>
      <Status s={s} />
    </form>
  );
}

export function DrawWinner({ id, disabled }: { id: string; disabled: boolean }) {
  const [s, a, p] = useActionState<PackState, FormData>(pickWinner, null);
  return (
    <form action={a} className="flex flex-wrap items-center gap-3">
      <SaveIsland what="Winner" pending={p} result={s} done="Drawn" />
      <input type="hidden" name="id" value={id} />
      <button disabled={p || disabled} className="press inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-4 text-sm font-medium hover:border-ink/30 disabled:opacity-50">
        {p ? "Drawing" : "Draw a random winner"}
      </button>
      <Status s={s} />
    </form>
  );
}

export function ItemEditor() {
  const [s, a, p] = useActionState<PackState, FormData>(saveShopItem, null);
  return (
    <form action={a} className="grid gap-3">
      <SaveIsland what="Shop item" pending={p} result={s} />
      <div className="grid gap-3 sm:grid-cols-[150px_1fr_140px]">
        <label className={label}>
          Kind
          <select name="kind" className={field} defaultValue="merch">
            <option value="merch">Merch</option>
            <option value="unreleased">Unreleased music</option>
          </select>
        </label>
        <label className={label}>Title<input name="title" required maxLength={80} className={field} /></label>
        <label className={label}>Price shown<input name="price" required maxLength={30} placeholder="GH₵ 250" className={field} /></label>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
        <label className={label}>Amount to charge online with Bachs (optional)<input name="amount" inputMode="decimal" maxLength={12} placeholder="250.00" className={field} /></label>
        <label className={label}>Currency<input name="currency" maxLength={3} defaultValue="GHS" className={`${field} uppercase`} /></label>
      </div>
      <label className={label}>Description (optional)<textarea name="description" rows={2} maxLength={280} className={field} /></label>
      <label className={label}>Sizes or options (optional, comma separated)<input name="sizes" maxLength={80} placeholder="S, M, L, XL" className={field} /></label>
      <label className={label}>Checkout link (optional). Leave empty and fans place an order here; you confirm and send payment details.<input name="buy" type="url" placeholder="https://" className={field} /></label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={label}>Image link (optional)<input name="image" type="url" placeholder="https://" className={field} /></label>
        <label className={label}>Snippet audio link, for unreleased (optional)<input name="preview" type="url" placeholder="https://" className={field} /></label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex min-h-11 items-center gap-2.5 text-sm"><input type="checkbox" name="live" className="h-4 w-4 accent-[#1d1730]" /> Put it in the shop now</label>
        <button disabled={p} className={btn}>{p ? "Saving" : "Save item"}</button>
      </div>
      <Status s={s} />
    </form>
  );
}
