// src/components/materials/ConfirmDeleteMaterial.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function getErrMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return "Terjadi kesalahan.";
}

export default function ConfirmDeleteMaterial({ id }: { id: number }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        if (!confirm("Hapus materi ini?")) return;
        setErr(null);
        setLoading(true);
        try {
          const res = await fetch(`/api/materials/${id}`, { method: "DELETE" });
          if (!res.ok) {
            const j = (await res.json().catch(() => ({}))) as {
              message?: string;
            };
            throw new Error(
              j?.message ?? `Gagal menghapus (status ${res.status})`
            );
          }
          router.refresh();
        } catch (e: unknown) {
          setErr(getErrMessage(e));
        } finally {
          setLoading(false);
        }
      }}
      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:opacity-50"
      disabled={loading}
      aria-label="Hapus materi"
      title="Hapus"
    >
      {loading ? "Menghapus…" : "Hapus"}
      {err && <span className="ml-2 text-rose-600">{err}</span>}
    </button>
  );
}
