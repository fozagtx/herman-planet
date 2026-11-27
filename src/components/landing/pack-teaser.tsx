import Link from "next/link";
import { Reveal } from "@/components/reveal";

export function PackTeaser({ name }: { name: string }) {
  return (
    <section className="px-6 py-10 md:px-8 md:py-16">
      <Reveal className="surface mx-auto grid max-w-6xl items-center gap-6 overflow-hidden p-2 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <div className="p-5 md:p-10">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">A lone wolf and his</p>
          <h2 className="mt-3 font-[family-name:var(--font-serif)] text-[clamp(48px,7vw,96px)] leading-[0.88]">{name}</h2>
          <p className="mt-4 max-w-md text-[17px] leading-relaxed text-ink/75">
            The fan wall, giveaways, merch and unreleased music. Built one fan at a time.
          </p>
          <Link href="/pack" className="press mt-6 inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-surface hover:bg-ink/85">
            Join the pack
          </Link>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/wolf.jpg" alt="A grey wolf looking at the camera" className="aspect-[4/3] w-full rounded-[13px] object-cover object-[50%_45%] md:aspect-[4/5]" />
      </Reveal>
    </section>
  );
}
