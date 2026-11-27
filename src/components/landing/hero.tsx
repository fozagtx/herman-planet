"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, X } from "lucide-react";
import { SiSpotify } from "react-icons/si";
import { MagneticSpotlightMarquee } from "@/components/ui/magnetic-spotlight-marquee";

export type HeroItem = { src: string; title: string; preview: string; href: string };

/** Moving covers: hover pauses the strip, a tap plays that song's official preview. */
export function Hero({ items }: { items: HeroItem[] }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const now = active == null ? null : items[active];

  useEffect(() => {
    const a = audio.current;
    if (!a || !now) return;
    a.src = now.preview;
    a.play().catch(() => setPlaying(false));
  }, [now]);

  const onItem = (i: number) => {
    const a = audio.current;
    if (i === active && a) {
      if (a.paused) void a.play();
      else a.pause();
      return;
    }
    setActive(i);
  };

  return (
    <>
      <MagneticSpotlightMarquee
        className="h-[86svh] min-h-[580px] bg-paper md:h-[100svh] md:min-h-[800px] dark:bg-paper"
        images={items.map((i) => i.src)}
        itemLabels={items.map((i) => i.title)}
        onItemClick={onItem}
        activeIndex={playing ? active : null}
        title={["Herman", "Suede"]}
        subtitle={["She Get", "Out now"]}
        paragraphs={[
          ["Singer and songwriter", "from Accra, Ghana."],
          ["Afrobeats and R&B,", "with Ga in the mix."],
        ]}
        navEmail="Herman Suede"
        navLinks="Tap a cover to hear it"
        footerText=""
      />
      <audio ref={audio} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} preload="none" />
      {now && (
        <div role="status" className="fixed inset-x-3 bottom-24 z-40 mx-auto flex max-w-md items-center gap-3 rounded-full border border-line bg-surface/95 p-1.5 pr-2 shadow-[0_18px_40px_-16px_rgba(29,23,48,0.35)] backdrop-blur animate-in fade-in slide-in-from-bottom-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={now.src} alt="" className="h-10 w-10 rounded-full object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{now.title}</p>
            <p className="text-xs text-muted-foreground">{playing ? "Playing preview" : "Paused"}</p>
          </div>
          <a href={now.href} target="_blank" rel="noopener noreferrer" aria-label={`${now.title} on Spotify or Apple Music`}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink/70 hover:bg-sunk hover:text-ink">
            <SiSpotify className="h-4 w-4" />
          </a>
          <button onClick={() => onItem(active!)} aria-label={playing ? "Pause" : "Play"}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-surface hover:bg-ink/85">
            {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
          </button>
          <button onClick={() => { audio.current?.pause(); setActive(null); }} aria-label="Close player"
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink/60 hover:bg-sunk hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  );
}
