"use client";

import { useState, useTransition } from "react";

/**
 * Delete control that asks first.
 *
 * Deletes here are permanent and cascade (removing a product takes its sizes
 * with it), and a single mis-click has already cost a catalogue entry — so the
 * button turns into an explicit confirm/cancel pair rather than firing on the
 * first press.
 *
 * The action is invoked directly rather than through a <form action={…}>: this
 * is used inside editors that are themselves forms, and a nested form is
 * invalid HTML that the browser silently drops.
 */
export default function DeleteButton({
  action,
  label = "Delete",
  what,
}: {
  /** Server action already bound to the record's id, or a local handler. */
  action: () => void | Promise<void>;
  label?: string;
  /** Name of the record, shown in the confirmation. */
  what?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
      >
        {label}
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-2.5 py-1.5">
      <span className="text-xs text-red-800">Delete{what ? ` “${what}”` : ""}?</span>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => void action())}
        className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded px-2 py-1 transition-colors disabled:opacity-60"
      >
        {pending ? "Deleting…" : "Yes, delete"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => setConfirming(false)}
        className="text-xs font-semibold text-navy hover:underline disabled:opacity-60"
      >
        Cancel
      </button>
    </span>
  );
}
