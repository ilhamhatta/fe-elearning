// src/components/discussions/CreateDiscussionForm.tsx
"use client";

import { useRef, useState } from "react";
import { extractApiError, getErrorMessage } from "@/lib/clientError";

type Props = { courseId: number };

export default function CreateDiscussionForm({ courseId }: Props) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action="/api/discussions"
      method="POST"
      className="space-y-4 rounded-2xl border border-gray-200 p-5 shadow-sm ring-1 ring-gray-100"
      onSubmit={async (ev) => {
        if (loading) return;
        setErr(null);
        setLoading(true);
        ev.preventDefault();

        try {
          const form = new FormData(formRef.current!);
          form.set("course_id", String(courseId)); // pastikan ada

          const res = await fetch("/api/discussions", {
            method: "POST",
            body: form,
          });
          if (!res.ok) {
            throw new Error(await extractApiError(res));
          }

          formRef.current?.reset();
          // Optional: refresh list jika nanti ada GET
          // router.refresh();
        } catch (e: unknown) {
          setErr(getErrorMessage(e));
        } finally {
          setLoading(false);
        }
      }}
    >
      <div>
        <label
          htmlFor="title"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Judul Diskusi
        </label>
        <input
          id="title"
          name="title"
          required
          minLength={3}
          maxLength={255}
          aria-label="Judul Diskusi"
          className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-4 focus:ring-indigo-200"
          placeholder="Contoh: Tanya materi pertemuan 3"
        />
      </div>

      <div>
        <label
          htmlFor="body"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Isi
        </label>
        <textarea
          id="body"
          name="body"
          required
          minLength={3}
          rows={4}
          aria-label="Isi Diskusi"
          className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-4 focus:ring-indigo-200"
          placeholder="Tulis pertanyaan atau topik diskusi..."
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-95 disabled:opacity-60"
        >
          {loading ? "Menyimpan..." : "Buat Diskusi"}
        </button>
        <p role="status" aria-live="polite" className="text-sm text-rose-600">
          {err}
        </p>
      </div>
    </form>
  );
}
