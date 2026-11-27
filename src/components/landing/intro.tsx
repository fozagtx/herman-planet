"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const KEY = "hp-intro-seen";
const WORDS = ["Herman", "Planet"];

/**
 * "Welcome to Herman Planet": a first-visit brand moment.
 * Herman's face pops up as a planet, the name rises around it, the planet
 * grows to fill the screen and the whole layer wipes up into the live page.
 * Rules: homepage only, once per session, about 2s, tap or Enter skips,
 * no motion for reduced-motion visitors (the inline script hides it before paint).
 */
export function Intro() {
  const root = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    // Skipped visits: CSS already hides the layer (display: none), nothing to run.
    if (html.classList.contains("intro-skip")) return;
    const el = root.current!;
    html.classList.add("intro-on");
    const finish = () => {
      try { sessionStorage.setItem(KEY, "1"); } catch {}
      html.classList.remove("intro-on");
      setGone(true);
    };
    const q = gsap.utils.selector(el);
    const t = gsap.timeline({ defaults: { ease: "power3.out" }, onComplete: finish });
    t.fromTo(q(".intro-planet"), { clipPath: "circle(0% at 50% 42%)", scale: 0.42 }, { clipPath: "circle(34% at 50% 42%)", scale: 0.46, duration: 0.6, ease: "back.out(1.6)" })
      .fromTo(q(".intro-kicker"), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, 0.25)
      .fromTo(q(".intro-char"), { yPercent: 110, y: 0 }, { yPercent: 0, y: 0, duration: 0.55, stagger: 0.03 }, 0.3)
      .to(q(".intro-planet"), { clipPath: "circle(80% at 50% 42%)", scale: 1, duration: 0.7, ease: "power2.inOut" }, 1.15)
      .to(q(".intro-copy"), { opacity: 0, y: -12, duration: 0.3, ease: "power2.in" }, 1.25)
      .to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.7, ease: "power4.inOut" }, 1.6);
    tl.current = t;
    const skip = (e: KeyboardEvent) => (e.key === "Enter" || e.key === "Escape") && t.progress(1);
    window.addEventListener("keydown", skip);
    return () => {
      window.removeEventListener("keydown", skip);
      t.kill();
      html.classList.remove("intro-on");
    };
  }, []);

  if (gone) return null;
  return (
    <>
      {/* Runs before paint: repeat visits and reduced motion never see the intro. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(sessionStorage.getItem("${KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("intro-skip")}catch(e){document.documentElement.classList.add("intro-skip")}`,
        }}
      />
      <div
        ref={root}
        className="intro fixed inset-0 z-[100] grid cursor-pointer place-items-center overflow-hidden bg-ink text-surface"
        style={{ clipPath: "inset(0% 0% 0% 0%)" }}
        onClick={() => tl.current?.progress(1)}
        role="dialog"
        aria-label="Welcome to Herman Planet"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/herman.jpg" alt="" className="intro-planet absolute inset-0 h-full w-full object-cover object-[50%_30%]" style={{ clipPath: "circle(0% at 50% 42%)" }} />
        <div className="intro-copy pointer-events-none relative z-10 text-center mix-blend-difference">
          <p className="intro-kicker text-[11px] font-medium uppercase tracking-[0.3em] opacity-0">Welcome to</p>
          <h1 className="mt-3 font-[family-name:var(--font-serif)] text-[clamp(56px,13vw,180px)] leading-[0.88]">
            {WORDS.map((w) => (
              <span key={w} className="block overflow-hidden">
                <span className="inline-block">
                  {w.split("").map((c, i) => (
                    <span key={i} className="intro-char inline-block" style={{ transform: "translateY(110%)" }}>
                      {c}
                    </span>
                  ))}
                </span>
              </span>
            ))}
          </h1>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); tl.current?.progress(1); }}
          className="absolute bottom-6 right-6 z-20 inline-flex min-h-11 items-center rounded-full border border-white/20 px-4 text-sm font-medium text-surface/80 hover:text-surface"
        >
          Enter
        </button>
      </div>
    </>
  );
}
