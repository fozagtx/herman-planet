"use client";

import { GooeyTextReveal } from "@/components/ui/gooey-text-reveal";

/** Two sentences from his own Spotify bio, revealed as you scroll. */
export function Bio() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-28 md:px-8">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">About</p>
      <GooeyTextReveal mode="scroll" stagger={0.12} duration={1}>
        <p className="mt-4 font-[family-name:var(--font-serif)] text-[clamp(34px,4.6vw,64px)] leading-[1.02]">
          Herman taught himself piano at four. He writes from what goes on around him: first love, and life&apos;s challenges.
        </p>
      </GooeyTextReveal>
    </section>
  );
}
