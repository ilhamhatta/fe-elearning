// src/components/CourseCard.tsx
// Path: src/components/CourseCard.tsx
"use client";
import type { Course, User } from "@/types/course";
import StatusPill from "@/components/ui/StatusPill";
import EnrollButton from "@/components/EnrollButton";
import ConfirmDeleteCourse from "@/components/courses/ConfirmDeleteCourse";
import CountPill from "@/components/ui/CountPill";
import AvatarInitial from "@/components/ui/AvatarInitial";

export default function CourseCard({
  me,
  course,
}: {
  me: User;
  course: Course;
}) {
  const isOwner = me.role === "dosen" && me.id === course.lecturer_id;
  const isStudent = me.role === "mahasiswa";
  const enrolled = course.is_enrolled === true;

  return (
    <article className="group overflow-hidden rounded-2xl ring-1 ring-gray-200 bg-white shadow-sm transition hover:shadow-md hover:-translate-y-0.5 will-change-transform">
      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-fuchsia-500" />
      <div className="p-5">
        <header className="mb-3 flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-gray-900">
            {course.name}
          </h3>
          <div className="flex items-center gap-2">
            {typeof course.students_count === "number" && (
              <CountPill>{course.students_count} Peserta</CountPill>
            )}
            {isOwner && <StatusPill tone="neutral">Pemilik</StatusPill>}
            {isStudent && enrolled && (
              <StatusPill tone="success">Terdaftar</StatusPill>
            )}
          </div>
        </header>

        <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
          <AvatarInitial name={course.lecturer?.name} />
          <span className="truncate">
            Dosen: {course.lecturer?.name ?? "—"}
          </span>
        </div>

        {course.description && (
          <p className="line-clamp-3 text-sm text-gray-700">
            {course.description}
          </p>
        )}

        <footer className="mt-4 flex items-center justify-between">
          {isStudent ? (
            <EnrollButton
              courseId={course.id}
              courseName={course.name ?? ""}
              initiallyEnrolled={enrolled}
            />
          ) : isOwner ? (
            <div className="flex gap-2">
              <a
                href={`/courses/${course.id}/edit`}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                Edit
              </a>
              <ConfirmDeleteCourse
                courseId={course.id}
                courseName={course.name ?? ""}
              />
            </div>
          ) : (
            <span className="text-xs text-gray-500">—</span>
          )}

          {/* Aktifkan link detail */}
          <a
            href={`/courses/${course.id}`}
            className="text-sm font-medium bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-indigo-200 rounded-xl px-2 py-1"
          >
            Lihat detail
          </a>
        </footer>
      </div>
    </article>
  );
}
