// src/components/CoursesList.tsx
"use client";
/**
 * CoursesList:
 * - Baca q/filter/sort dari URL (useSearchParams) → sinkron dengan Toolbar + SSR
 * - Skeleton shimmer singkat saat query berubah (anti flicker halus)
 */
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Course, User } from "@/types/course";
import CourseCard from "@/components/courses/CourseCard";
import { Skeleton } from "@/components/ui/Skeleton";

type Filter = "all" | "enrolled" | "not-enrolled";
type SortKey = "az" | "pop";

function toBool(v: unknown): boolean {
  return v === true || v === 1 || v === "1";
}

export default function CoursesList({
  me,
  courses,
  initialQ,
  initialFilter,
}: {
  me: User;
  courses: Course[];
  initialQ: string;
  initialFilter: Filter;
}) {
  const sp = useSearchParams();
  const [busy, setBusy] = useState(false);

  // Trigger shimmer singkat saat query berubah (UX halus)
  useEffect(() => {
    setBusy(true);
    const id = setTimeout(() => setBusy(false), 120);
    return () => clearTimeout(id);
  }, [sp?.toString()]); // perubahan apa pun di URL

  const q = sp.get("q") ?? initialQ;
  const filter: Filter =
    me.role === "mahasiswa"
      ? ["enrolled", "not-enrolled"].includes(sp.get("filter") ?? "")
        ? (sp.get("filter") as Filter)
        : initialFilter
      : "all";
  const sort: SortKey = sp.get("sort") === "pop" ? "pop" : "az";

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = courses;

    if (me.role === "mahasiswa") {
      if (filter === "enrolled")
        list = list.filter((c) => toBool(c.is_enrolled));
      if (filter === "not-enrolled")
        list = list.filter((c) => !toBool(c.is_enrolled));
    }

    if (term) {
      list = list.filter((c) => {
        const title = c.name?.toLowerCase() ?? "";
        const desc = c.description?.toLowerCase() ?? "";
        const lect = c.lecturer?.name?.toLowerCase() ?? "";
        return (
          title.includes(term) || desc.includes(term) || lect.includes(term)
        );
      });
    }

    // Sorting
    list =
      sort === "pop"
        ? [...list].sort(
            (a, b) => (b.students_count ?? 0) - (a.students_count ?? 0)
          )
        : [...list].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));

    return list;
  }, [q, filter, sort, courses, me]);

  // Skeleton shimmer ringan saat transisi query
  if (busy) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl ring-1 ring-gray-200 bg-white p-5 shadow-sm"
          >
            <Skeleton className="h-4 w-2/3 mb-4" />
            <Skeleton className="h-3 w-40 mb-2" />
            <Skeleton className="h-20 w-full mb-4" />
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed p-10 text-center text-gray-600">
        Tidak ada hasil sesuai filter/pencarian Anda.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {filtered.map((c) => (
        <CourseCard key={c.id} me={me} course={c} />
      ))}
    </div>
  );
}
