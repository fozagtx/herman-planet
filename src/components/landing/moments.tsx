"use client";

import { CandyLink } from "./candy-link";
import { useState } from "react";
import { DiagonalCarousel } from "@/components/ui/diagonal-carousel";

export type Moment = { t: number; time: string; title: string; src: string; href: string };

export function Moments({ moments }: { moments: Moment[] }) {
  const [i, setI] = useState(Math.max(0, moments.findIndex((m) => m.t === 42)));
  if (moments.length === 0) {
    return (
      <p className="surface mx-auto max-w-xl p-6 text-center text-muted-foreground">
        No approved notes yet. They appear here once Herman&apos;s team approves them in the studio.
      </p>
    );
  }
  const active = moments[i];
  return (
    <div className="relative">
      <DiagonalCarousel
        className="h-[690px] outline-none"
        items={moments.map((m) => ({ src: m.src, title: `${m.time} · ${m.title}` }))}
        activeIndex={i}
        onActiveIndexChange={setI}
        slideSize={280}
        labelClassName="font-medium text-ink"
        controlsClassName="border-line bg-surface/80 text-ink"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-[76px] flex justify-center">
        <span className="pointer-events-auto"><CandyLink href={active.href}>Play from {active.time}</CandyLink></span>
      </div>
    </div>
  );
}
