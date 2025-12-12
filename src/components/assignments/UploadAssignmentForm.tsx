// src/components/assignments/UploadAssignmentForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadAssignmentForm({
  assignmentId,
}: {
  assignmentId: number;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200"
      onSubmit={async (e) => {
        e.preventDefault();
        setErr(null);
        if (!file) return setErr("Pilih file terlebih dahulu.");

        const fd = new FormData();
        fd.append("assignment_id", String(assignmentId));
        fd.append("file", file);

        setLoading(true);
        try {
          const res = await fetch("/api/submissions", {
            method: "POST",
            body: fd,
          });
          const data = await res.json();
          if (!res.ok)
            throw new Error(data?.message || "Gagal mengunggah tugas");
          router.push("/assignments?uploaded=1");
          router.refresh();
        } catch (e: any) {
          setErr(e.message);
        } finally {
          setLoading(false);
        }
      }}
    >
      <div>
        <label className="mb-2 block text-sm text-gray-700">File</label>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border file:border-gray-300 file:bg-white file:px-3 file:py-1.5 focus:outline-none focus:ring-4 focus:ring-indigo-200"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          Format: PDF/DOC/DOCX, maks 20 MB.
        </p>
      </div>

      {err && <p className="text-sm text-rose-600">{err}</p>}

      <button
        disabled={loading}
        className="rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white shadow hover:opacity-95 disabled:opacity-50"
      >
        {loading ? "Mengunggah..." : "Kirim"}
      </button>
    </form>
  );
}
