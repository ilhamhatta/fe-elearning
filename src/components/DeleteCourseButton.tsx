// src/components/DeleteCourseButton.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteCourseButton({
  id,
  name,
}: {
  id: number;
  name: string;
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (loading) return;
        if (!confirm(`Hapus mata kuliah “${name}”?`)) return;
        setErr(null);
        setLoading(true);
        try {
          const form = new FormData();
          form.set("_method", "DELETE");
          const res = await fetch(`/api/courses/${id}`, {
            method: "POST",
            body: form,
            headers: { "X-Requested-With": "fetch" },
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setErr(
              (data as { message?: string })?.message ?? "Gagal menghapus."
            );
          } else {
            router.refresh();
          }
        } finally {
          setLoading(false);
        }
      }}
    >
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-indigo-200"
      >
        {loading ? "Menghapus..." : "Hapus"}
      </button>
      {err && <p className="mt-2 text-sm text-rose-600">{err}</p>}
    </form>
  );
}
