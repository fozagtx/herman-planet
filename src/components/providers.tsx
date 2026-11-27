"use client";

import type { ReactNode } from "react";
import { Island, IslandProvider } from "@/lib/island";

/** One island for the whole app, pinned to the top centre of the window. */
export const Providers = ({ children }: { children: ReactNode }) => (
  <IslandProvider>
    <Island placement="viewport" className="z-[60]" label="Now playing and saves" />
    {children}
  </IslandProvider>
);
