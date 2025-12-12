// src/app/(app)/courses/[id]/page.tsx
// Server Component: detail kursus + ringkasan materi & diskusi
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiJson, apiJsonOptional } from "@/lib/apiGuard"; // ⬅️ pastikan import apiJsonOptional
import type { Course, User } from "@/types/course";
import CountPill from "@/components/ui/CountPill";
import StatusPill from "@/components/ui/StatusPill";
import EnrollButton from "@/components/EnrollButton";
import ConfirmDeleteCourse from "@/components/courses/ConfirmDeleteCourse";
import AvatarInitial from "@/components/ui/AvatarInitial";
import CopyLinkButton from "@/components/CopyLinkButton";
import {
  FileText,
  FileArchive,
  FileSpreadsheet,
  FileImage,
  FileAudio,
  FileVideo,
  FileCode,
} from "lucide-react";

/** ===== Materials (seperti sebelumnya) ===== */
type MaterialLite = { id: number; title: string; original_name?: string };
type MaterialApiItem = {
  id: number | string;
  title?: string | null;
  original_name?: string | null;
  name?: string | null; // fallback
  filename?: string | null; // fallback (biasanya uuid)
};
type MaterialsApiResp =
  | { data?: MaterialApiItem[]; materials?: MaterialApiItem[] }
  | MaterialApiItem[];

function fileIconByTitle(title?: string) {
  const ext = title?.split(".").pop()?.toLowerCase();
  if (!ext) return FileText;
  if (["zip", "rar", "7z"].includes(ext)) return FileArchive;
  if (["xls", "xlsx", "csv"].includes(ext)) return FileSpreadsheet;
  if (["png", "jpg", "jpeg", "webp"].includes(ext)) return FileImage;
  if (["mp3", "wav", "m4a"].includes(ext)) return FileAudio;
  if (["mp4", "mov", "mkv", "webm"].includes(ext)) return FileVideo;
  if (["js", "ts", "tsx", "py", "php", "java", "rb", "go", "cs"].includes(ext))
    return FileCode;
  return FileText;
}
function normalizeMaterials(resp: MaterialsApiResp): MaterialLite[] {
  const arr: MaterialApiItem[] = Array.isArray(resp)
    ? resp
    : Array.isArray(resp.data)
    ? resp.data!
    : Array.isArray(resp.materials)
    ? resp.materials!
    : [];

  const toNum = (v: number | string | undefined): number | null => {
    if (typeof v === "number") return Number.isFinite(v) ? v : null;
    if (typeof v === "string") {
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    }
    return null;
  };

  return arr
    .map((m) => {
      const id = toNum(m.id);
      const title =
        (m.title && m.title.trim()) ||
        (m.original_name && m.original_name.trim()) ||
        (m.name && m.name.trim()) ||
        (m.filename && m.filename.trim()) ||
        "";

      if (!id || !title) return null;

      const out: MaterialLite = { id, title };
      if (m.original_name && m.original_name.trim()) {
        out.original_name = m.original_name.trim();
      }
      return out;
    })
    .filter((x): x is MaterialLite => x !== null);
}

