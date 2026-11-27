"use client";

import { MagneticSpotlightMarquee } from "@/components/ui/magnetic-spotlight-marquee";

export function Hero({ images }: { images: string[] }) {
  return (
    <MagneticSpotlightMarquee
      className="bg-paper dark:bg-paper"
      images={images}
      title={["Herman", "Suede"]}
      subtitle={["She Get", "Out now"]}
      paragraphs={[
        ["Singer and songwriter", "from Accra, Ghana."],
        ["Afrobeats and R&B,", "with Ga in the mix."],
      ]}
      navEmail="Herman Suede"
      navLinks="Music, Video, Sign up"
      footerText=""
    />
  );
}
