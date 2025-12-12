// src/app/(app)/courses/new/page.tsx
// Path: src/app/(app)/courses/new/page.tsx
import { redirect } from "next/navigation";
import { apiJson } from "@/lib/apiGuard";
import type { User } from "@/types/course";
import CourseForm from "@/components/courses/CourseForm";

export default async function NewCoursePage() {
  const me = await apiJson<User>("/user", {}, { next: "/courses/new" });
  if (me.role !== "dosen") redirect("/courses");

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 p-6 text-white shadow">
        <h1 className="text-xl font-semibold">Buat Mata Kuliah</h1>
        <p className="text-sm opacity-90">
          Isi nama & deskripsi singkat mata kuliah.
        </p>
      </div>
      <CourseForm mode="create" />
    </div>
  );
}
