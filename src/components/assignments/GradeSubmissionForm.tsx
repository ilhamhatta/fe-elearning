// src/components/assignments/GradeSubmissionForm.tsx
"use client";

import { useState } from "react";

export default function GradeSubmissionForm() {
  const [id, setId] = useState<string>("");
  const [score, setScore] = useState<number | "">("");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setErr(null);
        setOk(null);
        if (!id.trim()) return setErr("Masukkan ID submission.");
        const val = typeof score === "string" ? Number(score) : score;
        if (!Number.isFinite(val) || val < 0 || val > 100)
          return setErr("Skor 0–100.");

        setLoading(true);
        try {
          const res = await fetch(`/api/grade/${encodeURIComponent(id)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ score: val }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data?.message || "Gagal memberi nilai");
          setOk("Nilai tersimpan.");
        } catch (e: any) {
          setErr(e.message);
        } finally {
          setLoading(false);
        }
      }}
    >
      <div className="flex-1 min-w-[220px]">
        <label className="mb-2 block text-sm text-gray-700">
          Submission ID
        </label>
        <input
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-200"
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="mis. 42"
        />
      </div>
      <div className="w-32">
        <label className="mb-2 block text-sm text-gray-700">Skor</label>
        <input
          type="number"
          min={0}
          max={100}
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-200"
          value={score}
          onChange={(e) =>
            setScore(e.target.value ? Number(e.target.value) : "")
          }
        />
      </div>
      <button
        disabled={loading}
        className="rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white shadow hover:opacity-95 disabled:opacity-50"
      >
        {loading ? "Menyimpan..." : "Simpan Nilai"}
      </button>
      {err && <p className="text-sm text-rose-600">{err}</p>}
      {ok && <p className="text-sm text-emerald-600">{ok}</p>}
    </form>
  );
}
