// src/components/materials/UploadMaterialForCourse.tsx
// Client Component: tombol + form upload khusus course tertentu (dengan progress)
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadMaterialForCourse({
  courseId,
}: {
  courseId: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const inputFile = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  const onChoose = (f: File | null) => {
    setFile(f);
    if (f && !title) setTitle(f.name.replace(/\.[^.]+$/, "").slice(0, 255));
  };

  const submit = async () => {
    if (!file || !title) {
      setMsg({ type: "err", text: "Lengkapi judul dan berkas." });
      return;
    }
    setMsg(null);
    setLoading(true);
    setProgress(0);

    const fd = new FormData();
    fd.append("course_id", String(courseId));
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
        setProgress(0);
        router.refresh();
      })
      .catch((e: unknown) => {
        const text = e instanceof Error ? e.message : "Gagal mengunggah.";
        setMsg({ type: "err", text });
      })
      .finally(() => setLoading(false));
  };

  return (
    <div id="upload-materi" className="w-full">
      {/* Tombol trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-3 py-1.5 text-xs font-medium text-white shadow ring-1 ring-indigo-200 hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-indigo-200"
      >
        {open ? "Tutup Upload" : "+ Upload Materi"}
      </button>

      {/* Panel upload */}
      {open && (
        <div className="mt-3 grid gap-3 md:grid-cols-3">
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
                <p className="mt-2 truncate text-xs text-gray-700">
                  {file.name}
                </p>
              )}
              <input
                ref={inputFile}
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.mp4"
                className="sr-only"
                onChange={(e) => onChoose(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          <div className="md:col-span-1 flex items-end gap-3">
            <button
              type="button"
              onClick={submit}
              disabled={loading}
              className="rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2 text-sm font-medium text-white shadow ring-1 ring-indigo-200 hover:opacity-90 disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-indigo-200"
            >
              {loading ? "Mengunggah…" : "Upload"}
            </button>

            {loading && (
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
      )}
    </div>
  );
}
