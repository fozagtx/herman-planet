"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { PlayingIsland } from "@/components/islands";
import Link from "next/link";
import { CATALOGUE, slugOf, type Release } from "@/lib/catalogue";

// Moods come only from what published sources say each song is about (see catalogue stories).
const MOODS = [
  { id: "love", short: "In love", label: "Falling for someone", line: "The pull of someone new, one step at a time.", songs: ["One by One", "ONE BY ONE II", "She Get"] },
  { id: "heartbreak", short: "Heartbreak", label: "Heartbreak", line: "When the one you fell for was never yours.", songs: ["Naa Kwarley"] },
  { id: "faith", short: "Faith", label: "Faith", line: "A prayer for good things to come.", songs: ["Kumbaya"] },
  { id: "free", short: "Feel free", label: "Feel free", line: "Freedom the way a 17-year-old saw it.", songs: ["Free"] },
  { id: "accra", short: "Accra", label: "Accra roots", line: "The songs where Ga comes through.", songs: ["She Get", "Naa Kwarley", "ONE BY ONE II"] },
] as const;

const STEP = 360 / MOODS.length;
const TEETH = 40;

/** Rotate the gear to pick a mood. Drag it, use the arrow keys, or tap a label. */
export function MoodDial() {
  const reduce = useReducedMotion();
  const dial = useRef<HTMLDivElement>(null);
  const drag = useRef<{ start: number; from: number } | null>(null);
  const [angle, setAngle] = useState(0);
  const [index, setIndex] = useState(0);
  const audio = useRef<HTMLAudioElement>(null);
  const [now, setNow] = useState<Release | null>(null);
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState({ t: 0, d: 30 });

  const mood = MOODS[index];
  const songs = mood.songs.map((t) => CATALOGUE.find((c) => c.title === t)).filter(Boolean) as Release[];

  const snapTo = (i: number, turnFrom = angle) => {
    const n = ((i % MOODS.length) + MOODS.length) % MOODS.length;
    // Turn the shortest way to the chosen notch.
    const target = -n * STEP;
    let delta = (((target - turnFrom) % 360) + 540) % 360 - 180;
    if (Math.abs(delta) < 0.01) delta = 0;
    setAngle(turnFrom + delta);
    setIndex(n);
  };

  const pointerAngle = (e: React.PointerEvent) => {
    const r = dial.current!.getBoundingClientRect();
    return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
  };

  const play = (r: Release) => {
    const a = audio.current;
    if (!a) return;
    if (now?.title === r.title) {
      if (a.paused) void a.play();
      else a.pause();
      return;
    }
    setNow(r);
    a.src = r.preview;
    setPos({ t: 0, d: 30 });
    void a.play().catch(() => setPlaying(false));
  };

  return (
    <section id="moods" className="mx-auto grid w-full max-w-6xl items-center gap-8 overflow-hidden px-6 py-14 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-14 md:px-8 md:py-24">
      {now && (
        <PlayingIsland id="mood-preview" title={now.title} subtitle={`${mood.label} · preview`} art={now.art} playing={playing} time={pos.t} duration={pos.d} onToggle={() => play(now)} />
      )}
      <audio
        ref={audio}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setPos({ t: e.currentTarget.currentTime, d: e.currentTarget.duration || 30 })}
      />

      {/* The gear */}
      <div className="relative mx-auto aspect-square w-full max-w-[360px] select-none">
        <motion.div
          ref={dial}
          role="slider"
          tabIndex={0}
          aria-label="Mood"
          aria-valuemin={0}
          aria-valuemax={MOODS.length - 1}
          aria-valuenow={index}
          aria-valuetext={mood.label}
          className="absolute inset-0 cursor-grab touch-none rounded-full active:cursor-grabbing"
          animate={{ rotate: angle }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 18 }}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); snapTo(index + 1); }
            if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); snapTo(index - 1); }
          }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            drag.current = { start: pointerAngle(e), from: angle };
          }}
          onPointerMove={(e) => {
            if (!drag.current) return;
            setAngle(drag.current.from + (pointerAngle(e) - drag.current.start));
          }}
          onPointerUp={() => {
            if (!drag.current) return;
            drag.current = null;
            // Snap to the notch the gear came to rest nearest.
            snapTo(Math.round(-angle / STEP), angle);
          }}
        >
          <svg viewBox="0 0 200 200" className="h-full w-full drop-shadow-[0_18px_30px_rgba(29,23,48,0.25)]" aria-hidden>
            {/* Teeth */}
            {Array.from({ length: TEETH }, (_, i) => (
              <rect key={i} x="96.5" y="2" width="7" height="12" rx="2" fill="#1d1730" transform={`rotate(${(i * 360) / TEETH} 100 100)`} />
            ))}
            <circle cx="100" cy="100" r="88" fill="#1d1730" />
            <circle cx="100" cy="100" r="80" fill="none" stroke="#f7f7f5" strokeOpacity="0.12" />
            {/* Mood labels ride on the gear */}
            {MOODS.map((m, i) => {
              const a = (i * STEP * Math.PI) / 180 - Math.PI / 2;
              const x = 100 + Math.cos(a) * 62;
              const y = 100 + Math.sin(a) * 62;
              return (
                <g key={m.id} transform={`rotate(${i * STEP} ${x} ${y})`}>
                  <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="8.5" fontWeight="600"
                    fill={i === index ? "#edff00" : "#f7f7f5"} fillOpacity={i === index ? 1 : 0.55} style={{ letterSpacing: "0.02em" }}>
                    {m.short}
                  </text>
                </g>
              );
            })}
            <circle cx="100" cy="100" r="26" fill="#f7f7f5" />
            <circle cx="100" cy="100" r="5" fill="#1d1730" />
          </svg>
        </motion.div>
        {/* Fixed pointer at the top */}
        <div className="pointer-events-none absolute left-1/2 top-[-6px] h-0 w-0 -translate-x-1/2 border-x-[9px] border-t-[14px] border-x-transparent border-t-[#edff00] drop-shadow" />
      </div>

      {/* The songs for that mood */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Pick a mood</p>
        <h2 className="mt-3 font-[family-name:var(--font-serif)] text-[clamp(40px,5.4vw,72px)] leading-[0.95]">{mood.label}</h2>
        <p className="mt-3 max-w-md text-[17px] leading-relaxed text-ink/75">{mood.line}</p>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Moods">
          {MOODS.map((m, i) => (
            <button key={m.id} type="button" onClick={() => snapTo(i)} aria-pressed={i === index}
              className={`press inline-flex min-h-10 items-center rounded-full px-3.5 text-[13px] font-medium ${i === index ? "bg-ink text-surface" : "border border-line bg-surface hover:border-ink/30"}`}>
              {m.label}
            </button>
          ))}
        </div>
        <ul className="mt-6 space-y-2">
          {songs.map((r) => {
            const on = now?.title === r.title && playing;
            return (
              <li key={`${mood.id}-${r.title}`} className="surface flex items-center gap-4 p-3 animate-in fade-in slide-in-from-bottom-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.art} alt="" className="h-14 w-14 shrink-0 rounded-[11px] object-cover" />
                <div className="min-w-0 flex-1">
                  <Link href={`/t/${slugOf(r.title)}`} className="block truncate font-medium underline-offset-4 hover:underline">
                    {r.title} <span className="text-muted-foreground">· {r.year}</span>
                  </Link>
                  <p className="line-clamp-2 text-[13px] text-muted-foreground">{r.story}</p>
                </div>
                <button type="button" onClick={() => play(r)} aria-label={on ? `Pause ${r.title}` : `Play ${r.title} preview`}
                  className="press flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-surface hover:bg-ink/85">
                  {on ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 translate-x-[1px] fill-current" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
