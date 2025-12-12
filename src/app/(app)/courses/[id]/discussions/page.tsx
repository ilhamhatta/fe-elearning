// src/app/(app)/courses/[id]/discussions/page.tsx
// Server Component: daftar topik per course — sudah kompatibel Next 15.4 & tanpa warning
import Link from "next/link";
import { apiJson, apiJsonOptional } from "@/lib/apiGuard";

type TopicRow = {
  id: number;
  course_id: number;
  title: string;
  body: string;
  replies_count: number;
  last_activity_at: string;
  author: { id: number; name: string; email: string };
};
type ListResp = {
  data: TopicRow[];
  meta?: { current_page: number; last_page: number };
};

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  await apiJson("/user", {}, { next: `/courses/${id}/discussions` });

  const page = Math.max(1, parseInt(sp?.page ?? "1", 10) || 1);
  const q = sp?.q ?? "";

  // Tambah ignore 500 agar list tidak menjatuhkan halaman
  const res = await apiJsonOptional<ListResp>(
    `/courses/${id}/discussions?page=${page}&q=${encodeURIComponent(q)}`,
    {},
    { next: `/courses/${id}/discussions`, ignore: [403, 404, 500] }
  );

  if (!res) {
    return (
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Diskusi Kelas</h1>
          <Link
            href={`/courses/${id}`}
            className="text-sm text-indigo-700 hover:underline"
          >
            ← Kembali ke Course
          </Link>
        </header>
        <div className="rounded-2xl border border-dashed p-6 text-sm text-gray-600">
          Anda belum terdaftar pada mata kuliah ini. Enroll untuk melihat dan
          membuat diskusi.
        </div>
      </div>
    );
  }

  const rows = res.data ?? [];
  const meta = res.meta ?? { current_page: 1, last_page: 1 };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Diskusi Kelas</h1>
          <p className="text-sm text-gray-600">
            Course #{id}. Diskusikan materi dan tugas di sini.
          </p>
        </div>
        <NewDiscussionButton courseId={Number(id)} />
      </header>

      <form
        action={`/courses/${id}/discussions`}
        method="GET"
        className="flex items-center gap-2"
      >
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Cari topik…"
          className="w-full max-w-sm rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-200"
          aria-label="Cari topik"
        />
        <button
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          type="submit"
        >
          Cari
        </button>
      </form>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        {rows.length === 0 ? (
          <p className="text-sm text-gray-500">Belum ada topik.</p>
        ) : (
          <ul className="divide-y">
            {rows.map((d) => (
              <li
                key={d.id}
                className="flex items-start justify-between gap-4 py-3"
              >
                <div className="min-w-0">
                  <Link
                    href={`/discussions/${d.id}`}
                    className="font-medium text-gray-900 hover:underline"
                  >
                    {d.title}
                  </Link>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                    {d.body}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {d.replies_count} balasan • aktivitas terakhir{" "}
                    {new Date(d.last_activity_at).toLocaleString()}
                  </p>
                </div>
                <Link
                  href={`/discussions/${d.id}`}
                  className="rounded-xl border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                >
                  Buka
                </Link>
              </li>
            ))}
          </ul>
        )}

        {meta.last_page > 1 && (
          <div className="mt-4 flex items-center gap-2">
            <Link
              href={`/courses/${id}/discussions?page=${Math.max(
                1,
                meta.current_page - 1
              )}&q=${encodeURIComponent(q)}`}
              className="rounded-xl border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
            >
              ← Prev
            </Link>
            <span className="text-xs text-gray-600">
              Hal {meta.current_page} / {meta.last_page}
            </span>
            <Link
              href={`/courses/${id}/discussions?page=${Math.min(
                meta.last_page,
                meta.current_page + 1
              )}&q=${encodeURIComponent(q)}`}
              className="rounded-xl border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
            >
              Next →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

import NewDiscussionButton from "@/components/discussions/NewDiscussionButton";
