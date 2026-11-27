"use client";

import { useEffect } from "react";
import { reportBlocked, type Flow } from "@/lib/mood";

/** When a form's server action says no, let the help reader know which flow and why. */
export function useBlocked(state: { ok: boolean; message: string } | null, flow: Flow) {
  useEffect(() => {
    if (state && !state.ok) reportBlocked(flow, state.message);
  }, [state, flow]);
}
