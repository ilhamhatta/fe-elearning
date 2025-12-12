// src/components/CoursesToolbar.tsx
"use client";
/**
 * Toolbar Courses (sticky + blur)
 * - Source of truth: URL query (?q=, ?filter=, ?sort=)
 * - Dosen: hanya input cari + total
 * - Mahasiswa: filter (Semua/Terdaftar/Belum) + sort (A–Z / Populer)
 */
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { User } from "@/types/course";

type Filter = "all" | "enrolled" | "not-enrolled";
type SortKey = "az" | "pop";

export default function CoursesToolbar({
  me,
  total,
  initialQ,
  initialFilter,
}: {
  me: User;
  total: number;
  initialQ: string;
  initialFilter: Filter;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [q, setQ] = useState<string>(initialQ);

  // Ambil filter & sort dari URL agar tombol terlihat aktif sesuai SSR
  const currentFilter: Filter = useMemo(() => {
    const raw = sp.get("filter");
    if (me.role === "mahasiswa") {
      return raw === "enrolled" || raw === "not-enrolled"
        ? (raw as Filter)
        : initialFilter;
    }
    return "all";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp, me.role]);
  const currentSort: SortKey = useMemo(() => {
    const raw = sp.get("sort");
    return raw === "pop" ? "pop" : "az";
  }, [sp]);

  // Debounce update query untuk q agar halus
  useEffect(() => {
    const id = setTimeout(() => {
      const params = new URLSearchParams(sp?.toString());
      if (q && q.trim().length > 0) params.set("q", q);
      else params.delete("q");
      if (me.role === "dosen") params.delete("filter"); // dosen tidak pakai filter
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, me.role]);

  function setFilter(next: Filter) {
    const params = new URLSearchParams(sp?.toString());
    if (me.role === "mahasiswa") {
      if (next === "all") params.delete("filter");
      else params.set("filter", next);
    } else {
      params.delete("filter");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function setSort(next: SortKey) {
    const params = new URLSearchParams(sp?.toString());
    if (next === "az") params.delete("sort");
    else params.set("sort", next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="sticky top-4 z-10 rounded-2xl ring-1 ring-gray-200 bg-white/80 backdrop-blur p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <input
            placeholder="Cari mata kuliah atau dosen…"
            aria-label="Cari mata kuliah"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-72 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-200"
          />
          <span className="text-sm text-gray-600">
            Total: <span className="font-medium text-gray-900">{total}</span>
          </span>
        </div>

        {me.role === "mahasiswa" && (
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-2xl ring-1 ring-gray-200 bg-gray-50 p-1">
              {(["all", "enrolled", "not-enrolled"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setFilter(k)}
                  className={`px-3 py-1.5 text-sm rounded-xl transition ${
                    currentFilter === k
                      ? "bg-white shadow ring-1 ring-gray-200 text-gray-900"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  {k === "all"
                    ? "Semua"
                    : k === "enrolled"
                    ? "Terdaftar"
                    : "Belum"}
                </button>
              ))}
            </div>

            <select
              aria-label="Urutkan"
              onChange={(e) => setSort(e.target.value === "pop" ? "pop" : "az")}
              value={currentSort}
              className="rounded-xl border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-200"
            >
              <option value="az">A–Z</option>
              <option value="pop">Terbanyak peserta</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
