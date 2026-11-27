"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Stem } from "@/lib/types";

type Status = "loading" | "ready" | "error";

/**
 * Plays N stems sample-aligned with Web Audio. One stem = a normal player.
 * Seeking restarts all sources at the same offset; soloing ramps gains so
 * nothing clicks or drifts.
 */
export function useStemPlayer(stems: Stem[], duration: number) {
  const ctxRef = useRef<AudioContext | null>(null);
  const buffers = useRef<Map<string, AudioBuffer>>(new Map());
  const gains = useRef<Map<string, GainNode>>(new Map());
  const sources = useRef<AudioBufferSourceNode[]>([]);
  const anchor = useRef({ ctxTime: 0, offset: 0 });

  const [status, setStatus] = useState<Status>("loading");
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [solo, setSoloState] = useState<string[] | null>(null);
  const [peaks, setPeaks] = useState<number[]>([]);

  const stemKey = stems.map((s) => s.src).join("|");

  useEffect(() => {
    let cancelled = false;
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    const master = ctx.createGain();
    master.connect(ctx.destination);

    Promise.all(
      stems.map(async (s) => {
        const res = await fetch(s.src);
        if (!res.ok) throw new Error(`${s.src}: ${res.status}`);
        const buf = await ctx.decodeAudioData(await res.arrayBuffer());
        const g = ctx.createGain();
        g.connect(master);
        gains.current.set(s.id, g);
        buffers.current.set(s.id, buf);
        return buf;
      }),
    )
      .then((bufs) => {
        if (cancelled) return;
        setPeaks(computePeaks(bufs, 140));
        setStatus("ready");
      })
      .catch((e) => {
        console.error(e);
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      sources.current.forEach((s) => s.stop());
      sources.current = [];
      buffers.current.clear();
      gains.current.clear();
      void ctx.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stemKey]);

  const now = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || !sources.current.length) return anchor.current.offset;
    return Math.min(duration, anchor.current.offset + (ctx.currentTime - anchor.current.ctxTime));
  }, [duration]);

  const stopSources = () => {
    sources.current.forEach((s) => {
      s.onended = null;
      try {
        s.stop();
      } catch {}
    });
    sources.current = [];
  };

  const startAt = useCallback(
    async (offset: number) => {
      const ctx = ctxRef.current;
      if (!ctx || status !== "ready") return;
      await ctx.resume(); // must follow a user gesture
      stopSources();
      const when = ctx.currentTime + 0.03;
      for (const [id, buf] of buffers.current) {
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(gains.current.get(id)!);
        src.start(when, Math.min(offset, buf.duration - 0.01));
        sources.current.push(src);
      }
      sources.current[0].onended = () => {
        if (now() >= duration - 0.1) {
          stopSources();
          anchor.current = { ctxTime: 0, offset: 0 };
          setPlaying(false);
          setTime(0);
        }
      };
      anchor.current = { ctxTime: when, offset };
      setPlaying(true);
    },
    [status, now, duration],
  );

  const pause = useCallback(() => {
    const t = now();
    stopSources();
    anchor.current = { ctxTime: 0, offset: t };
    setTime(t);
    setPlaying(false);
  }, [now]);

  const toggle = useCallback(() => (playing ? pause() : startAt(anchor.current.offset)), [playing, pause, startAt]);

  const seek = useCallback(
    (t: number, play = true) => {
      const c = Math.max(0, Math.min(duration - 0.5, t));
      if (play || playing) void startAt(c);
      else {
        anchor.current = { ctxTime: 0, offset: c };
        setTime(c);
      }
    },
    [duration, playing, startAt],
  );

  const setSolo = useCallback((ids: string[] | null) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    for (const [id, g] of gains.current) {
      const target = !ids || ids.includes(id) ? 1 : 0;
      g.gain.cancelScheduledValues(ctx.currentTime);
      g.gain.setTargetAtTime(target, ctx.currentTime, 0.04);
    }
    setSoloState(ids);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setTime(now()), 100);
    return () => clearInterval(id);
  }, [playing, now]);

  return { status, playing, time, peaks, solo, toggle, seek, setSolo };
}

function computePeaks(bufs: AudioBuffer[], n: number): number[] {
  const len = Math.max(...bufs.map((b) => b.length));
  const chans = bufs.map((b) => b.getChannelData(0));
  const step = Math.floor(len / n);
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    let max = 0;
    for (let j = i * step; j < (i + 1) * step; j += 64) {
      let v = 0;
      for (const c of chans) v += Math.abs(c[j] ?? 0);
      if (v > max) max = v;
    }
    out.push(max);
  }
  const top = Math.max(...out, 0.0001);
  return out.map((v) => Math.max(0.06, v / top));
}
