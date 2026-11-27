"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Glyph } from "@/components/islandcn/glyph";
import { SparkleGlyph } from "@/components/islandcn/glyphs";
import { IslandButton } from "@/components/islandcn/island-button";
import { BottomBar, ExpandedBottom, SensorRow } from "@/components/islandcn/island-layout";
import { Caption, CompactText, ContextLabel } from "@/components/islandcn/island-text";
import { useActivity, useLatest } from "@/components/islandcn/use-activity";
import { startMoodReader, type MoodReading } from "@/lib/mood";

type Help = { hint: string; href: string | null; label: string | null; inFlow?: boolean };

const PEACH = "#ffcf8a";
const GAP_MS = 45_000; // browsing: at most one tip every 45 seconds
const FLOW_GAP_MS = 12_000; // buying or booking: help sooner, the fan is mid-task
const MAX_PER_VISIT = 3; // browsing tips per visit; flow tips don't count
const SHOW_MS = 9_000;
const FLOW_SHOW_MS = 14_000;

/** Watches for someone struggling and offers one line of help in the island. */
export function MoodHelp() {
  const [help, setHelp] = useState<Help | null>(null);
  const state = useRef({ last: 0, count: 0, busy: false });

  useEffect(() => {
    return startMoodReader(async (r: MoodReading) => {
      const s = state.current;
      // Studio is the team's tool; tips are for fans.
      const inFlow = !!r.flow;
      if (location.pathname.startsWith("/studio") || s.busy) return;
      if (inFlow ? Date.now() - s.last < FLOW_GAP_MS : s.count >= MAX_PER_VISIT || Date.now() - s.last < GAP_MS) return;
      s.busy = true;
      try {
        const res = await fetch("/api/help", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...r, path: location.pathname }),
        });
        if (!res.ok) return;
        const h: Help = await res.json();
        if (!h.hint) return;
        s.last = Date.now();
        if (!inFlow) s.count++;
        setHelp({ ...h, inFlow });
      } catch {
        // No tip is better than a broken one.
      } finally {
        s.busy = false;
      }
    });
  }, []);

  useEffect(() => {
    if (!help) return;
    const t = setTimeout(() => setHelp(null), help.inFlow ? FLOW_SHOW_MS : SHOW_MS);
    return () => clearTimeout(t);
  }, [help]);

  if (!help) return null;
  // An open sheet (buy, tickets) sits above the island, so the tip goes inside the sheet.
  const sheet = typeof document !== "undefined" ? document.querySelector<HTMLDialogElement>("dialog[open]") : null;
  if (sheet) return createPortal(<SheetTip help={help} onDone={() => setHelp(null)} />, sheet);
  return <HelpActivity help={help} onDone={() => setHelp(null)} />;
}

function SheetTip({ help, onDone }: { help: Help; onDone: () => void }) {
  return (
    <div role="status" className="sticky bottom-0 mx-3 mb-3 flex items-start gap-3 rounded-[13px] bg-ink p-3.5 text-surface shadow-[0_12px_30px_-12px_rgba(29,23,48,0.6)] motion-safe:animate-[tip-in_.35s_cubic-bezier(.22,1,.36,1)_both]">
      <span aria-hidden className="mt-0.5 text-[#ffcf8a]">✦</span>
      <p className="min-w-0 flex-1 text-[14px] leading-snug">{help.hint}</p>
      <button type="button" onClick={onDone} className="-my-1 shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium text-[#ffcf8a] hover:bg-white/10">Got it</button>
    </div>
  );
}

function HelpActivity({ help, onDone }: { help: Help; onDone: () => void }) {
  const router = useRouter();
  const done = useLatest(onDone);
  const go = useLatest(() => {
    if (help.href) router.push(help.href);
    onDone();
  });
  const controls = useActivity(
    () => {
      const sparkle = <Glyph icon={SparkleGlyph} color={PEACH} />;
      return {
        id: "help",
        label: `Tip: ${help.hint.replace(/\.$/, "")}`,
        onPress: () => go.current(),
        compact: { leading: sparkle, trailing: <CompactText color={PEACH}>Tip</CompactText> },
        minimal: sparkle,
        expanded: {
          leading: (
            <SensorRow glyph={<Glyph icon={SparkleGlyph} color={PEACH} size={18} />}>
              <ContextLabel>A quick tip</ContextLabel>
            </SensorRow>
          ),
          bottom: (
            <ExpandedBottom>
              <Caption style={{ fontSize: 17, lineHeight: 1.3, color: "#fff" }}>{help.hint}</Caption>
              <BottomBar>
                {help.href ? (
                  <IslandButton onPress={() => go.current()} tone={{ kind: "accent", color: PEACH }}>{help.label ?? "Take me there"}</IslandButton>
                ) : (
                  <IslandButton onPress={() => done.current()}>Got it</IslandButton>
                )}
              </BottomBar>
            </ExpandedBottom>
          ),
        },
      };
    },
    [help.hint, help.href, help.label],
  );
  useEffect(() => {
    controls.alert();
  }, [controls]);
  return null;
}
