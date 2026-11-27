"use client";

import { AuroraHero } from "@/components/ui/aurora-hero";
import { CandyLink } from "./candy-link";

export function Closing() {
  return (
    <section className="relative">
      <AuroraHero title="She Get. Out now." className="h-[70svh] min-h-[460px]" />
      <div className="absolute inset-x-0 bottom-14 flex justify-center">
        <CandyLink href="/t/she-get">Listen</CandyLink>
      </div>
    </section>
  );
}
