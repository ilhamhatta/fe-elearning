// src/components/discussions/ReplyForm.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ReplyForm({ discussionId }: { discussionId: number }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const b = body.trim();
    if (b.length < 2) {
      setErr("Isi balasan minimal 2 karakter.");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("body", b);

      const res = await fetch(`/api/discussions/${discussionId}/replies`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErr(j?.message || `Gagal mengirim balasan (HTTP ${res.status}).`);
        return;
      }
      setBody("");
      router.refresh(); // refresh Server Components
    } catch {
      setErr("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label htmlFor="reply" className="mb-2 block text-sm text-gray-700">
          Tambah balasan
        </label>
        <textarea
          id="reply"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          required
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-200"
          placeholder="Tulis tanggapan…"
        />
      </div>
      {err && <p className="text-sm text-rose-600">{err}</p>}
      <div className="flex items-center justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white shadow hover:opacity-95 disabled:opacity-60"
        >
          {loading ? "Mengirim…" : "Kirim"}
        </button>
      </div>
    </form>
  );
}
