"use client";

import { useEffect, useState } from "react";
import { SiApplemusic, SiSpotify } from "react-icons/si";
import { CircularGallery } from "@/components/ui/circular-gallery";
import { CATALOGUE } from "@/lib/catalogue";
import { APPLE_ARTIST, MONTHLY_LISTENERS, SPOTIFY_ARTIST, STATS_AS_OF, TOP_PLAYS, TOP_PLAYS_TOTAL } from "@/lib/stats";

const n = (x: number) => x.toLocaleString("en-US");

/** His real Spotify numbers inside a ring of his covers. */
export function Stats() {
  // Mobile first: a small ring with the numbers under it; on wider screens the numbers sit inside it.
  const [radius, setRadius] = useState(150);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setRadius(mq.matches ? 360 : 150);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return (
    <section id="streams" className="py-24">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[15px] border border-line bg-surface">
        <div className="h-[260px] md:h-[620px]">
          <CircularGallery key={radius} images={CATALOGUE.map((c) => c.art)} count={radius > 200 ? 120 : 64} radius={radius} itemWidth={radius > 200 ? 45 : 30} itemHeight={radius > 200 ? 60 : 40} showPreview={false} className="bg-none bg-surface" />
        </div>
        <div className="relative z-20 flex flex-col items-center px-6 pb-10 text-center md:pointer-events-none md:absolute md:inset-0 md:justify-center md:pb-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">On Spotify</p>
          <p className="num mt-2 font-[family-name:var(--font-serif)] text-[clamp(56px,8vw,104px)] leading-none">{n(MONTHLY_LISTENERS)}</p>
          <p className="mt-1 text-[15px] text-muted-foreground">monthly listeners</p>
          <div className="pointer-events-auto mt-6 flex flex-wrap justify-center gap-2">
            <a href={SPOTIFY_ARTIST} target="_blank" rel="noopener noreferrer"
              className="press inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-surface hover:bg-ink/85">
              <SiSpotify className="h-4 w-4" aria-hidden /> Follow on Spotify
            </a>
            <a href={APPLE_ARTIST} target="_blank" rel="noopener noreferrer"
              className="press inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-5 text-sm font-medium hover:border-ink/30">
              <SiApplemusic className="h-4 w-4" aria-hidden /> Apple Music
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-6 grid max-w-6xl grid-cols-2 gap-3 lg:grid-cols-4">
        {TOP_PLAYS.map((t) => (
          <a key={t.title} href={t.href} target="_blank" rel="noopener noreferrer" className="surface block p-5">
            <p className="num text-xl font-semibold tracking-tight md:text-2xl">{n(t.plays)}</p>
            <p className="mt-1 text-sm text-muted-foreground">plays · {t.title}</p>
          </a>
        ))}
      </div>
      <p className="mx-auto mt-3 max-w-6xl text-xs text-muted-foreground">
        <span className="num">{n(TOP_PLAYS_TOTAL)}</span> plays across his top four songs. Spotify, {STATS_AS_OF}.
      </p>
    </section>
  );
}
