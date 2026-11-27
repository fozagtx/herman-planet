"use client";

import { ImageCollage } from "@/components/ui/image-collage";
import { CATALOGUE } from "@/lib/catalogue";

/** Every cover since 2018, scattered; tap and they line up oldest to newest. */
export function Since() {
  const ordered = [...CATALOGUE].sort((a, b) => Number(a.year) - Number(b.year));
  return (
    <section className="mx-auto w-full max-w-6xl overflow-hidden px-6 py-24 md:px-8">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Since 2018</p>
      <h2 className="mt-3 font-[family-name:var(--font-serif)] text-[clamp(44px,6vw,80px)] leading-[0.95]">Eight years of covers</h2>
      <ImageCollage
        className="mt-6 min-h-[360px] md:min-h-[420px]"
        containerClassName="h-auto min-h-40 max-w-full flex-wrap gap-2 md:gap-4"
        hint={<span className="text-[15px] font-normal text-muted-foreground">Tap to line them up, Pretty Mama (2018) to She Get (2026)</span>}
        imageClassName="h-[72px] w-[72px] sm:h-28 sm:w-28 md:h-40 md:w-40 aspect-square rounded-[11px] md:rounded-[13px] shadow-[0_14px_30px_-14px_rgba(29,23,48,0.5)]"
        images={ordered.map((c, i) => ({
          src: c.art,
          alt: `${c.title} (${c.year})`,
          x: Math.round((i - (ordered.length - 1) / 2) * -12 + (i % 2 ? 14 : -14)),
          y: i % 3 === 0 ? -24 : i % 3 === 1 ? 18 : -4,
          rotate: [-14, 9, -5, 12, -9, 6, -11, 4][i % 8],
        }))}
      />
    </section>
  );
}
