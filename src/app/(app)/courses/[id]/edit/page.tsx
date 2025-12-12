// src/app/(app)/courses/[id]/edit/page.tsx
// Path: src/app/(app)/courses/[id]/edit/page.tsx
import { notFound, redirect } from "next/navigation";
import { apiJson } from "@/lib/apiGuard";
import type { Course, User } from "@/types/course";
import CourseForm from "@/components/courses/CourseForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCoursePage({ params }: Props) {
  const me = await apiJson<User>("/user", {}, { next: "/courses" });
  if (me.role !== "dosen") redirect("/courses");

  const { id } = await params;
  const courseId = Number(id);

  // Tidak ada GET /courses/{id}: ambil semua lalu pilih by id
  const all = await apiJson<Course[]>("/courses", {}, { next: "/courses" });
  const course = all.find((c) => c.id === courseId);
  if (!course) notFound();
  if (course.lecturer_id !== me.id) redirect("/courses");

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 p-6 text-white shadow">
        <h1 className="text-xl font-semibold">Edit Mata Kuliah</h1>
        <p className="text-sm opacity-90">Perbarui informasi mata kuliah.</p>
      </div>
      <CourseForm
        mode="edit"
        courseId={course.id}
        initial={{ name: course.name, description: course.description ?? "" }}
      />
    </div>
  );
}
