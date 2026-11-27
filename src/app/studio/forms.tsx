"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { SaveIsland } from "@/components/islands";
import { addTrack, saveLiveUpdate, saveTrack, signIn, type FormState } from "@/app/actions";
import type { Track } from "@/lib/types";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
export const fieldCls = "w-full min-h-11 rounded-[11px] border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-ink/40";
const labelCls = "grid gap-1.5 text-[13px] font-medium text-muted-foreground";
const btn = "press inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-medium text-surface hover:bg-ink/85 disabled:opacity-60";

function Status({ state }: { state: FormState }) {
  if (!state) return null;
  return (
    <p role="status" className={`text-sm font-medium ${state.ok ? "text-ok" : "text-alert"}`}>
      {state.message}
    </p>
  );
}

export function SignInForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(signIn, null);
  return (
    <form action={action} className="surface mx-auto mt-10 grid max-w-sm gap-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Studio sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">For Herman&apos;s team. Ask the team lead for the passcode.</p>
      </div>
      <label className={labelCls}>
        Passcode
        <input name="passcode" type="password" required autoComplete="current-password" className={fieldCls} />
      </label>
      <Status state={state} />
      <button disabled={pending} className={btn}>{pending ? "Checking" : "Sign in"}</button>
    </form>
  );
}

export function TrackForm({ track }: { track: Track }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveTrack, null);
  const link = (p: string) => track.releases.find((r) => r.platform === p)?.href ?? "";
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="slug" value={track.slug} />
      <div className="grid gap-3 sm:grid-cols-[1fr_90px_100px_100px]">
        <label className={labelCls}>Title<input name="title" required defaultValue={track.title} className={fieldCls} /></label>
        <label className={labelCls}>Year<input name="year" required inputMode="numeric" defaultValue={track.year} className={fieldCls} /></label>
        <label className={labelCls}>Length<input name="duration" required defaultValue={fmt(track.duration)} placeholder="3:26" className={fieldCls} /></label>
        <label className={labelCls}>Hook at<input name="hookAt" required defaultValue={fmt(track.hookAt)} placeholder="0:42" className={fieldCls} /></label>
      </div>
      <label className={labelCls}>
        Spotify track link
        <input name="spotify" defaultValue={track.spotifyTrackId ? `https://open.spotify.com/track/${track.spotifyTrackId}` : ""} placeholder="https://open.spotify.com/track/..." className={fieldCls} />
      </label>
      <label className={labelCls}>
        Cover image link
        <input name="artwork" type="url" defaultValue={track.artworkUrl ?? ""} placeholder="https://..." className={fieldCls} />
      </label>
      <div className="grid gap-3 sm:grid-cols-3">
        {["Spotify", "Apple Music", "YouTube"].map((p) => (
          <label key={p} className={labelCls}>
            {p} release link
            <input name={`release-${p}`} type="url" defaultValue={link(p)} placeholder="https://..." className={fieldCls} />
          </label>
        ))}
      </div>
      <label className={labelCls}>
        Credits, one per line as Role: Name
        <textarea name="credits" rows={5} defaultValue={track.credits.map((c) => `${c.role}: ${c.name}`).join("\n")} className={`${fieldCls} leading-relaxed`} />
      </label>
      <SaveIsland what="Track details" pending={pending} result={state} />
      <div className="flex flex-wrap items-center gap-3">
        <button disabled={pending} className={btn}>{pending ? "Saving" : "Save track"}</button>
        <Status state={state} />
      </div>
    </form>
  );
}

export function LiveUpdateForm({ track }: { track: Track }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveLiveUpdate, null);
  const u = track.liveUpdate;
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="slug" value={track.slug} />
      <label className={labelCls}>
        Title
        <input name="title" maxLength={80} defaultValue={u?.title ?? ""} placeholder="Accra · 20 Dec · Tickets on sale Friday" className={fieldCls} />
      </label>
      <label className={labelCls}>
        Details
        <textarea name="body" rows={3} maxLength={280} defaultValue={u?.body ?? ""} placeholder="Venue, time, where to get tickets." className={fieldCls} />
      </label>
      <label className="flex min-h-11 items-center gap-2.5 text-sm">
        <input type="checkbox" name="approved" defaultChecked={!!u?.approved} className="h-4 w-4 accent-[#1d1730]" />
        Approved: show this on the site
      </label>
      <SaveIsland what="Live update" pending={pending} result={state} />
      <div className="flex flex-wrap items-center gap-3">
        <button disabled={pending} className={btn}>{pending ? "Saving" : "Save update"}</button>
        <Status state={state} />
      </div>
    </form>
  );
}

export function NewTrackForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(addTrack, null);
  return (
    <form action={action} className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_90px_100px]">
        <label className={labelCls}>Title<input name="title" required placeholder="Song title" className={fieldCls} /></label>
        <label className={labelCls}>Year<input name="year" required inputMode="numeric" placeholder="2026" className={fieldCls} /></label>
        <label className={labelCls}>Length<input name="duration" required placeholder="3:26" className={fieldCls} /></label>
      </div>
      <label className={labelCls}>
        Spotify track link
        <input name="spotify" placeholder="https://open.spotify.com/track/..." className={fieldCls} />
      </label>
      <label className={labelCls}>
        Cover image link
        <input name="artwork" type="url" placeholder="https://..." className={fieldCls} />
      </label>
      <SaveIsland what="New track" pending={pending} result={state} done="Added" />
      <div className="flex flex-wrap items-center gap-3">
        <button disabled={pending} className={btn}>{pending ? "Adding" : "Add track"}</button>
        <Status state={state} />
      </div>
    </form>
  );
}

/** Submit button for plain server-action forms (notes): shows the save on the island. */
export function IslandSubmit({ children, className, what, done = "Saved" }: { children: React.ReactNode; className: string; what: string; done?: string }) {
  const { pending } = useFormStatus();
  return (
    <>
      <SaveIsland what={what} pending={pending} done={done} />
      <button disabled={pending} className={className}>{children}</button>
    </>
  );
}
