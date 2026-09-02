"use client";

import { useTransition } from "react";

export default function StatusSelect({
  id,
  value,
  options,
  action,
}: {
  id: string;
  value: string;
  options: readonly string[];
  action: (id: string, status: string) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={value}
      disabled={pending}
      onChange={(e) => startTransition(() => action(id, e.target.value))}
      className="border border-border rounded-lg px-3 py-1.5 text-sm font-semibold text-navy bg-white disabled:opacity-60"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
