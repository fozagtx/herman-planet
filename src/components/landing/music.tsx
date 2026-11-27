"use client";

import { useState } from "react";
import { DiagonalCarousel } from "@/components/ui/diagonal-carousel";
import { MusicPlayer } from "@/components/ui/music-player";
import { CATALOGUE } from "@/lib/catalogue";

/** Discography: real covers. The active cover drives the player (official Apple previews). */
export function Music() {
  const [i, setI] = useState(0);
  const [touched, setTouched] = useState(false);
  const r = CATALOGUE[i];
  const pick = (n: number) => {
    setTouched(true);
    setI(n);
  };
  return (
    <section id="music" className="bg-ink py-24 text-surface">
      <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-6 md:px-8">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-surface/55">Music</p>
          <h2 className="mt-3 font-[family-name:var(--font-serif)] text-[clamp(44px,6vw,80px)] leading-[0.95]">Every release</h2>
        </div>
        <p className="max-w-xs text-[15px] text-surface/60">Swipe through the covers. The player follows.</p>
      </div>
      <DiagonalCarousel
        className="-mt-6 h-[520px] outline-none"
        items={CATALOGUE.map((c) => ({ src: c.art, title: `${c.title} · ${c.year}` }))}
        activeIndex={i}
        onActiveIndexChange={pick}
        slideSize={270}
        labelClassName="font-medium text-surface"
        controlsClassName="border-white/10 bg-white/10 text-surface"
      />
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 pt-2">
        <MusicPlayer
          key={i}
          tracks={CATALOGUE.map((c) => ({ title: c.title, artist: `${c.artist} · ${c.from}`, src: c.preview, artwork: c.art }))}
          startIndex={i}
          autoPlay={touched}
          loop={false}
          accentColor="#edff00"
          onTrackChange={(_, n) => n !== i && setI(n)}
        />
        <div className="flex gap-4 text-[13px] text-surface/55">
          {r.spotify && <a href={r.spotify} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:text-surface hover:underline">Spotify ↗</a>}
          <a href={r.apple} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:text-surface hover:underline">Apple Music ↗</a>
          <span>Previews courtesy of Apple Music</span>
        </div>
      </div>
    </section>
  );
}
