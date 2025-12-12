// src/components/materials/UploadMaterialForm.tsx
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type CourseLite = { id: number; name: string };

function getErrMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return "Terjadi kesalahan.";
}

export default function UploadMaterialForm({
  courses,
}: {
  courses: CourseLite[];
}) {
  const router = useRouter();
  const inputFile = useRef<HTMLInputElement | null>(null);
  const [courseId, setCourseId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  const onChoose = (f: File | null) => {
    setFile(f);
    if (f && !title) {
      const name = f.name.replace(/\.[^.]+$/, "");
      setTitle(name.slice(0, 255));
    }
  };

  const submit = async () => {
    if (!file || !courseId || !title) {
      setMsg({ type: "err", text: "Lengkapi course, judul, dan berkas." });
      return;
    }
    setMsg(null);
    setLoading(true);
    setProgress(0);

    const fd = new FormData();
    fd.append("course_id", courseId);
    fd.append("title", title);
    fd.append("file", file);

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/materials", true);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable)
          setProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else {
          try {
            const j = JSON.parse(xhr.responseText) as { message?: string };
            reject(new Error(j?.message ?? `Gagal upload (${xhr.status})`));
          } catch {
            reject(new Error(`Gagal upload (${xhr.status})`));
          }
        }
      };
      xhr.onerror = () => reject(new Error("Jaringan bermasalah."));
      xhr.send(fd);
    })
      .then(() => {
        setMsg({ type: "ok", text: "Berhasil diunggah." });
        setFile(null);
        setTitle("");
        setCourseId("");
        setProgress(0);
        if (inputFile.current) inputFile.current.value = "";
        router.refresh();
      })
      .catch((e: unknown) => setMsg({ type: "err", text: getErrMessage(e) }))
      .finally(() => setLoading(false));
  };

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div className="md:col-span-1">
        <label
          htmlFor="course_id"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Mata kuliah
        </label>
        <select
          id="course_id"
          required
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-200"
        >
          <option value="">Pilih…</option>
          {courses.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-1">
        <label
          htmlFor="title"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Judul materi
        </label>
        <input
          id="title"
          required
          minLength={3}
          maxLength={255}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-200"
          placeholder="Contoh: Pertemuan 1 - Pendahuluan"
        />
      </div>

      <div className="md:col-span-1">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Berkas
        </label>

        {/* Dropzone */}
        <div
          className="group flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-4 text-center hover:bg-gray-50 focus-within:ring-4 focus-within:ring-indigo-200"
          onClick={() => inputFile.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
          }}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) onChoose(f);
          }}
          role="button"
          tabIndex={0}
        >
          <div className="rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-2 py-1 text-xs font-medium text-white shadow ring-1 ring-indigo-200">
            Pilih / Tarik Berkas
          </div>
          <p className="mt-2 text-xs text-gray-500">
            pdf, docx, pptx, xls/xlsx, zip, mp4
          </p>
          {file && (
            <p className="mt-2 truncate text-xs text-gray-700">{file.name}</p>
          )}
          <input
            ref={inputFile}
            type="file"
            name="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.mp4"
            className="sr-only"
            onChange={(e) => onChoose(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="md:col-span-3 flex items-center gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2 text-sm font-medium text-white shadow ring-1 ring-indigo-200 hover:opacity-90 disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-indigo-200"
        >
          {loading ? "Mengunggah…" : "Upload"}
        </button>

        {typeof progress === "number" && loading && (
          <div className="relative h-2 w-44 overflow-hidden rounded-lg bg-gray-200">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {msg && (
          <span
            className={
              msg.type === "ok"
                ? "text-sm text-emerald-600"
                : "text-sm text-rose-600"
            }
          >
            {msg.text}
          </span>
        )}
      </div>
    </div>
  );
}
