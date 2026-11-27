import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { Wolf } from "@/components/pack/wolf";

export function PackTeaser({ name }: { name: string }) {
  return (
    <section className="px-6 py-10 md:px-8 md:py-16">
      <Reveal className="relative mx-auto grid max-w-6xl items-center gap-6 overflow-hidden rounded-[15px] bg-ink p-6 text-surface md:grid-cols-[minmax(0,1fr)_260px] md:p-10">
        <div className="relative z-10">
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#edff00]">A lone wolf and his</p>
          <h2 className="mt-3 font-[family-name:var(--font-serif)] text-[clamp(48px,7vw,96px)] leading-[0.88]">{name}</h2>
          <p className="mt-4 max-w-md text-[17px] leading-relaxed text-surface/75">
            The fan wall, giveaways, merch and unreleased music. Built one fan at a time.
          </p>
          <Link href="/pack" className="press mt-6 inline-flex min-h-11 items-center rounded-full bg-[#edff00] px-5 text-sm font-semibold text-ink">
            Join the pack
          </Link>
        </div>
        <Wolf className="mx-auto h-44 w-44 md:h-64 md:w-64" />
      </Reveal>
    </section>
  );
}
