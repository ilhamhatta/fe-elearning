// src/components/ReloadButton.tsx
"use client";

import { useTransition } from "react";

export default function ReloadButton({
  label = "Coba Lagi",
}: {
  label?: string;
}) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      aria-label="Coba lagi"
      onClick={() => start(() => location.reload())}
      disabled={pending}
      className="rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-indigo-600/20 disabled:opacity-60"
    >
      {pending ? "Memuat..." : label}
    </button>
  );
}
