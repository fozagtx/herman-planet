"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { ArrowLeft, BadgeCheck, Headphones, Pause, Play, Volume2 } from "lucide-react";
import { PlatformIcon } from "@/lib/platforms";
import { ShareSheet } from "@/components/ui/share-sheet";
import { Follow } from "./follow";
import { Music } from "./landing/music";
import type { Note, NoteKind, Track } from "@/lib/types";
import { useSpotifyPlayer } from "./use-spotify-player";
import { useStemPlayer } from "./use-stem-player";

const KIND: Record<NoteKind, { label: string; color: string }> = {
  sound: { label: "Sound", color: "#ffcf8a" },
  lyrics: { label: "Lyrics", color: "#f6a19a" },
  production: { label: "Production", color: "#c9b7f2" },
};

export const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

type Player = {
  status: "loading" | "ready" | "error";
  playing: boolean;
  time: number;
  duration: number;
  toggle: () => void;
  seek: (t: number) => void;
  solo?: string[] | null;
  setSolo?: (ids: string[] | null) => void;
  embed?: ReactNode;
  previewNote?: string;
};

type Props = { track: Track; notes: Note[]; startAt: number | null };

export function TrackExperience(props: Props) {
  return props.track.spotifyTrackId ? <SpotifyTrack {...props} id={props.track.spotifyTrackId} /> : <StemTrack {...props} />;
}

function SpotifyTrack(props: Props & { id: string }) {
  const { host, status, playing, time, duration, preview, seek, toggle } = useSpotifyPlayer(props.id, props.track.duration);
  const embed = <div ref={host as RefObject<HTMLDivElement>} className="min-h-20 overflow-hidden rounded-[13px] bg-sunk" />;
  return (
    <TrackView
      {...props}
      player={{
        status, playing, time, duration, seek, toggle, embed,
        previewNote: preview
          ? "Spotify is playing its 30 second preview. Sign in to Spotify in this browser to hear the full song from any moment."
          : "Plays through Spotify. Signed in, you hear the full song.",
      }}
    />
  );
}

function StemTrack(props: Props) {
  const p = useStemPlayer(props.track.stems, props.track.duration);
  return <TrackView {...props} player={{ ...p, duration: props.track.duration }} />;
}

