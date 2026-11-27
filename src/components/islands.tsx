"use client";

import { useEffect, useRef, useState } from "react";
import { Artwork } from "@/components/islandcn/artwork";
import { Glyph } from "@/components/islandcn/glyph";
import { CheckGlyph, PauseGlyph, PlayGlyph, WarningGlyph } from "@/components/islandcn/glyphs";
import { IslandRoundButton } from "@/components/islandcn/island-button";
import { BottomBar, ExpandedBottom, ExpandedSide, SensorRow } from "@/components/islandcn/island-layout";
import { Caption, CompactText, ContextLabel, ExpandedTitle, MinimalPair, NumberText, TitleStack } from "@/components/islandcn/island-text";
import { LevelMeter } from "@/components/islandcn/level-meter";
import { LinearProgress } from "@/components/islandcn/linear-progress";
import { Spinner } from "@/components/islandcn/spinner";
import { useActivity, useLatest } from "@/components/islandcn/use-activity";

// Paper & Ink accents on the black pill: the stamp yellow for progress, coral for problems.
const STAMP = "#edff00";
const OK = "#32d74b";
const PROBLEM = "#f6a19a";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(Math.max(0, s) % 60)).padStart(2, "0")}`;

type PlayingProps = {
  id: string;
  title: string;
  /** Second line: artist, or the moment you're in. */
  subtitle: string;
  art?: string | null;
  playing: boolean;
  time: number;
  duration: number;
  onToggle: () => void;
};

/**
 * Something of Herman's is playing: a preview from the site, or the song on the track page.
 * Compact shows the cover and the clock; expanded shows the title, a play/pause and the bar.
 */
export const PlayingIsland = ({ id, title, subtitle, art, playing, time, duration, onToggle }: PlayingProps) => {
  const toggle = useLatest(onToggle);
  const sec = Math.floor(time);
  const progress = duration > 0 ? Math.min(1, time / duration) : 0;
  const controls = useActivity(
    () => {
      const cover = <Artwork seed={title} src={art ?? undefined} size={22} radius={6} />;
      // Like a phone's now playing: a live meter while it plays, the clock when paused.
      const clock = playing ? (
        <LevelMeter bars={4} color={STAMP} active />
      ) : (
        <CompactText>
          <NumberText value={fmt(sec)} />
        </CompactText>
      );
      return {
        id,
        group: "music",
        label: `${title}, ${subtitle}, ${playing ? "playing" : "paused"} at ${fmt(sec)}`,
        compact: { leading: cover, trailing: clock },
        minimal: <MinimalPair leading={cover} trailing={clock} />,
        expanded: {
          leading: (
            <ExpandedSide>
              <Artwork seed={title} src={art ?? undefined} size={52} radius={14} />
            </ExpandedSide>
          ),
          center: <TitleStack title={title} subtitle={`${subtitle} · ${fmt(sec)} / ${fmt(duration)}`} />,
          trailing: (
            <ExpandedSide height={44} align="end">
              <IslandRoundButton label={playing ? "Pause" : "Play"} onPress={() => toggle.current()} size={44}>
                <Glyph icon={playing ? PauseGlyph : PlayGlyph} size={20} />
              </IslandRoundButton>
            </ExpandedSide>
          ),
          bottom: (
            <ExpandedBottom>
              <BottomBar>
                <LinearProgress value={progress} color={STAMP} label={`${fmt(sec)} of ${fmt(duration)}`} />
              </BottomBar>
            </ExpandedBottom>
          ),
        },
      };
    },
    [id, title, subtitle, art, playing, sec, duration],
  );
  // A new song opens the island to the full player for a moment, then it folds back.
  const shown = useRef<string | null>(null);
  useEffect(() => {
    if (!playing || !controls.id || shown.current === title) return;
    shown.current = title;
    controls.alert();
  }, [playing, title, controls]);
  return null;
};

type SaveState = { ok: boolean; message: string } | null;

/**
 * A Studio save: a spinner while the server writes, then a check (or what to fix) for a few seconds.
 * `pending` comes from useActionState / useFormStatus; `result` is the action's reply, if it has one.
 */
export const SaveIsland = ({ what, pending, result, done = "Saved" }: { what: string; pending: boolean; result?: SaveState; done?: string }) => {
  const [settled, setSettled] = useState<SaveState | "ok" | null>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (pending) {
      wasPending.current = true;
      return;
    }
    if (!wasPending.current) return;
    wasPending.current = false;
    // The finished state shows only after a real save; the timer clears it.
    const show = setTimeout(() => setSettled(result ?? "ok"), 0);
    const hide = setTimeout(() => setSettled(null), 3200);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [pending, result]);

  if (pending) return <SavingActivity what={what} />;
  if (settled) return <SavedActivity what={what} ok={settled === "ok" || settled.ok} message={settled === "ok" ? done : settled.message} short={done} />;
  return null;
};

const SavingActivity = ({ what }: { what: string }) => {
  useActivity(
    () => ({
      id: `save-${what}`,
      label: `Saving ${what}`,
      compact: { leading: <Spinner size={18} />, trailing: <CompactText>Saving</CompactText> },
      minimal: <Spinner size={18} />,
    }),
    [what],
  );
  return null;
};

const SavedActivity = ({ what, ok, message, short }: { what: string; ok: boolean; message: string; short: string }) => {
  useActivity(
    () => ({
      id: `save-${what}`,
      label: ok ? `${what}: ${message}` : `Couldn't save ${what}: ${message}`,
      alert: !ok,
      compact: {
        leading: <Glyph icon={ok ? CheckGlyph : WarningGlyph} color={ok ? OK : PROBLEM} />,
        trailing: <CompactText color={ok ? OK : PROBLEM}>{ok ? short : "Fix"}</CompactText>,
      },
      minimal: <Glyph icon={ok ? CheckGlyph : WarningGlyph} color={ok ? OK : PROBLEM} />,
      expanded: {
        leading: (
          <SensorRow glyph={<Glyph icon={ok ? CheckGlyph : WarningGlyph} color={ok ? OK : PROBLEM} size={18} />}>
            <ContextLabel>Studio</ContextLabel>
          </SensorRow>
        ),
        bottom: (
          <ExpandedBottom>
            <ExpandedTitle>{ok ? `${what} saved` : `Couldn't save ${what}`}</ExpandedTitle>
            <Caption>{message}</Caption>
          </ExpandedBottom>
        ),
      },
    }),
    [what, ok, message, short],
  );
  return null;
};
