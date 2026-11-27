"use client";

import { MagneticSpotlightMarquee } from "@/components/ui/magnetic-spotlight-marquee";

export function Hero({ images }: { images: string[] }) {
  return (
    <MagneticSpotlightMarquee
      className="bg-paper dark:bg-paper"
      images={images}
      title={["Behind", "the Hook"]}
      subtitle={["Herman Suede", "She Get, explained"]}
      paragraphs={[
        ["Start at the hook.", "Tap a moment to see", "what went into it."],
        ["Every note is approved", "by Herman's team,", "then the full release."],
      ]}
      navEmail="Herman Suede"
      navLinks="Music, videos, live shows"
      footerText="Move your cursor through the page. Scroll down to hear the hook."
    />
  );
}
