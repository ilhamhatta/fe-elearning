// src/components/assignments/InlineGrade.tsx
"use client";

import { useState, startTransition } from "react";
import { useRouter } from "next/navigation";

export default function InlineGrade({
  submissionId,
  initialScore,
}: {
  submissionId: number;
  initialScore: number | null;
}) {
  const [score, setScore] = useState<number | "">(
    typeof initialScore === "number" ? initialScore : ""
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    const val = score === "" ? NaN : Number(score);
    if (!Number.isFinite(val) || val < 0 || val > 100) {
      setMsg("Skor harus 0–100.");
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/grade`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ score: val }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || `Gagal menyimpan (HTTP ${res.status})`);
      }
      startTransition(() => router.refresh());
      setMsg("Tersimpan.");
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSave} className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        max={100}
        step={1}
        inputMode="numeric"
        value={score}
        onChange={(e) =>
          setScore(e.target.value === "" ? "" : Number(e.target.value))
        }
        className="w-24 rounded-xl border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-200"
        aria-label="Skor"
        placeholder="0-100"
      />
      <button
        disabled={saving}
        className="rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-3 py-1.5 text-sm font-medium text-white shadow disabled:opacity-50"
      >
        {saving ? "Menyimpan..." : "Simpan"}
      </button>
      {msg && <span className="text-xs text-gray-600">{msg}</span>}
    </form>
  );
}
