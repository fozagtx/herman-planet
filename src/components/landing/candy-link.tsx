"use client";

import { useRouter } from "next/navigation";
import { CandyButton } from "@/components/ui/candy-button";

/** VengeanceUI CandyButton in ink (no neon), navigating like a link. */
export function CandyLink({ href, children }: { href: string; children: React.ReactNode }) {
  const router = useRouter();
  return (
    <CandyButton
      type="button"
      onClick={() => router.push(href)}
      onMouseEnter={() => router.prefetch(href)}
      className="min-h-11 rounded-full border-[#3a3150] bg-[radial-gradient(95%_60%_at_50%_75%,#1d1730_0%,#3d3456_100%)] px-6 py-2.5 text-sm font-medium text-surface shadow-[0px_6px_28px_-12px_rgba(29,23,48,0.55),inset_0px_1px_8px_-4px_#FFFFFF]"
    >
      {children}
    </CandyButton>
  );
}