/** ===== Discussions (ringkasan) ===== */
type TopicMini = {
  id: number;
  title: string;
  body: string;
  replies_count: number;
  last_activity_at: string;
};
type ListResp = { data: TopicMini[] };

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) notFound();

  // Auth & course
  const me = await apiJson<User>("/user", {}, { next: `/courses/${id}` });
  const all = await apiJson<Course[]>(
    "/courses",
    {},
    { next: `/courses/${id}` }
  );
  const course = all.find((c) => c.id === id);
  if (!course) notFound();

  const isOwner = me.role === "dosen" && me.id === course.lecturer_id;
  const isStudent = me.role === "mahasiswa";
  const enrolled = course.is_enrolled === true;

  // Materials
  const matsResp = await apiJson<MaterialsApiResp>(
    `/materials?course_id=${id}&per_page=50`,
    {},
    { next: `/courses/${id}` }
  );
  const materials: MaterialLite[] = normalizeMaterials(matsResp);

  // ⬇⬇ RINGKASAN DISKUSI — jadikan benar-benar "optional"
  //    Abaikan 403 (belum enroll), 404 (route belum ada), dan 500 (glitch sesaat)
  const topicsResp = await apiJsonOptional<ListResp>(
    `/courses/${id}/discussions?per_page=3&sort=active`,
    {},
    { next: `/courses/${id}`, ignore: [403, 404, 500] } // ⬅️ penting agar tak redirect ke /maintenance
  );
  const topics = topicsResp?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 p-6 text-white shadow">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 inline-flex items-center gap-2">
              <h1 className="text-xl font-semibold">{course.name}</h1>
              {typeof course.students_count === "number" && (
                <span className="hidden sm:inline-block">
                  <CountPill>{course.students_count} Peserta</CountPill>
                </span>
              )}
              {isOwner && <StatusPill tone="neutral">Pemilik</StatusPill>}
              {isStudent && enrolled && (
                <StatusPill tone="success">Terdaftar</StatusPill>
              )}
            </div>
            <div className="text-sm/6 opacity-90 flex items-center gap-2">
              <AvatarInitial name={course.lecturer?.name} />
              <span>Dosen: {course.lecturer?.name ?? "—"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/courses"
              className="rounded-2xl border border-white/40 bg-white/10 px-4 py-2 text-white hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/30"
            >
              ← Kembali
            </Link>

            {isStudent ? (
              <EnrollButton
                courseId={course.id}
                courseName={course.name ?? ""}
                initiallyEnrolled={enrolled}
              />
            ) : isOwner ? (
              <>
                <Link
                  href={`/courses/${course.id}/edit`}
                  className="rounded-2xl border border-white/40 bg-white/10 px-4 py-2 text-white hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/30"
                >
                  Edit
                </Link>
                <ConfirmDeleteCourse
                  courseId={course.id}
                  courseName={course.name ?? ""}
                />
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Deskripsi */}
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-base font-semibold text-gray-900 mb-2">
          Deskripsi
        </h2>
        {course.description ? (
          <p className="text-sm text-gray-700 whitespace-pre-line">
            {course.description}
          </p>
        ) : (
          <p className="text-sm text-gray-500">Belum ada deskripsi.</p>
        )}
      </section>

      {/* Materi */}
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Materi</h2>
          {isOwner && (
            <Link
              href={`/materials?course_id=${id}`}
              className="text-sm rounded-2xl px-3 py-1.5 text-white bg-gradient-to-r from-indigo-600 to-fuchsia-600 shadow hover:opacity-95"
            >
              + Upload Materi
            </Link>
          )}
        </div>

        <div className="mt-3">
          {materials.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-sm text-gray-500">
              Belum ada materi.
            </div>
          ) : (
            <ul className="space-y-3">
              {materials.map((m) => {
                const Icon = fileIconByTitle(m.original_name ?? m.title);
                const href = `/api/materials/${m.id}/download`;
                return (
                  <li
                    key={m.id}
                    className="flex items-start gap-3 rounded-xl ring-1 ring-gray-200 p-3 bg-white shadow-sm"
                  >
                    <div className="shrink-0 rounded-lg bg-indigo-50 p-2 ring-1 ring-indigo-100">
                      <Icon
                        className="h-5 w-5 text-indigo-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {m.title}
                        </span>
                        <CopyLinkButton href={href} />
                      </div>
                      <a
                        href={href}
                        className="mt-2 inline-block text-xs rounded-xl px-3 py-1.5 text-white bg-gradient-to-r from-indigo-600 to-fuchsia-600 shadow hover:opacity-95"
                      >
                        Download
                      </a>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* Tugas & Diskusi (ringkasan) */}
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            Tugas & Diskusi
          </h2>
          <div className="flex items-center gap-2">
            <Link
              href={`/courses/${id}/discussions`}
              className="text-sm text-indigo-700 hover:underline"
            >
              Lihat semua
            </Link>
            {(isOwner || (isStudent && enrolled)) && (
              <NewDiscussionButton courseId={id} />
            )}
          </div>
        </div>

        {topics.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed p-6 text-sm text-gray-500">
            {enrolled || isOwner
              ? "Belum ada topik diskusi."
              : "Enroll untuk melihat diskusi."}
          </div>
        ) : (
          <ul className="mt-3 space-y-3">
            {topics.map((t) => (
              <li key={t.id} className="rounded-xl border border-gray-200 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/discussions/${t.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {t.title}
                    </Link>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      {t.body}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {t.replies_count} balasan • aktivitas terakhir{" "}
                      {new Date(t.last_activity_at).toLocaleString()}
                    </p>
                  </div>
                  <Link
                    href={`/discussions/${t.id}`}
                    className="rounded-xl border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                  >
                    Buka
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

import NewDiscussionButton from "@/components/discussions/NewDiscussionButton";
