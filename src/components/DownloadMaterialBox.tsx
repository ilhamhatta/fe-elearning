// src/components/DownloadMaterialBox.tsx
"use client";
import { useState } from "react";

export default function DownloadMaterialBox() {
  const [id, setId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleDownload() {
    setErr(null);
    if (!id.trim()) {
      setErr("ID materi wajib diisi.");
      return;
    }
    setLoading(true);
    try {
      // Cara paling stabil: arahkan ke route download (biar browser tangani file)
      window.location.href = `/api/materials/${encodeURIComponent(
        id.trim()
      )}/download`;
    } finally {
      // kita reset agar tombol tidak terkunci lama
      setTimeout(() => setLoading(false), 800);
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <input
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="Masukkan ID materi, mis. 2"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-4 focus:ring-indigo-200"
        value={id}
        onChange={(e) => setId(e.target.value)}
        aria-label="ID materi"
      />
      <button
        type="button"
        onClick={handleDownload}
        disabled={loading || !id.trim()}
        className="inline-flex items-center rounded-lg bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-white shadow hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:opacity-50"
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              opacity="0.25"
            />
            <path d="M22 12a10 10 0 0 1-10 10" fill="currentColor" />
          </svg>
        )}
        {loading ? "Menyiapkan…" : "Unduh"}
      </button>
      {err && <p className="text-sm text-rose-600">{err}</p>}
    </div>
  );
}
