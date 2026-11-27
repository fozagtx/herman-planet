"use client";

import type { ReactNode } from "react";
import { Island, IslandProvider } from "@/lib/island";
import { MoodHelp } from "./mood-help";
import { MusicDeck } from "./music-deck";

/** One island for the whole app, pinned to the top centre of the window. */
export const Providers = ({ children }: { children: ReactNode }) => (
  <IslandProvider>
    <Island placement="viewport" className="z-[64]" label="Now playing, saves and tips" />
    <MusicDeck />
    <MoodHelp />
    {children}
  </IslandProvider>
);
