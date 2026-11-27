"use client";

import { CandyLink } from "./candy-link";
import { AuroraHero } from "@/components/ui/aurora-hero";

export function Closing() {
  return (
    <section className="relative">
      <AuroraHero title="Hear it. Come back." className="h-[70svh] min-h-[460px]" />
      <div className="absolute inset-x-0 bottom-14 flex justify-center">
        <CandyLink href="/t/she-get/m/42">Play from the hook</CandyLink>
      </div>
    </section>
  );
}
