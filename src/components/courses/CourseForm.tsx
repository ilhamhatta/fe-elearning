// src/components/CourseForm.tsx
// Path: src/components/CourseForm.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Props =
  | {
      mode: "create";
      courseId?: never;
      initial?: { name?: string; description?: string };
    }
  | {
      mode: "edit";
      courseId: number;
      initial: { name: string; description: string };
    };

export default function CourseForm(props: Props) {
  const router = useRouter();
  const [name, setName] = useState(props.initial?.name ?? "");
  const [description, setDescription] = useState(
    props.initial?.description ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!name || name.trim().length < 3) {
      setErr("Nama minimal 3 karakter.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        props.mode === "create"
          ? "/api/courses"
          : `/api/courses/${props.courseId}`,
        {
          method: props.mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim() || null,
          }),
        }
      );

      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok)
        throw new Error(data.message || "Gagal menyimpan mata kuliah");

      router.push("/courses");
      router.refresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Terjadi kesalahan";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl ring-1 ring-gray-200 bg-white p-5 shadow-sm"
    >
      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Nama Mata Kuliah
        </label>
        <input
          id="name"
          name="name"
          required
          minLength={3}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-4 focus:ring-indigo-200"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Deskripsi (opsional)
        </label>
        <textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-4 focus:ring-indigo-200"
        />
      </div>

      {err && <p className="text-sm text-rose-600">{err}</p>}

      <div className="flex items-center gap-3">
        <button
          disabled={loading}
          className="rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-white shadow hover:opacity-95 disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-indigo-200"
        >
          {loading
            ? "Menyimpan..."
            : props.mode === "create"
            ? "Simpan"
            : "Update"}
        </button>
        <button
          type="button"
          onClick={() => history.back()}
          className="rounded-2xl border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
