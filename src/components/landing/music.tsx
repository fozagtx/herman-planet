"use client";

import { useState } from "react";
import { Reveal } from "@/components/reveal";
import { DiagonalCarousel } from "@/components/ui/diagonal-carousel";
import { MusicPlayer } from "@/components/ui/music-player";
import { CATALOGUE } from "@/lib/catalogue";
import { PlayingIsland } from "@/components/islands";

type Props = {
  /** "ink" for the landing band, "paper" inside the track page. */
  tone?: "ink" | "paper";
  kicker?: string;
  heading?: string;
  /** Leave the current track out (e.g. on its own page). */
  exclude?: string;
  id?: string;
};

/** Real covers in a diagonal carousel; the active cover drives the player (official Apple previews). */
export function Music({ tone = "ink", kicker = "Music", heading = "Every release", exclude, id = "music" }: Props) {
  const list = exclude ? CATALOGUE.filter((c) => c.title !== exclude) : CATALOGUE;
  const [i, setI] = useState(0);
  const [touched, setTouched] = useState(false);
  const [pb, setPb] = useState({ playing: false, time: 0, duration: 30 });
  const [started, setStarted] = useState(false);
  const r = list[i];
  const ink = tone === "ink";
  const pick = (n: number) => {
    setTouched(true);
    setI(n);
  };
  return (
    <>
    {started && (
      <PlayingIsland id={`${id}-preview`} title={r.title} subtitle={`${r.artist} · preview`} art={r.art} playing={pb.playing} time={pb.time} duration={pb.duration}
        onToggle={() => document.querySelector<HTMLButtonElement>(`#${id} button[aria-label="Pause"], #${id} button[aria-label="Play"]`)?.click()} />
    )}
    <section id={id} className={ink ? "bg-ink py-14 text-surface md:py-24" : "border-t border-line bg-surface/50 py-12 text-ink md:py-20"}>
      <Reveal className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-3 px-6 md:px-8">
        <div>
          <p className={`text-[11px] font-medium uppercase tracking-wider ${ink ? "text-surface/55" : "text-muted-foreground"}`}>{kicker}</p>
          <h2 className="mt-3 font-[family-name:var(--font-serif)] text-[clamp(44px,6vw,80px)] leading-[0.95]">{heading}</h2>
        </div>
        <p className={`max-w-xs text-[15px] ${ink ? "text-surface/60" : "text-muted-foreground"}`}>Swipe through the covers. The player follows, and you get the story behind each one.</p>
      </Reveal>
      <DiagonalCarousel
        className={`h-[420px] outline-none md:h-[520px] ${ink ? "-mt-6" : "-mt-10 md:-mt-20"}`}
        items={list.map((c) => ({ src: c.art, title: `${c.title} · ${c.year}` }))}
        activeIndex={i}
        onActiveIndexChange={pick}
        slideSize={270}
        labelClassName={`font-medium ${ink ? "text-surface" : "text-ink"}`}
        controlsClassName={ink ? "border-white/10 bg-white/10 text-surface" : "border-line bg-surface/80 text-ink"}
      />
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 pt-2">
        <div className={ink ? "" : "rounded-xl bg-ink"}>
          <MusicPlayer
            key={i}
            tracks={list.map((c) => ({ title: c.title, artist: `${c.artist} · ${c.from}`, src: c.preview, artwork: c.art }))}
            startIndex={i}
            autoPlay={touched}
            loop={false}
            accentColor="#edff00"
            onTrackChange={(_, n) => n !== i && setI(n)}
            onPlaybackChange={(st) => { setPb(st); if (st.playing) setStarted(true); }}
          />
        </div>
        {/* What inspired it: only where a published source says so. */}
        <div key={r.title} className={`mt-2 w-full max-w-2xl rounded-[15px] border p-5 text-left animate-in fade-in ${ink ? "border-white/10 bg-white/5" : "surface"}`}>
          <p className={`text-[11px] font-medium uppercase tracking-wider ${ink ? "text-surface/55" : "text-muted-foreground"}`}>
            {r.title} · {r.year} · {r.from}
          </p>
          {r.story ? (
            <p className={`mt-2 text-[16px] leading-relaxed ${ink ? "text-surface/85" : "text-ink/80"}`}>{r.story}</p>
          ) : (
            <p className={`mt-2 text-[16px] leading-relaxed ${ink ? "text-surface/70" : "text-muted-foreground"}`}>From {r.from}, {r.year}.</p>
          )}
          <div className={`mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] ${ink ? "text-surface/60" : "text-muted-foreground"}`}>
            {r.madeBy && <span>{r.madeBy}</span>}
            {r.source && (
              <a href={r.source.url} target="_blank" rel="noopener noreferrer" className="font-medium underline-offset-4 hover:underline">
                Read more on {r.source.name} ↗
              </a>
            )}
          </div>
        </div>
        <div className={`flex gap-4 text-[13px] ${ink ? "text-surface/55" : "text-muted-foreground"}`}>
          {r.spotify && <a href={r.spotify} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">Spotify ↗</a>}
          <a href={r.apple} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">Apple Music ↗</a>
          <span>Previews courtesy of Apple Music</span>
        </div>
      </div>
    </section>
    </>
  );
}
