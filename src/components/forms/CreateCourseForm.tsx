// src/components/forms/CreateCourseForm.tsx
"use client";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateCourseForm({ action }: { action: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameErr, setNameErr] = useState<string | null>(null);
  const [apiErr, setApiErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const nameTrimmed = useMemo(() => name.trim(), [name]);
  const isNameValid = nameTrimmed.length >= 3;
  const formValid = isNameValid;

  function validateName(value: string) {
    const v = value.trim();
    if (v.length === 0) return "Nama mata kuliah wajib diisi.";
    if (v.length < 3) return "Minimal 3 karakter.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setApiErr(null);
    const err = validateName(name);
    setNameErr(err);
    if (err) {
      (
        formRef.current?.querySelector("#name") as HTMLInputElement | null
      )?.focus();
      return; // jangan loading kalau invalid
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.set("name", nameTrimmed);
      if (description.trim().length > 0)
        fd.set("description", description.trim());

      const res = await fetch(action, {
        method: "POST",
        body: fd,
        headers: { "X-Requested-With": "fetch", Accept: "application/json" },
      });

      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { message?: string };
        setApiErr(j?.message ?? "Gagal menyimpan mata kuliah.");
        setSubmitting(false);
        return;
      }

      // sukses → ke /courses
      router.push("/courses");
      router.refresh();
    } catch {
      setApiErr("Terjadi kesalahan jaringan.");
      setSubmitting(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4 rounded-lg ring-1 ring-gray-200 bg-white p-6 shadow-sm"
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
          onChange={(e) => {
            setName(e.target.value);
            if (nameErr) setNameErr(validateName(e.target.value));
          }}
          aria-invalid={!!nameErr}
          aria-describedby="name-error"
          className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-4 ${
            nameErr
              ? "border-rose-300 focus:ring-rose-200"
              : "border-gray-300 focus:ring-indigo-200"
          }`}
          placeholder="Contoh: Pemrograman Web"
        />
        {nameErr && (
          <p
            id="name-error"
            role="alert"
            className="mt-1 text-sm text-rose-600"
          >
            {nameErr}
          </p>
        )}
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
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-4 focus:ring-indigo-200"
          placeholder="Ringkasan materi yang dipelajari…"
        />
      </div>

      {apiErr && (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          {apiErr}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!formValid || submitting}
          aria-busy={submitting}
          className="inline-flex items-center rounded-lg bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-white shadow hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:opacity-50"
        >
          {submitting && (
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
          {submitting ? "Menyimpan…" : "Simpan"}
        </button>

        <a
          href="/courses"
          className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-indigo-200"
        >
          Batal
        </a>
      </div>
    </form>
  );
}
