"use client";

import { GlowBorderCard } from "@/components/ui/glow-border-card";

/** The new single's cover, edged in the three note colours. */
export function ReleaseCover({ src, alt }: { src: string; alt: string }) {
  return (
    <GlowBorderCard
      width="100%"
      aspectRatio="1"
      borderRadius="18px"
      animationDuration={9}
      borderWidth="0.6em"
      blurAmount="1.1em"
      inset="-0.35em"
      gradientColors={["#ffcf8a", "#f6a19a", "#c9b7f2", "#ffcf8a", "#f6a19a", "#c9b7f2", "#ffcf8a", "#f6a19a", "#c9b7f2", "#ffcf8a"]}
      className="bg-surface/60 [&>div:last-child]:p-2"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="aspect-square w-full rounded-[13px] object-cover" />
    </GlowBorderCard>
  );
}
