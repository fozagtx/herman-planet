"use client";

import { Cards } from "@phosphor-icons/react";
import { VerseCards } from "@/components/ui/verse-cards";

const STEPS = [
  { n: "01", title: "Hear it", line: "A shared link plays from the marked moment.", bg: "bg-[#ffcf8a]" },
  { n: "02", title: "Explore", line: "Timed notes on sound, lyrics and production, with credits.", bg: "bg-[#f6a19a]" },
  { n: "03", title: "Listen in full", line: "One tap to the official release, then related tracks.", bg: "bg-[#c9b7f2]" },
  { n: "04", title: "Come back", line: "Follow for approved updates. Name your city.", bg: "bg-surface" },
];

export function Journey() {
  return (
    <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-24 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:px-8">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">How it works</p>
        <h2 className="mt-3 text-[clamp(32px,4.4vw,56px)] font-semibold leading-[0.98] tracking-[-0.04em]">
          From a 15 second clip to a fan with a city.
        </h2>
        <ol className="mt-10 divide-y divide-line border-y border-line">
          {STEPS.map((s) => (
            <li key={s.n} className="flex gap-5 py-4">
              <span className="num w-8 pt-0.5 text-sm text-muted-foreground">{s.n}</span>
              <span>
                <span className="block font-semibold">{s.title}</span>
                <span className="text-[15px] text-muted-foreground">{s.line}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
      <div className="surface h-[520px] overflow-hidden">
        <VerseCards
          className="bg-transparent dark:bg-transparent"
          navItems={[{ label: "Deal the journey", icon: <Cards size={22} weight="light" />, badge: true, isTrigger: true }]}
          cards={STEPS.map((s) => ({
            label: `${s.n}  ${s.title}`,
            className: `${s.bg} text-ink text-[22px] font-semibold tracking-[-0.03em] items-end justify-start p-5`,
          }))}
          footerText="Tap the front card to deal the next step."
        />
      </div>
    </section>
  );
}
