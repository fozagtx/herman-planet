"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Pause, Play, X } from "lucide-react";
import { PlayingIsland } from "@/components/islands";
import { CATALOGUE, slugOf, type Release } from "@/lib/catalogue";
import { useIsland } from "@/lib/island";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(Math.max(0, s) % 60)).padStart(2, "0")}`;

/**
 * Tap the island and a music card drops down from it: Herman's songs, tap to play.
 * One site-wide player; starting it pauses any other player on the page.
 */
export function MusicDeck() {
  const island = useIsland();
  const audio = useRef<HTMLAudioElement>(null);
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState<Release | null>(null);
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState({ t: 0, d: 30 });
  const idle = island.presentation === "idle";

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  const play = (r: Release) => {
    const a = audio.current;
    if (!a) return;
    if (now?.title === r.title) {
      if (a.paused) void a.play();
      else a.pause();
      return;
    }
    // One thing plays at a time across the site.
    document.querySelectorAll("audio").forEach((el) => el !== a && el.pause());
    setNow(r);
    setPos({ t: 0, d: 30 });
    a.src = r.preview;
    void a.play().catch(() => setPlaying(false));
  };

  return (
    <>
      <audio
        ref={audio}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setPos({ t: e.currentTarget.currentTime, d: e.currentTarget.duration || 30 })}
      />
      {now && (
        <PlayingIsland id="deck" title={now.title} subtitle={`${now.artist} · preview`} art={now.art} playing={playing}
          time={pos.t} duration={pos.d} onToggle={() => play(now)} onPress={() => setOpen(true)} quiet={open} />
      )}

      {/* The idle pill has no activity to tap, so give it one: open the music card. */}
      {idle && !open && (
        <button type="button" onClick={() => setOpen(true)} aria-label="Open Herman's music"
          className="fixed left-1/2 top-[14px] z-[65] h-[37px] w-[95px] -translate-x-1/2 cursor-pointer rounded-full" />
      )}

      {open && (
        <>
          <button type="button" aria-label="Close music" onClick={() => setOpen(false)} className="fixed inset-0 z-[62] cursor-default bg-ink/20 backdrop-blur-[2px] animate-in fade-in" />
          <div role="dialog" aria-label="Herman's music"
            className="fixed left-1/2 top-[60px] z-[63] flex max-h-[calc(100svh-84px)] w-[min(94vw,420px)] -translate-x-1/2 flex-col overflow-hidden rounded-[22px] border border-line bg-surface text-ink shadow-[0_30px_80px_-30px_rgba(29,23,48,0.55)] animate-in fade-in zoom-in-95 slide-in-from-top-2 origin-top">
            <div className="flex items-center justify-between px-5 pb-2 pt-4">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Herman&apos;s music</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full hover:bg-sunk">
                <X className="h-4 w-4" />
              </button>
            </div>

            {now && (
              <div className="mx-4 mb-3 flex items-center gap-4 rounded-[16px] bg-ink p-3 text-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={now.art} alt="" className="h-16 w-16 shrink-0 rounded-[12px] object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{now.title}</p>
                  <p className="num text-xs text-surface/60">{playing ? "Playing preview" : "Paused"} · {fmt(pos.t)} / {fmt(pos.d)}</p>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/15">
                    <div className="h-full origin-left rounded-full bg-[#edff00] transition-transform duration-200 ease-linear" style={{ transform: `scaleX(${Math.min(1, pos.t / pos.d)})` }} />
                  </div>
                  <Link href={`/t/${slugOf(now.title)}`} onClick={() => setOpen(false)} className="mt-1.5 inline-flex min-h-8 items-center text-xs font-medium text-surface/80 underline-offset-4 hover:underline">
                    Open the song page →
                  </Link>
                </div>
                <button type="button" onClick={() => play(now)} aria-label={playing ? "Pause" : "Play"}
                  className="press flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#edff00] text-ink">
                  {playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 translate-x-[1px] fill-current" />}
                </button>
              </div>
            )}

            <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-3">
              {CATALOGUE.map((r) => {
                const on = now?.title === r.title;
                return (
                  <li key={r.title}>
                    <button type="button" onClick={() => play(r)} aria-label={on && playing ? `Pause ${r.title}` : `Play ${r.title}`}
                      className={`flex min-h-16 w-full items-center gap-3 rounded-[14px] px-3 py-2 text-left transition-colors hover:bg-sunk ${on ? "bg-sunk" : ""}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={r.art} alt="" loading="lazy" className="h-12 w-12 shrink-0 rounded-[10px] object-cover" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{r.title}</span>
                        <span className="block truncate text-[13px] text-muted-foreground">{r.year} · {r.from}</span>
                      </span>
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${on && playing ? "bg-ink text-[#edff00]" : "border border-line text-ink"}`} aria-hidden>
                        {on && playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 translate-x-[1px] fill-current" />}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="border-t border-line px-5 py-3 text-[11px] text-muted-foreground">30 second previews from Apple Music. Full songs on each song page.</p>
          </div>
        </>
      )}
    </>
  );
}