function TrackView({ track, notes, startAt, player: p }: Props & { player: Player }) {
  const [active, setActive] = useState<Note | null>(() => notes.find((n) => n.t === startAt) ?? null);
  const [autoNotes, setAutoNotes] = useState(true);
  const [started, setStarted] = useState(false);
  const lastT = useRef(0);
  const entry = startAt ?? track.hookAt;

  // Open a moment when normal playback crosses its mark (not when seeking past it).
  useEffect(() => {
    const prev = lastT.current;
    lastT.current = p.time;
    if (!autoNotes || !p.playing || p.time < prev) return;
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

  const pct = (t: number) => `${Math.min(100, (t / p.duration) * 100)}%`;
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  return (
    <div className="min-h-svh bg-paper text-ink">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 md:px-8 md:py-5">
        <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-ink/70 hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> {track.artist}
        </Link>
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Behind the Hook</span>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-5 pb-20 md:grid-cols-[minmax(0,360px)_minmax(0,1fr)] md:gap-14 md:px-8">
        {/* Left: the record */}
        <aside className="self-start md:sticky md:top-6">
          {/* Mobile first: small cover beside the title; full cover from md up. */}
          <div className="flex items-end gap-4 md:block">
            <div className="surface w-28 shrink-0 overflow-hidden p-1.5 md:w-full md:p-2">
              {track.artworkUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={track.artworkUrl} alt={`${track.title} cover art`} className="aspect-square w-full rounded-[11px] object-cover md:rounded-[13px]" />
              ) : (
                <div className="aspect-square w-full rounded-[13px] bg-sunk" />
              )}
            </div>
            <div className="min-w-0 pb-1 md:pb-0">
              <h1 className="text-[34px] font-semibold leading-none tracking-[-0.04em] md:mt-6 md:text-[44px]">{track.title}</h1>
              <p className="mt-2 text-[14px] text-muted-foreground md:text-[15px]">
                {track.artist} · {track.year} · <span className="num">{fmt(p.duration)}</span>
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            {!started ? (
              <button onClick={begin} disabled={p.status !== "ready"}
                className="press inline-flex min-h-12 items-center gap-2.5 rounded-full bg-ink px-6 text-[15px] font-medium text-surface hover:bg-ink/85 disabled:opacity-50">
                <Play className="h-4 w-4 fill-current" />
                {p.status === "loading" ? "Loading player" : p.status === "error" ? "Player unavailable" : `Play from ${fmt(entry)}`}
              </button>
            ) : (
              <button onClick={p.toggle} aria-label={p.playing ? "Pause" : "Play"}
                className="press flex h-12 w-12 items-center justify-center rounded-full bg-ink text-surface hover:bg-ink/85">
                {p.playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
              </button>
            )}
            {started && <span className="num text-sm text-muted-foreground">{fmt(p.time)} / {fmt(p.duration)}</span>}
          </div>

          {p.embed && <div className="mt-5">{p.embed}</div>}
          {p.status === "error" ? (
            <p className="mt-2 text-xs text-alert">The Spotify player didn&apos;t load. Use the Spotify button below to listen.</p>
          ) : (
            p.previewNote && <p className="mt-2 text-xs text-muted-foreground">{p.previewNote}</p>
          )}

          <div className="mt-6 grid grid-cols-3 gap-2">
            {track.releases.filter((r) => r.href).map((r) => (
              <a key={r.platform} href={r.href!} target="_blank" rel="noopener noreferrer"
                className="press inline-flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-surface px-2 text-[13px] font-medium hover:border-ink/30">
                <PlatformIcon name={r.platform} /> {r.platform}
              </a>
            ))}
          </div>
        </aside>

        {/* Right: inside the song */}
        <main className="min-w-0">
          <section>
            <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between md:gap-4">
              <h2 className="text-[24px] font-semibold tracking-tight md:text-[28px]">Inside the song</h2>
              <label className="flex min-h-11 items-center gap-2 text-[13px] text-muted-foreground">
                <input type="checkbox" checked={autoNotes} onChange={(e) => setAutoNotes(e.target.checked)} className="h-4 w-4 accent-[#1d1730]" />
                Open moments as it plays
              </label>
            </div>

            {/* Timeline */}
            <div className="relative mt-3 md:mt-6 md:pt-7">
              <div className="relative h-11">
                {notes.map((n) => (
                  <button key={n.id} onClick={() => jump(n)} aria-label={`Jump to ${fmt(n.t)}: ${n.title}`}
                    className="group absolute bottom-0 flex h-11 w-11 -translate-x-1/2 items-end justify-center pb-1" style={{ left: pct(n.t) }}>
                    <span className={`block rounded-full ring-2 ring-paper transition-[width,height] duration-150 ${active?.id === n.id ? "h-4 w-4" : "h-3 w-3 group-hover:h-4 group-hover:w-4"}`}
                      style={{ background: KIND[n.kind].color }} />
                  </button>
                ))}
              </div>
              <div role="slider" aria-label="Seek" aria-valuemin={0} aria-valuemax={Math.round(p.duration)} aria-valuenow={Math.round(p.time)}
                aria-valuetext={`${fmt(p.time)} of ${fmt(p.duration)}`} tabIndex={0}
                className="-my-3 cursor-pointer py-3"
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight") { setStarted(true); p.seek(Math.min(p.duration, p.time + 5)); }
                  if (e.key === "ArrowLeft") { setStarted(true); p.seek(Math.max(0, p.time - 5)); }
                }}
                onClick={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  setStarted(true);
                  p.seek(((e.clientX - r.left) / r.width) * p.duration);
                }}>
                <div className="relative h-1.5 rounded-full bg-sunk">
                  <div className="absolute inset-y-0 left-0 rounded-full bg-ink transition-[width] duration-150" style={{ width: pct(p.time) }} />
                </div>
              </div>
              <div className="num mt-2 flex justify-between text-xs text-muted-foreground">
                <span>{fmt(p.time)}</span>
                <span>{fmt(p.duration)}</span>
              </div>
            </div>

            {/* Moments */}
            <ol className="mt-6 space-y-2">
              {notes.map((n) => {
                const open = active?.id === n.id;
                const soloOn = !!p.solo && p.solo.join() === (n.layers ?? []).join();
                return (
                  <li key={n.id} className={`rounded-[15px] border transition-colors ${open ? "surface" : "border-transparent hover:bg-surface/60"}`}>
                    <button onClick={() => jump(n)} className="flex min-h-14 w-full items-center gap-4 px-4 text-left">
                      <span className="num w-11 text-sm text-muted-foreground">{fmt(n.t)}</span>
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: KIND[n.kind].color }} />
                      <span className="flex-1 text-[16px] font-medium">{n.title}</span>
                      <span className="text-xs text-muted-foreground">{KIND[n.kind].label}</span>
                    </button>
                    {open && (
                      <div className="px-4 pb-4 animate-in fade-in md:pl-[5.25rem]">
                        <p className="max-w-prose text-[15px] leading-relaxed text-ink/80">{n.body}</p>
                        {n.credits.length > 0 && <p className="mt-2 text-[13px] text-muted-foreground">{n.credits.join(" · ")}</p>}
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          {n.layers?.length && p.setSolo ? (
                            <button onClick={() => p.setSolo!(soloOn ? null : n.layers!)}
                              className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-medium ${soloOn ? "bg-ink text-surface" : "border border-line bg-surface"}`}>
                              {soloOn ? <Volume2 className="h-4 w-4" /> : <Headphones className="h-4 w-4" />}
                              {soloOn ? "Back to full mix" : "Hear this layer alone"}
                            </button>
                          ) : null}
                          <ShareSheet url={`${base}/t/${track.slug}/m/${n.t}`} title={`Share ${track.title} at ${fmt(n.t)}`} theme="light" variant="compact" />
                          <Provenance note={n} />
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>

          <section className="mt-14 border-t border-line pt-8">
            <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Credits</h3>
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-5">
              {track.credits.map((c) => (
                <div key={c.role}>
                  <dt className="text-[13px] text-muted-foreground">{c.role}</dt>
                  <dd className="mt-0.5 text-[15px] font-medium">{c.name}</dd>
                </div>
              ))}
            </dl>
          </section>


        </main>
      </div>

      <Music tone="paper" id="more" kicker="Keep listening" heading={`More from ${track.artist.split(" ")[0]}`} exclude={track.title} />
      <Follow liveUpdate={track.liveUpdate} />
    </div>
  );
}

function Provenance({ note }: { note: Note }) {
  if (note.placeholder) {
    return <span className="ml-auto text-xs text-muted-foreground">From the release coverage</span>;
  }
  return (
    <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-[#edff00]">
      <BadgeCheck className="h-3.5 w-3.5" /> Approved by {note.approvedBy}
    </span>
  );
}
