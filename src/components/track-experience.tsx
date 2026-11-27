"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { BadgeCheck, Headphones, Link2, Pause, Play, Volume2, X } from "lucide-react";
import { followAction, type FollowState } from "@/app/actions";
import type { Note, NoteKind, Track } from "@/lib/types";
import { useStemPlayer } from "./use-stem-player";

const KIND: Record<NoteKind, { label: string; color: string }> = {
  sound: { label: "Sound", color: "#ffcf8a" },
  lyrics: { label: "Lyrics", color: "#f6a19a" },
  production: { label: "Production", color: "#c9b7f2" },
};

export const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export function TrackExperience({ track, notes, startAt }: { track: Track; notes: Note[]; startAt: number | null }) {
  const p = useStemPlayer(track.stems, track.duration);
  const [active, setActive] = useState<Note | null>(null);
  const [autoNotes, setAutoNotes] = useState(true);
  const [started, setStarted] = useState(false);
  const [copied, setCopied] = useState(false);
  const lastT = useRef(0);
  const entry = startAt ?? track.hookAt;

  // Open a note as playback crosses its mark.
  useEffect(() => {
    const prev = lastT.current;
    lastT.current = p.time;
    if (!autoNotes || !p.playing || p.time < prev) return;
    // Only marks crossed by normal playback (not by a seek) open a note.
    const hit = notes.find((n) => n.t > prev && n.t <= p.time && p.time - n.t < 1.5);
    if (hit) setActive(hit);
  }, [p.time, p.playing, notes, autoNotes]);

  const jump = (n: Note) => {
    setStarted(true);
    setActive(n);
    lastT.current = n.t;
    p.seek(n.t);
  };

  const begin = () => {
    setStarted(true);
    lastT.current = entry;
    const here = notes.find((n) => Math.abs(n.t - entry) < 1);
    if (here) setActive(here);
    p.seek(entry);
  };

  const share = async (t: number) => {
    const url = `${location.origin}/t/${track.slug}/m/${Math.round(t)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${track.artist} · ${fmt(t)}`, url });
        return;
      } catch {}
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const pct = (t: number) => `${(t / track.duration) * 100}%`;
  const soloLabel = useMemo(
    () => (active?.layers ?? []).map((id) => track.stems.find((s) => s.id === id)?.label ?? id).join(" + "),
    [active, track.stems],
  );

  return (
    <div className="min-h-svh bg-paper text-ink">
      {/* 01 HEAR IT */}
      <section className="bg-ink px-5 pb-8 pt-6 text-surface">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.14em]">
            <span className="text-surface/70">{track.artist} · Behind the Hook</span>
            {track.placeholderMedia && <span className="rounded bg-surface/10 px-2 py-1 text-surface/70">Placeholder audio</span>}
          </div>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-tight sm:text-5xl">{track.title}</h1>
          <p className="mt-2 text-sm text-surface/60">
            {track.artist} · {track.year}
          </p>

          {/* Waveform + markers */}
          <div className="relative mt-8 select-none">
            <div className="relative h-24 cursor-pointer" onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setStarted(true);
              p.seek(((e.clientX - r.left) / r.width) * track.duration);
            }}>
              <div className="absolute inset-0 flex items-center gap-[2px]">
                {(p.peaks.length ? p.peaks : Array.from({ length: 140 }, () => 0.08)).map((v, i, a) => {
                  const played = (i + 0.5) / a.length <= p.time / track.duration;
                  return (
                    <div key={i} className="flex-1 rounded-full transition-colors"
                      style={{ height: `${v * 100}%`, background: played ? "#f7f7f5" : "rgba(247,247,245,0.2)" }} />
                  );
                })}
              </div>
              <div className="pointer-events-none absolute inset-y-0 w-[2px] bg-surface" style={{ left: pct(p.time) }} />
            </div>
            <div className="relative h-11">
              {notes.map((n) => (
                <button key={n.id} onClick={() => jump(n)} aria-label={`${fmt(n.t)} ${n.title}`}
                  className="group absolute top-0 flex h-11 w-11 -translate-x-1/2 items-start justify-center"
                  style={{ left: pct(n.t) }}>
                  <span className={`mt-1 h-4 w-4 rounded-full border-2 border-ink transition-transform group-hover:scale-125 ${active?.id === n.id ? "scale-150" : ""}`}
                    style={{ background: KIND[n.kind].color }} />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-2 flex items-center gap-4">
            {!started ? (
              <button onClick={begin} disabled={p.status !== "ready"}
                className="flex h-14 items-center gap-3 rounded-full bg-surface px-6 font-semibold text-ink disabled:opacity-50">
                <Play className="h-5 w-5 fill-current" />
                {p.status === "loading" ? "Loading…" : p.status === "error" ? "Audio unavailable" : `Play from ${fmt(entry)}`}
              </button>
            ) : (
              <button onClick={p.toggle} aria-label={p.playing ? "Pause" : "Play"}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-ink">
                {p.playing ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current" />}
              </button>
            )}
            <span className="font-mono text-sm tabular-nums text-surface/70">{fmt(p.time)} / {fmt(track.duration)}</span>
            <label className="ml-auto flex items-center gap-2 text-xs text-surface/60">
              <input type="checkbox" checked={autoNotes} onChange={(e) => setAutoNotes(e.target.checked)} className="accent-[#f7f7f5]" />
              Notes as it plays
            </label>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-2xl px-5">
        {/* 02 EXPLORE: active note */}
        {active && (
          <article className="-mt-3 surface p-5 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em]">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: KIND[active.kind].color }} />
                {KIND[active.kind].label} · {fmt(active.t)}
              </div>
              <button onClick={() => { setActive(null); p.setSolo(null); }} aria-label="Close note" className="-m-2 p-2 text-muted-foreground hover:text-black">
                <X className="h-4 w-4" />
              </button>
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">{active.title}</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">{active.body}</p>
            {active.credits.length > 0 && (
              <p className="mt-3 text-sm text-muted-foreground">{active.credits.join(" · ")}</p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {active.layers?.length ? (
                <button onClick={() => {
                  const on = p.solo?.join() === active.layers!.join();
                  p.setSolo(on ? null : active.layers!);
                  if (!p.playing) { setStarted(true); p.seek(active.t); }
                }}
                  className={`flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold ${p.solo ? "bg-ink text-surface" : "bg-[#c9b7f2]/45 text-ink"}`}>
                  {p.solo ? <Volume2 className="h-4 w-4" /> : <Headphones className="h-4 w-4" />}
                  {p.solo ? "Back to full mix" : `Hear the ${soloLabel.toLowerCase()} alone`}
                </button>
              ) : null}
              <button onClick={() => share(active.t)} className="flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm font-semibold">
                <Link2 className="h-4 w-4" /> {copied ? "Link copied" : `Share ${fmt(active.t)}`}
              </button>
            </div>
            <ApprovalStamp note={active} />
          </article>
        )}

        {/* Chapter list */}
        <section className="py-8">
          <SectionLabel n="02" label="Explore" />
          <ol className="mt-3 divide-y divide-line border-y border-line">
            {notes.map((n) => (
              <li key={n.id}>
                <button onClick={() => jump(n)} className={`flex w-full items-center gap-4 py-3.5 text-left ${active?.id === n.id ? "" : "opacity-80 hover:opacity-100"}`}>
                  <span className="w-10 font-mono text-sm tabular-nums text-muted-foreground">{fmt(n.t)}</span>
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: KIND[n.kind].color, outline: "1px solid rgba(0,0,0,.15)" }} />
                  <span className="flex-1 font-semibold">{n.title}</span>
                  <span className="text-xs text-muted-foreground">{KIND[n.kind].label}</span>
                </button>
              </li>
            ))}
          </ol>
          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {track.credits.map((c) => (
              <div key={c.role}>
                <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{c.role}</dt>
                <dd className="mt-0.5">{c.name}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* 03 LISTEN IN FULL */}
        <section className="border-t border-line py-8">
          <SectionLabel n="03" label="Listen in full" />
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {track.releases.map((r) =>
              r.href ? (
                <a key={r.platform} href={r.href} target="_blank" rel="noopener noreferrer"
                  className="flex h-12 items-center justify-center rounded-full bg-ink font-medium text-surface hover:bg-ink/85">
                  {r.platform} ↗
                </a>
              ) : (
                <span key={r.platform} title="Official link not added yet"
                  className="flex h-12 items-center justify-center rounded-full border border-dashed border-line text-sm text-muted-foreground">
                  {r.platform} · link needed
                </span>
              ),
            )}
          </div>
          <ul className="mt-5 space-y-2">
            {track.related.map((r) => {
              const href = r.slug ? `/t/${r.slug}` : r.href;
              const external = !r.slug && !!r.href;
              return (
                <li key={r.title}>
                  <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className={`surface flex items-center justify-between px-4 py-3 ${href ? "hover:border-[#b4b4ae]" : "pointer-events-none opacity-60"}`}>
                    <span>
                      <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{r.why}</span>
                      <span className="font-semibold">{r.title}</span>
                    </span>
                    <span aria-hidden>{external ? "↗" : "→"}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>

        {/* 04 COME BACK */}
        <section className="border-t border-line py-8 pb-16">
          <SectionLabel n="04" label="Come back" />
          {track.liveUpdate?.approved && (
            <div className="mt-3 surface p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-surface/70">Approved live update</p>
              <p className="mt-1 font-semibold">{track.liveUpdate.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{track.liveUpdate.body}</p>
            </div>
          )}
          <FollowForm slug={track.slug} momentT={active?.t ?? startAt} artist={track.artist} />
        </section>
      </main>
    </div>
  );
}

function ApprovalStamp({ note }: { note: Note }) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3 text-xs">
      <span className="num inline-flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-1 font-medium uppercase tracking-wider text-[#edff00]">
        <BadgeCheck className="h-3.5 w-3.5" /> Approved
      </span>
      <span className="text-muted-foreground">
        by {note.approvedBy} · {note.approvedAt}
      </span>
      {note.placeholder && <span className="ml-auto rounded-full bg-sunk px-2 py-0.5 font-medium text-muted-foreground">Demo note: needs Herman's sign-off</span>}
    </div>
  );
}

function SectionLabel({ n, label }: { n: string; label: string }) {
  return (
    <h3 className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider">
      <span className="num text-muted-foreground">{n}</span>
      {label}
    </h3>
  );
}

function FollowForm({ slug, momentT, artist }: { slug: string; momentT: number | null; artist: string }) {
  const [state, action, pending] = useActionState<FollowState, FormData>(followAction, null);
  if (state?.ok) {
    return <p className="mt-4 surface p-4 font-semibold">{state.message}</p>;
  }
  return (
    <form action={action} className="mt-4 surface space-y-3 p-5">
      <p className="text-xl font-semibold tracking-tight">Follow {artist.split(" ")[0]}. Approved updates only.</p>
      <p className="text-sm text-muted-foreground">New releases and live news, signed off by his team. No show near you? Tell us your city.</p>
      <input type="hidden" name="trackSlug" value={slug} />
      {momentT != null && <input type="hidden" name="momentT" value={Math.round(momentT)} />}
      <div className="grid gap-2 sm:grid-cols-2">
        <input name="contact" required placeholder="Email or phone" autoComplete="email"
          className="h-12 rounded-[13px] border border-line bg-sunk/60 px-4 outline-none focus:border-ink" />
        <input name="city" required placeholder="Your city" autoComplete="address-level2"
          className="h-12 rounded-[13px] border border-line bg-sunk/60 px-4 outline-none focus:border-ink" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="ticketIntent" className="h-4 w-4 accent-[#1d1730]" /> I&apos;d buy a ticket if he played my city
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="consent" required className="h-4 w-4 accent-[#1d1730]" /> Herman&apos;s team can message me about releases and shows
      </label>
      {state && !state.ok && <p className="text-sm font-semibold text-red-700">{state.message}</p>}
      <button disabled={pending} className="min-h-11 w-full rounded-full bg-ink font-medium text-surface hover:bg-ink/85 disabled:opacity-60">
        {pending ? "Saving…" : "Follow"}
      </button>
    </form>
  );
}
