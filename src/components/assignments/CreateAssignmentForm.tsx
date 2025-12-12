// src/components/assignments/CreateAssignmentForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Course = { id: number; name: string };

export default function CreateAssignmentForm({
  courses,
}: {
  courses: Course[];
}) {
  const router = useRouter();
  const [courseId, setCourseId] = useState<number | "">("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [deadline, setDeadline] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200"
      onSubmit={async (e) => {
        e.preventDefault();
        setErr(null);

        if (!courseId) return setErr("Pilih mata kuliah.");
        if (!title.trim()) return setErr("Judul wajib diisi.");
        if (!desc.trim()) return setErr("Deskripsi wajib diisi.");
        if (!deadline) return setErr("Deadline wajib diisi.");

        setLoading(true);
        try {
          const res = await fetch("/api/assignments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              course_id: Number(courseId),
              title,
              description: desc,
              deadline, // pastikan format input datetime-local => ISO oleh browser
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data?.message || "Gagal membuat tugas");
          }
          router.push(`/assignments?course=${courseId}`);
          router.refresh();
        } catch (e: any) {
          setErr(e.message);
        } finally {
          setLoading(false);
        }
      }}
    >
      <div>
        <label className="mb-2 block text-sm text-gray-700">Mata Kuliah</label>
        <select
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-200"
          value={courseId}
          onChange={(e) =>
            setCourseId(e.target.value ? Number(e.target.value) : "")
          }
          required
        >
          <option value="">-- pilih --</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm text-gray-700">Judul</label>
        <input
          type="text"
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-200"
          minLength={3}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-gray-700">Deskripsi</label>
        <textarea
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-200"
          rows={4}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-gray-700">Deadline</label>
        <input
          type="datetime-local"
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-200"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
        />
      </div>

      {err && <p className="text-sm text-rose-600">{err}</p>}

      <button
        disabled={loading}
        className="rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white shadow hover:opacity-95 disabled:opacity-50"
      >
        {loading ? "Menyimpan..." : "Simpan"}
      </button>
    </form>
  );
}
