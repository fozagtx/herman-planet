"use client";

import { Quotes } from "@phosphor-icons/react";
import { Reveal } from "@/components/reveal";
import { VerseCards } from "@/components/ui/verse-cards";
import { CATALOGUE } from "@/lib/catalogue";

const LINES = [
  { label: "Dansoman, Dansoman", className: "bg-[#f6a19a]" },
  { label: "Comment tu t'appelles, bonjour", className: "bg-[#c9b7f2]" },
  { label: "She Get", className: "bg-[#ffcf8a]" },
];

export function Lines() {
  return (
    <section className="mx-auto grid w-full max-w-6xl items-center gap-6 px-6 pb-14 md:grid-cols-2 md:gap-10 md:px-8 md:pb-24">
      <Reveal>
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Lines from She Get</p>
        <h2 className="mt-3 font-[family-name:var(--font-serif)] text-[clamp(40px,5vw,68px)] leading-[0.95]">
          A trek across Accra, in three lines.
        </h2>
        <p className="mt-5 max-w-md text-[17px] leading-relaxed text-ink/75">
          The hook is about the long ride to see someone who lives all the way in Dansoman. Open the deck and flick through.
        </p>
      </Reveal>
      <div className="surface relative h-[380px] overflow-hidden md:h-[440px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CATALOGUE[0].art} alt="" aria-hidden className="absolute inset-0 h-full w-full rounded-[15px] object-cover" />
        <div className="absolute inset-0 rounded-[15px] bg-ink/45" />
        <VerseCards
          className="relative bg-transparent dark:bg-transparent [&_[data-verse-footer]]:text-surface/80"
          navItems={[{ label: "Open the lines", icon: <Quotes size={22} weight="light" />, badge: true, isTrigger: true }]}
          cards={LINES.map((l) => ({
            label: l.label,
            className: `${l.className} text-ink font-[family-name:var(--font-serif)] text-[30px] leading-[1.05] tracking-[-0.01em] items-end justify-start p-5 text-left`,
          }))}
          footerText="Tap the front card for the next line."
        />
      </div>
    </section>
  );
}
