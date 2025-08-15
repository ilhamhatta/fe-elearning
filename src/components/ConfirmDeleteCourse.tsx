// src/components/ConfirmDeleteCourse.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function ConfirmDeleteCourse({
  id,
  name,
}: {
  id: number;
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();
  const cancelRef = useRef<HTMLButtonElement>(null);

  // fokus ke tombol batal saat modal buka
  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  function onClose() {
    if (!loading) setOpen(false);
  }

  async function onConfirm() {
    setLoading(true);
    setErr(null);
    try {
      const form = new FormData();
      form.set("_method", "DELETE");
      const res = await fetch(`/api/courses/${id}`, {
        method: "POST",
        body: form,
        headers: { "X-Requested-With": "fetch" },
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        setErr(data?.message ?? "Gagal menghapus.");
      } else {
        setOpen(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-100 focus:outline-none focus:ring-4 focus:ring-rose-200"
      >
        <svg
          viewBox="0 0 24 24"
          className="mr-1.5 h-4 w-4"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M9 3h6l1 2h4a1 1 0 1 1 0 2h-1l-1.2 12.1A2.5 2.5 0 0 1 15.3 21H8.7a2.5 2.5 0 0 1-2.5-2.3L5 7H4a1 1 0 1 1 0-2h4l1-2zM7 7l1.1 11a.5.5 0 0 0 .5.45h6.8a.5.5 0 0 0 .5-.45L17 7H7z" />
        </svg>
        Hapus
      </button>

      {/* Modal */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="del-title"
          className="fixed inset-0 z-50 flex items-center justify-center"
          onKeyDown={(e) => e.key === "Escape" && onClose()}
        >
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <div
            className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-50">
                <svg
                  viewBox="0 0 20 20"
                  className="h-5 w-5 text-rose-600"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M10 2a8 8 0 108 8 8 8 0 00-8-8zM9 6h2v6H9zm0 7h2v2H9z" />
                </svg>
              </span>
              <div>
                <h3
                  id="del-title"
                  className="text-base font-semibold text-gray-900"
                >
                  Hapus Mata Kuliah?
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Tindakan ini tidak dapat dibatalkan. Anda akan menghapus{" "}
                  <b>{name}</b>.
                </p>
                {err && <p className="mt-2 text-sm text-rose-600">{err}</p>}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                ref={cancelRef}
                type="button"
                onClick={onClose}
                disabled={loading}
                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className="inline-flex items-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-200 disabled:opacity-50"
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
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
