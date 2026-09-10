"use client";

import { useState } from "react";

/**
 * Delete control that asks first.
 *
 * Deletes here are permanent and cascade (removing a product takes its sizes
 * with it), and a single mis-click has already cost a catalogue entry — so the
 * button turns into an explicit confirm/cancel pair rather than firing on the
 * first press.
 */
export default function DeleteButton({
  action,
  label = "Delete",
  what,
}: {
  /** Server action, already bound to the record's id. */
  action: () => void | Promise<void>;
  label?: string;
  /** Name of the record, shown in the confirmation. */
  what?: string;
}) {
  const [confirming, setConfirming] = useState(false);

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
      <span className="text-xs text-red-800">
        Delete{what ? ` “${what}”` : ""}?
      </span>
      <form action={action} className="contents">
        <button type="submit" className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded px-2 py-1 transition-colors">
          Yes, delete
        </button>
      </form>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-xs font-semibold text-navy hover:underline"
      >
        Cancel
      </button>
    </span>
  );
}
