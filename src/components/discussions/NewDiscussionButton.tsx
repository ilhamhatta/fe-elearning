// src/components/discussions/NewDiscussionButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewDiscussionButton({
  courseId,
}: {
  courseId: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const t = title.trim();
    const b = body.trim();
    if (t.length < 3) return setErr("Judul minimal 3 karakter.");
    if (b.length < 3) return setErr("Isi diskusi minimal 3 karakter.");

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("course_id", String(courseId));
      fd.append("title", t);
      fd.append("body", b);

      const res = await fetch("/api/discussions", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          (json && (json.message || json.error)) ||
          `Gagal membuat diskusi (HTTP ${res.status}).`;
        setErr(msg);
        return;
      }

      // Ambil ID topik yang baru dibuat dari respons backend
      const newId: number | undefined =
        Number(json?.data?.id ?? json?.id ?? NaN) || undefined;

      // === Arahkan setelah sukses ===
      // Jika halaman detail sudah ada, gunakan baris pertama.
      // Jika belum, pakai baris kedua (daftar diskusi kursus).
      if (newId) {
        router.push(`/discussions/${newId}`);
      } else {
        router.push(`/courses/${courseId}/discussions`);
      }

      // Tutup dialog & refresh data server components
      setOpen(false);
      setTitle("");
      setBody("");
      router.refresh();
    } catch {
      setErr("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white shadow hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-indigo-200"
      >
        + Buat Diskusi
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() => !loading && setOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-lg ring-1 ring-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">
                Topik Diskusi Baru
              </h3>
              <button
                type="button"
                className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
                onClick={() => setOpen(false)}
                disabled={loading}
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-3">
              <div>
                <label
                  htmlFor="d-title"
                  className="mb-2 block text-sm text-gray-700"
                >
                  Judul
                </label>
                <input
                  id="d-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  minLength={3}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-200"
                  placeholder="Mis. Pertanyaan Tugas 1"
                />
              </div>

              <div>
                <label
                  htmlFor="d-body"
                  className="mb-2 block text-sm text-gray-700"
                >
                  Isi
                </label>
                <textarea
                  id="d-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                  minLength={3}
                  rows={5}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-200"
                  placeholder="Tulis pertanyaan atau topik diskusi…"
                />
              </div>

              {err && <p className="text-sm text-rose-600">{err}</p>}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  disabled={loading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white shadow hover:opacity-95 disabled:opacity-60"
                >
                  {loading ? "Menyimpan…" : "Buat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
