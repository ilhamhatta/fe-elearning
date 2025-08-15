// src/components/EnrollButton.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EnrollButton({ courseId }: { courseId: number }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (loading) return;
        setErr(null);
        setLoading(true);
        try {
          const res = await fetch(`/api/courses/${courseId}/enroll`, {
            method: "POST",
            headers: { "X-Requested-With": "fetch" },
          });
          if (!res.ok) {
            const data = (await res.json().catch(() => ({}))) as {
              message?: string;
            };
            setErr(data?.message ?? "Gagal mendaftar mata kuliah.");
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
        className="inline-flex items-center rounded-lg bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-3 py-1.5 text-sm font-medium text-white shadow hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:opacity-50"
        aria-label="Daftar ke mata kuliah ini"
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              opacity="0.25"
            />
            <path d="M22 12a10 10 0 0 1-10 10" fill="currentColor" />
          </svg>
        )}
        Enroll
      </button>
      {err && <p className="mt-2 text-sm text-rose-600">{err}</p>}
    </form>
  );
}
