// src/app/(app)/courses/page.tsx
import Link from "next/link";
import { apiJson } from "@/lib/apiGuard";
import type { Course, User } from "@/types/course";
import CoursesToolbar from "@/components/courses/CoursesToolbar";
import CoursesList from "@/components/courses/CoursesList";
import EmptyState from "@/components/ui/EmptyState";

type Filter = "all" | "enrolled" | "not-enrolled";
type SearchMap = Record<string, string | string[] | undefined>;

function parseFilterForRole(
  role: User["role"],
  raw: SearchMap[keyof SearchMap]
): Filter {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (role === "mahasiswa") {
    return v === "enrolled" || v === "not-enrolled" ? (v as Filter) : "all";
  }
  // dosen selalu "all"
  return "all";
}

export default async function Page({
  // Next.js 15.4: searchParams adalah Promise → wajib di-await
  searchParams,
}: {
  searchParams: Promise<SearchMap>;
}) {
  const me = await apiJson<User>("/user", {}, { next: "/courses" });
  const courses = await apiJson<Course[]>("/courses", {}, { next: "/courses" });

  const sp = await searchParams;
  const initialQ = (Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "";
  const initialFilter = parseFilterForRole(me.role, sp.filter);

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 p-6 text-white shadow">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold">Mata Kuliah</h1>
            <p className="text-sm opacity-90">
              Kelola & ikuti mata kuliah sesuai peran Anda.
            </p>
          </div>
          {me.role === "dosen" && (
            <Link
              href="/courses/new"
              className="inline-flex items-center rounded-2xl bg-white/10 px-4 py-2 text-white shadow ring-1 ring-white/30 hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/30"
            >
              + Buat Mata Kuliah
            </Link>
          )}
        </div>
      </div>

      {/* Toolbar + Stats (SSR selaras dgn URL → no flash) */}
      <CoursesToolbar
        me={me}
        total={courses.length}
        initialQ={initialQ}
        initialFilter={initialFilter}
      />

      {/* List/Grid */}
      {courses.length === 0 ? (
        <EmptyState
          title={
            me.role === "dosen"
              ? "Belum ada mata kuliah"
              : "Belum ada mata kuliah tersedia"
          }
          description={
            me.role === "dosen"
              ? "Mulai dengan membuat mata kuliah pertama Anda."
              : "Tidak ada mata kuliah yang ditampilkan untuk saat ini."
          }
          actionLabel={me.role === "dosen" ? "Buat Mata Kuliah" : undefined}
          actionHref={me.role === "dosen" ? "/courses/new" : undefined}
        />
      ) : (
        <CoursesList
          me={me}
          courses={courses}
          initialQ={initialQ}
          initialFilter={initialFilter}
        />
      )}
    </div>
  );
}
