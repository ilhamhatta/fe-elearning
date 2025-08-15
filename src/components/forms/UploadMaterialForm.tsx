// src/components/forms/UploadMaterialForm.tsx
"use client";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Course = { id: number; name: string };

export default function UploadMaterialForm({
  action,
  courses,
}: {
  action: string;
  courses: Course[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  // values
  const [courseId, setCourseId] = useState<number | "">("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // ui states
  const [loading, setLoading] = useState(false);
  const [apiErr, setApiErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // touched & submitted
  const [tCourse, setTCourse] = useState(false);
  const [tTitle, setTTitle] = useState(false);
  const [tFile, setTFile] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const titleTrim = useMemo(() => title.trim(), [title]);

  // validation messages
  const courseErr = courseId === "" ? "Wajib pilih mata kuliah." : null;
  const titleErr =
    titleTrim.length === 0
      ? "Judul wajib diisi."
      : titleTrim.length < 3
      ? "Minimal 3 karakter."
      : null;
  const fileErr = !file ? "File wajib diunggah." : null;

  const showCourseErr = (submitted || tCourse) && !!courseErr;
  const showTitleErr = (submitted || tTitle) && !!titleErr;
  const showFileErr = (submitted || tFile) && !!fileErr;

  const formValid = !courseErr && !titleErr && !fileErr;

  function resetForm() {
    setCourseId("");
    setTitle("");
    setFile(null);
    setTCourse(false);
    setTTitle(false);
    setTFile(false);
    setSubmitted(false);
    setApiErr(null);
    setOk(null);
    formRef.current?.reset();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    setApiErr(null);
    setOk(null);

    if (!formValid) return; // jangan loading kalau invalid

    setLoading(true);
    try {
      const fd = new FormData();
      fd.set("course_id", String(courseId));
      fd.set("title", titleTrim);
      if (file) fd.set("file", file);

      const res = await fetch(action, {
        method: "POST",
        body: fd,
        headers: { "X-Requested-With": "fetch", Accept: "application/json" },
      });

      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { message?: string };
        setApiErr(j?.message ?? "Gagal mengunggah materi.");
        setLoading(false);
        return;
      }

      setOk("Materi berhasil diunggah.");
      resetForm();
      router.refresh();
    } catch {
      setApiErr("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-4">
      <div>
        <label
          htmlFor="course_id"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Mata Kuliah
        </label>
        <select
          id="course_id"
          name="course_id"
          value={courseId === "" ? "" : String(courseId)}
          onChange={(e) =>
            setCourseId(e.target.value ? Number(e.target.value) : "")
          }
          onBlur={() => setTCourse(true)}
          aria-invalid={showCourseErr}
          aria-describedby={showCourseErr ? "course-error" : undefined}
          className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-4 ${
            showCourseErr
              ? "border-rose-300 focus:ring-rose-200"
              : "border-gray-300 focus:ring-indigo-200"
          }`}
          required
        >
          <option value="">Pilih Mata Kuliah…</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {showCourseErr && (
          <p
            id="course-error"
            role="alert"
            aria-live="polite"
            className="mt-1 text-sm text-rose-600"
          >
            {courseErr}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="title"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Judul Materi
        </label>
        <input
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => setTTitle(true)}
          minLength={3}
          aria-invalid={showTitleErr}
          aria-describedby={showTitleErr ? "title-error" : undefined}
          placeholder="Contoh: Materi Pertemuan 1"
          className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-4 ${
            showTitleErr
              ? "border-rose-300 focus:ring-rose-200"
              : "border-gray-300 focus:ring-indigo-200"
          }`}
          required
        />
        {showTitleErr && (
          <p
            id="title-error"
            role="alert"
            aria-live="polite"
            className="mt-1 text-sm text-rose-600"
          >
            {titleErr}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="file"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          File
        </label>
        <input
          id="file"
          name="file"
          type="file"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            if (!tFile) setTFile(true);
          }}
          onBlur={() => setTFile(true)}
          aria-invalid={showFileErr}
          aria-describedby={showFileErr ? "file-error" : undefined}
          className="block w-full rounded-lg border border-gray-300 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100 focus:outline-none focus:ring-4 focus:ring-indigo-200"
          required
        />
        {showFileErr && (
          <p
            id="file-error"
            role="alert"
            aria-live="polite"
            className="mt-1 text-sm text-rose-600"
          >
            {fileErr}
          </p>
        )}
      </div>

      {apiErr && (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          {apiErr}
        </div>
      )}
      {ok && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
        >
          {ok}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!formValid || loading}
          aria-busy={loading}
          className="inline-flex items-center rounded-lg bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-white shadow hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:opacity-50"
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
          {loading ? "Mengunggah…" : "Unggah"}
        </button>
        <button
          type="button"
          onClick={resetForm}
          disabled={loading}
          className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:opacity-50"
        >
          Reset
        </button>
      </div>
    </form>
  );
}
