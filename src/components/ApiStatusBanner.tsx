// src/components/ApiStatusBanner.tsx
"use client";

import { useState } from "react";

export default function ApiStatusBanner({
  message = "Layanan backend tidak tersedia. Coba lagi beberapa saat.",
}: {
  message?: string;
}) {
  const [hide, setHide] = useState(false);
  if (hide) return null;
  return (
    <div className="mb-4 rounded-2xl ring-1 ring-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p>{message}</p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => location.reload()}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-3 py-1.5 text-white font-medium"
          >
            Coba lagi
          </button>
          <button
            onClick={() => setHide(true)}
            className="rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-gray-700"
            aria-label="Tutup pemberitahuan"
            title="Tutup"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
