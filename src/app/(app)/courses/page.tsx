// src/app/(app)/courses/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { serverFetch, ApiError } from "@/lib/serverFetch";
import EnrollButton from "@/components/EnrollButton";
import ConfirmDeleteCourse from "@/components/ConfirmDeleteCourse";
import StatCard from "@/components/StatCard";

type User = {
  id: number;
  name: string;
  email: string;
  role: "mahasiswa" | "dosen";
};
export type Course = {
  id: number | string;
  name: string;
  description?: string | null;
  lecturer_id?: number | null;
};

// type guard kecil
function hasArrayProp<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, Course[]> {
  if (typeof obj !== "object" || obj === null) return false;
  const rec = obj as Record<string, unknown>;
  return Array.isArray(rec[key]);
}
function coerceCourseList(payload: unknown): Course[] {
  if (Array.isArray(payload)) return payload as Course[];
  if (hasArrayProp(payload, "data"))
    return (payload as Record<"data", Course[]>).data;
  if (hasArrayProp(payload, "items"))
    return (payload as Record<"items", Course[]>).items;
  if (hasArrayProp(payload, "courses"))
    return (payload as Record<"courses", Course[]>).courses;
  return [];
}

export default async function Page() {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) redirect("/login?next=/courses");

  try {
    await serverFetch("/user", { method: "GET" });
  } catch (e) {
    if (e instanceof ApiError && e.status === 401)
      redirect("/login?next=/courses");
    throw e;
  }

  const meRes = await serverFetch("/user", { method: "GET" });
  const me = (await meRes.json()) as User;

  const listRes = await serverFetch("/courses", { method: "GET" });
  const raw = (await listRes.json()) as unknown;
  const courses = coerceCourseList(raw);

  return (
    <div className="space-y-8">
      {/* Header modern dengan stat & CTA */}
      <div className="rounded-2xl border border-gray-200/70 bg-gradient-to-r from-indigo-600/10 via-transparent to-fuchsia-600/10 p-6 shadow-sm">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Mata Kuliah</h1>
            <p className="mt-1 text-sm text-gray-600">
              Kelola daftar mata kuliah dan pendaftaran mahasiswa.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <StatCard
              title="Total"
              value={courses.length}
              ariaLabel="Total mata kuliah"
            />
            {me.role === "dosen" && (
              <Link
                href="/courses/new"
                className="inline-flex items-center rounded-lg bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-white shadow hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-indigo-200"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="mr-2 h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M10 4a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2h-4v4a1 1 0 1 1-2 0v-4H5a1 1 0 1 1 0-2h4V5a1 1 0 0 1 1-1z" />
                </svg>
                Buat Mata Kuliah
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Daftar / Empty state */}
      {courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600/10 to-fuchsia-600/10">
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6 text-gray-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M4 6.75A2.75 2.75 0 0 1 6.75 4h10.5A2.75 2.75 0 0 1 20 6.75v10.5A2.75 2.75 0 0 1 17.25 20H6.75A2.75 2.75 0 0 1 4 17.25V6.75z" />
              <path d="M8 8h8M8 12h6M8 16h4" />
            </svg>
          </div>
          <h2 className="mt-4 text-base font-semibold text-gray-900">
            Belum ada mata kuliah
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Mulai dengan membuat mata kuliah pertama.
          </p>
          {me.role === "dosen" && (
            <div className="mt-6">
              <Link
                href="/courses/new"
                className="inline-flex items-center rounded-lg bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-white shadow hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-indigo-200"
              >
                Buat Mata Kuliah
              </Link>
            </div>
          )}
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <li
              key={String(c.id)}
              className="group rounded-2xl ring-1 ring-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {c.name}
                  </h3>
                  {c.description && (
                    <p className="mt-1 line-clamp-3 text-sm leading-6 text-gray-600">
                      {c.description}
                    </p>
                  )}
                </div>
                {c.lecturer_id ? (
                  <span className="whitespace-nowrap rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                    Dosen
                  </span>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {me.role === "mahasiswa" && (
                  <EnrollButton courseId={Number(c.id)} />
                )}

                {me.role === "dosen" && (
                  <>
                    <Link
                      href={`/courses/${c.id}/edit`}
                      className="inline-flex items-center rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100 focus:outline-none focus:ring-4 focus:ring-indigo-200"
                    >
                      <svg
                        viewBox="0 0 20 20"
                        className="mr-1.5 h-4 w-4"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M12.293 2.293a1 1 0 0 1 1.414 0l4 4a1 1 0 0 1 0 1.414l-8.5 8.5a1 1 0 0 1-.45.26l-4 1a1 1 0 0 1-1.213-1.213l1-4a1 1 0 0 1 .26-.45l8.5-8.5zM11 4l5 5" />
                      </svg>
                      Edit
                    </Link>

                    <ConfirmDeleteCourse id={Number(c.id)} name={c.name} />
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
