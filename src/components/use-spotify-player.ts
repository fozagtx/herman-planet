"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Ctrl = {
  addListener: (e: string, cb: (ev: { data: { isPaused: boolean; position: number; duration: number } }) => void) => void;
  loadUri: (uri: string, preferVideo?: boolean, startAt?: number) => void;
  play: () => void;
  resume: () => void;
  togglePlay: () => void;
  seek: (s: number) => void;
  destroy: () => void;
};
type Api = { createController: (el: HTMLElement, opts: object, cb: (c: Ctrl) => void) => void };

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: Api) => void;
    __spotifyApi?: Promise<Api>;
  }
}

function loadApi(): Promise<Api> {
  if (!window.__spotifyApi) {
    window.__spotifyApi = new Promise((resolve) => {
      window.onSpotifyIframeApiReady = resolve;
      const s = document.createElement("script");
      s.src = "https://open.spotify.com/embed/iframe-api/v1";
      s.async = true;
      document.body.appendChild(s);
    });
  }
  return window.__spotifyApi;
}

/** The real song via Spotify's official embed. Signed-in listeners hear it in full; others get Spotify's preview. */
export function useSpotifyPlayer(trackId: string, fallbackDuration: number) {
  const host = useRef<HTMLDivElement>(null);
  const ctrl = useRef<Ctrl | null>(null);
  const started = useRef(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(fallbackDuration);
  // Signed-out listeners get Spotify's 30s preview, whose positions don't map to the song.
  const [preview, setPreview] = useState(false);
  const uri = `spotify:track:${trackId}`;

  useEffect(() => {
    let dead = false;
    const el = document.createElement("div");
    host.current?.appendChild(el);
    const timeout = setTimeout(() => !dead && setStatus((s) => (s === "loading" ? "error" : s)), 12000);
    loadApi().then((api) => {
      if (dead) return;
      api.createController(el, { uri, width: "100%", height: 80 }, (c) => {
        ctrl.current = c;
        c.addListener("ready", () => setStatus("ready"));
        c.addListener("playback_update", (e) => {
          setPlaying(!e.data.isPaused);
          if (e.data.duration > 0 && e.data.duration < 40000 && fallbackDuration > 60) {
            setPreview(true);
            return;
          }
          setPreview(false);
          setTime(e.data.position / 1000);
          if (e.data.duration > 0) setDuration(e.data.duration / 1000);
        });
      });
    });
    return () => {
      dead = true;
      clearTimeout(timeout);
      ctrl.current?.destroy();
      ctrl.current = null;
      started.current = false;
      if (host.current) host.current.innerHTML = "";
    };
  }, [uri, fallbackDuration]);

  const seek = useCallback(
    (t: number) => {
      const c = ctrl.current;
      if (!c) return;
      if (!started.current) {
        started.current = true;
        c.loadUri(uri, false, Math.round(t));
        c.play();
      } else {
        c.seek(t);
        c.resume();
      }
      setTime(t);
    },
    [uri],
  );

  const toggle = useCallback(() => {
    const c = ctrl.current;
    if (!c) return;
    if (!started.current) {
      started.current = true;
      c.play();
    } else c.togglePlay();
  }, []);

  return { host, status, playing, time, duration, preview, seek, toggle };
}
