"use client";

import { useBlocked } from "@/lib/use-blocked";
import { useActionState, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { bookTickets, type EventState } from "@/app/event-actions";

const field = "min-h-11 w-full rounded-[11px] border border-line bg-paper px-3.5 text-[15px] outline-none focus:border-ink/40";
const label = "grid gap-1.5 text-[13px] font-medium text-muted-foreground";
const btn = "press inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-medium text-surface hover:bg-ink/85 disabled:opacity-60";

type Props = { id: string; title: string; when: string; place: string; price: string | null; free: boolean; online: boolean; sample: boolean; left: number | null; kind: "show" | "meetup" };

/** Tickets or RSVP: opens a sheet. Paid events: pay with Bachs or have the team contact you. */
export function TicketButton(e: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState<EventState, FormData>(bookTickets, null);
  useBlocked(state, "book");
  const [pay, setPay] = useState<"bachs" | "contact">("bachs");
  useEffect(() => {
    if (state?.redirect) window.location.assign(state.redirect);
  }, [state]);
  const soldOut = e.left !== null && e.left <= 0;
  const verb = e.free ? "RSVP" : "Get tickets";
  return (
    <>
      <button type="button" disabled={soldOut} onClick={() => ref.current?.showModal()} className={btn}>
        {soldOut ? "Sold out" : e.free ? "RSVP · Free" : <>{verb} · <span className="num ml-1">{e.price}</span></>}
      </button>
      <dialog ref={ref} aria-label={`${verb}: ${e.title}`}
        className="m-auto w-[min(92vw,480px)] rounded-[18px] border border-line bg-surface p-0 text-ink shadow-[0_30px_80px_-30px_rgba(29,23,48,0.5)] backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
        onClick={(ev) => ev.target === ev.currentTarget && ref.current?.close()}>
        <div className="p-6">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold tracking-tight">{e.title}</p>
              <p className="text-[14px] text-muted-foreground">{e.when} · {e.place}</p>
              <p className="num mt-1 text-sm">{e.free ? "Free" : e.price}{e.left !== null ? ` · ${e.left} left` : ""}</p>
              {e.sample && <span className="mt-1 inline-block rounded-full bg-sunk px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Sample</span>}
            </div>
            <button type="button" onClick={() => ref.current?.close()} aria-label="Close" className="-m-2 flex h-11 w-11 items-center justify-center rounded-full hover:bg-sunk"><X className="h-4 w-4" /></button>
          </div>
          {state?.ok ? (
            <p role="status" className="mt-5 rounded-[13px] bg-sunk p-4 text-[15px] font-medium">{state.message}</p>
          ) : (
            <form action={action} data-flow="book" className="relative mt-5 grid gap-3">
              <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute left-[-9999px] h-0 w-0 opacity-0" />
              <input type="hidden" name="eventId" value={e.id} />
              <input type="hidden" name="free" value={e.free ? "1" : "0"} />
              <input type="hidden" name="sample" value={e.sample ? "1" : "0"} />
              <div className="grid grid-cols-[1fr_96px] gap-3">
                <label className={label}>Name<input name="name" required maxLength={60} autoComplete="name" className={field} /></label>
                <label className={label}>{e.free ? "Places" : "Tickets"}<input name="quantity" type="number" min={1} max={Math.min(10, e.left ?? 10)} defaultValue={1} className={field} /></label>
              </div>
              <label className={label}>Email or phone<input name="contact" required maxLength={80} autoComplete="email" className={field} /></label>
              {!e.free && e.online && !e.sample && (
                <fieldset className="grid gap-2">
                  <legend className="mb-1 text-[13px] font-medium text-muted-foreground">How do you want to pay?</legend>
                  <label className="flex cursor-pointer items-start gap-3 rounded-[13px] border border-line p-3 has-[:checked]:border-ink">
                    <input type="radio" name="pay" value="bachs" defaultChecked className="mt-1 h-4 w-4 accent-[#1d1730]" onChange={() => setPay("bachs")} />
                    <span><span className="block text-sm font-medium">Pay now with Bachs</span><span className="text-[13px] text-muted-foreground">Card or mobile money, on secure checkout.</span></span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-3 rounded-[13px] border border-line p-3 has-[:checked]:border-ink">
                    <input type="radio" name="pay" value="contact" className="mt-1 h-4 w-4 accent-[#1d1730]" onChange={() => setPay("contact")} />
                    <span><span className="block text-sm font-medium">Have Herman&apos;s team contact me</span><span className="text-[13px] text-muted-foreground">Your places are held while they send payment details.</span></span>
                  </label>
                </fieldset>
              )}
              <label className="flex items-start gap-2.5 text-sm">
                <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 accent-[#1d1730]" />
                Herman&apos;s team can contact me about this {e.kind}.
              </label>
              {state && !state.ok && <p role="status" className="text-sm font-medium text-alert">{state.message}</p>}
              <button disabled={pending} className={btn}>
                {pending ? "Booking" : e.free ? "Save my place" : e.online && !e.sample && pay === "bachs" ? "Continue to payment" : "Hold my tickets"}
              </button>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
