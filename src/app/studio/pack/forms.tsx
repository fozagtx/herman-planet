"use client";

import { useActionState, useState } from "react";
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

type EditItem = {
  id: string; kind: "merch" | "unreleased"; title: string; description: string | null; price: string; amount: string | null; currency: string;
  imageUrl: string | null; previewUrl: string | null; buyUrl: string | null; sizes: string | null; status: "draft" | "live" | "closed";
};

/** Shrinks a photo in the browser (longest side 1600px, JPEG) before it uploads. */
async function shrink(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const canvas = Object.assign(document.createElement("canvas"), { width: Math.round(bmp.width * scale), height: Math.round(bmp.height * scale) });
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const blob: Blob = await new Promise((r) => canvas.toBlob((b) => r(b!), "image/jpeg", 0.85));
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
}

function PhotoField({ current }: { current: string | null }) {
  const [preview, setPreview] = useState<string | null>(current);
  const [busy, setBusy] = useState(false);
  return (
    <div className="grid gap-2">
      <span className="text-[13px] font-medium text-muted-foreground">Photo</span>
      <div className="flex items-center gap-4">
        <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-[13px] border border-dashed border-line bg-paper">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Photo preview" className="h-full w-full object-cover" />
          ) : (
            <span className="px-2 text-center text-[11px] text-muted-foreground">No photo yet</span>
          )}
        </div>
        <label className="press inline-flex min-h-11 cursor-pointer items-center rounded-full border border-line bg-surface px-4 text-sm font-medium hover:border-ink/30">
          {busy ? "Preparing…" : preview ? "Replace photo" : "Upload photo"}
          <input
            type="file"
            name="photo"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={async (e) => {
              const input = e.currentTarget;
              const file = input.files?.[0];
              if (!file) return;
              setBusy(true);
              const small = await shrink(file);
              const dt = new DataTransfer();
              dt.items.add(small);
              input.files = dt.files;
              setPreview(URL.createObjectURL(small));
              setBusy(false);
            }}
          />
        </label>
      </div>
      <input type="hidden" name="currentImage" value={current ?? ""} />
    </div>
  );
}

export function ItemEditor({ item }: { item?: EditItem }) {
  const [s, a, p] = useActionState<PackState, FormData>(saveShopItem, null);
  return (
    <form action={a} className="grid gap-4">
      <SaveIsland what={item ? item.title : "Shop item"} pending={p} result={s} />
      <input type="hidden" name="id" value={item?.id ?? ""} />
      <PhotoField current={item?.imageUrl ?? null} />
      <div className="grid gap-3 sm:grid-cols-[150px_1fr]">
        <label className={label}>
          Kind
          <select name="kind" className={field} defaultValue={item?.kind ?? "merch"}>
            <option value="merch">Merch</option>
            <option value="unreleased">Unreleased music</option>
          </select>
        </label>
        <label className={label}>Title<input name="title" required maxLength={80} defaultValue={item?.title} className={field} /></label>
      </div>
      <label className={label}>Description (optional)<textarea name="description" rows={2} maxLength={280} defaultValue={item?.description ?? ""} className={field} /></label>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_100px]">
        <label className={label}>Price shown<input name="price" required maxLength={30} defaultValue={item?.price} placeholder="GH₵ 250" className={field} /></label>
        <label className={label}>Amount charged with Bachs<input name="amount" inputMode="decimal" maxLength={12} defaultValue={item?.amount ?? ""} placeholder="250.00" className={field} /></label>
        <label className={label}>Currency<input name="currency" maxLength={3} defaultValue={item?.currency ?? "GHS"} className={`${field} uppercase`} /></label>
      </div>
      <label className={label}>Sizes or options (optional, comma separated)<input name="sizes" maxLength={80} defaultValue={item?.sizes ?? ""} placeholder="S, M, L, XL" className={field} /></label>
      <details className="rounded-[11px] border border-line p-3">
        <summary className="cursor-pointer text-[13px] font-medium text-muted-foreground">More options</summary>
        <div className="mt-3 grid gap-3">
          <label className={label}>Snippet audio link, for unreleased (optional)<input name="preview" type="url" defaultValue={item?.previewUrl ?? ""} placeholder="https://" className={field} /></label>
          <label className={label}>External checkout link (optional, instead of Bachs)<input name="buy" type="url" defaultValue={item?.buyUrl ?? ""} placeholder="https://" className={field} /></label>
          <label className={label}>Or a photo link instead of an upload<input name="image" type="url" placeholder="https://" className={field} /></label>
        </div>
      </details>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex min-h-11 items-center gap-2.5 text-sm"><input type="checkbox" name="live" defaultChecked={item?.status === "live"} className="h-4 w-4 accent-[#1d1730]" /> In the shop</label>
        <button disabled={p} className={btn}>{p ? "Saving" : item ? "Save changes" : "Add to shop"}</button>
      </div>
      <Status s={s} />
    </form>
  );
}
