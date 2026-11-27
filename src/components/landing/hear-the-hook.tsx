"use client";

import Link from "next/link";
import { AnimatedRays } from "@/components/ui/animated-rays";
import { MusicPlayer } from "@/components/ui/music-player";

export function HearTheHook({ placeholder }: { placeholder: boolean }) {
  return (
    <AnimatedRays className="h-[88svh] min-h-[560px] bg-ink">
      <div className="flex w-full max-w-5xl flex-col items-start gap-8 px-6 md:px-8">
        <p className="text-[11px] font-medium uppercase tracking-wider text-surface/60">01 · Hear it</p>
        <h2 className="max-w-[13ch] text-[clamp(40px,5.4vw,72px)] font-semibold leading-[0.95] tracking-[-0.05em] text-surface">
          A fan taps a link.
          <br />
          The song starts at the hook.
        </h2>
        <MusicPlayer
          tracks={[{ title: "She Get · the hook", artist: "Herman Suede", src: "/audio/placeholder/hook.mp3" }]}
          avatar="/img/herman.jpg"
          loop={false}
          accentColor="#edff00"
        />
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/t/she-get/m/42"
            className="inline-flex min-h-11 items-center rounded-full bg-surface px-5 text-sm font-medium text-ink hover:bg-surface/85"
          >
            Open the full story
          </Link>
          {placeholder && <span className="text-[13px] text-surface/55">Placeholder audio until Herman&apos;s team sends the cleared track.</span>}
        </div>
      </div>
    </AnimatedRays>
  );
}
