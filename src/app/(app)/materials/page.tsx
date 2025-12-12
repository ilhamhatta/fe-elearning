// src/app/(app)/materials/page.tsx
// Server Component: fetch data + render UI, TANPA event handler
import { redirect } from "next/navigation";
import { apiJson } from "@/lib/apiGuard";
import MaterialCard from "@/components/materials/MaterialCard";
import UploadMaterialForm from "@/components/materials/UploadMaterialForm";
import ConfirmDeleteMaterial from "@/components/materials/ConfirmDeleteMaterial";
import StatCard from "@/components/ui/StatCard";
import EmptyState from "@/components/ui/EmptyState";

type User = { id: number; name: string; role: "mahasiswa" | "dosen" };
type CourseLite = { id: number; name: string; lecturer_id?: number };
type MaterialItem = {
  id: number;
  course_id: number;
  name: string;
  filename: string | null;
  size: number;
  mime: string | null;
  uploaded_at: string | null;
  download_count: number;
  course?: { id: number; name: string | null };
};
type MaterialsResponse = {
  data: MaterialItem[];
  meta: { page: number; per_page: number; total: number };
};

// Bentuk kasar respons /courses (beragam), kita normalisasi tanpa any
type CourseApiItem = {
  id: number | string;
  name?: string;
  title?: string;
  lecturer_id?: number;
  lecturer?: { id?: number };
};
type CoursesApiResp =
  | { data?: CourseApiItem[]; courses?: CourseApiItem[] }
  | CourseApiItem[];

function normalizeCourses(resp: CoursesApiResp): CourseLite[] {
  const arr: CourseApiItem[] = Array.isArray(resp)
    ? resp
    : Array.isArray(resp.data)
    ? resp.data
    : Array.isArray(resp.courses)
    ? resp.courses
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
    .map((c) => {
      const id = toNum(c.id);
      const name = c.name ?? c.title ?? "Tanpa Nama";
      const lecturerId = c.lecturer_id ?? c.lecturer?.id;
      return id ? ({ id, name, lecturer_id: lecturerId } as CourseLite) : null;
    })
    .filter((x): x is CourseLite => !!x);
}

function sumBytes(list: MaterialItem[]) {
  return list.reduce((a, b) => a + (b.size || 0), 0);
}
function formatBytes(n: number) {
  if (!n) return "0 B";
  const u = ["B", "KB", "MB", "GB", "TB"];
  let i = 0,
    v = n;
  while (v >= 1024 && i < u.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${u[i]}`;
}

export default async function Page({
  searchParams,
}: {
  searchParams?: { q?: string; course_id?: string; page?: string };
}) {
  // Guard auth
  const me = await apiJson<User>("/user", {}, { next: "/materials" });
  if (!me) redirect("/login?next=/materials");

  // Query
  const q = searchParams?.q?.trim() ?? "";
  const courseId = searchParams?.course_id?.trim() ?? "";
  const page = searchParams?.page?.trim() ?? "1";

  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  if (courseId) qs.set("course_id", courseId);
  if (page) qs.set("page", page);

  // Data materials
  const materials = await apiJson<MaterialsResponse>(
    `/materials?${qs.toString()}`,
    {},
    { next: "/materials" }
  );

  // Courses milik dosen
  let ownedCourses: CourseLite[] = [];
  if (me.role === "dosen") {
    const raw = await apiJson<CoursesApiResp>(
      "/courses",
      {},
      { next: "/materials" }
    );
    ownedCourses = normalizeCourses(raw).filter((c) =>
      typeof c.lecturer_id === "number" ? c.lecturer_id === me.id : true
    );
  }

  const isDosen = me.role === "dosen";
  const totalOnPage = materials.data.length;
  const bytesOnPage = sumBytes(materials.data);
  const lastUploaded =
    materials.data.length > 0 ? materials.data[0].uploaded_at : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg bg-white p-5 shadow ring-1 ring-gray-100">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Materials</h1>
            <p className="text-sm text-gray-500">
              Kelola materi perkuliahan. Mahasiswa dapat mengunduh materi yang
              tersedia.
            </p>
          </div>
          {isDosen && (
            <a
              href="#upload"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2 text-sm font-medium text-white shadow ring-1 ring-indigo-200 hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-indigo-200"
            >
              + Upload Materi
            </a>
          )}
        </div>

        {/* Stats */}
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <StatCard label="Materi (halaman ini)" value={totalOnPage} />
          <StatCard
            label="Ukuran total (halaman ini)"
            value={formatBytes(bytesOnPage)}
          />
          <StatCard
            label="Upload terakhir"
            value={
              lastUploaded
                ? new Intl.DateTimeFormat("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(lastUploaded))
                : "—"
            }
          />
        </div>
      </div>

      {/* Filter/Search */}
      <form
        className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-100"
        method="GET"
      >
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label
              htmlFor="q"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Cari materi
            </label>
            <input
              id="q"
              name="q"
              defaultValue={q}
              placeholder="judul / nama file"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-200"
            />
          </div>
          <div>
            <label
              htmlFor="course_id"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Filter mata kuliah
            </label>
            <select
              id="course_id"
              name="course_id"
              defaultValue={courseId}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-200"
            >
              <option value="">Semua</option>
              {ownedCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              className="rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2 text-sm font-medium text-white shadow ring-1 ring-indigo-200 hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-indigo-200"
              type="submit"
            >
              Terapkan
            </button>
            <a
              href="/materials"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Reset
            </a>
          </div>
        </div>
      </form>

      {/* Upload */}
      {isDosen && (
        <section
          id="upload"
          className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-100"
        >
          <h2 className="mb-2 text-sm font-semibold text-gray-900">
            Upload Materi
          </h2>
          <p className="mb-4 text-xs text-gray-500">
            Format: pdf, docx, pptx, xls/xlsx, zip, mp4. Batas ukuran mengikuti
            kebijakan server.
          </p>
          <UploadMaterialForm courses={ownedCourses} />
        </section>
      )}

      {/* List */}
      {materials.data.length === 0 ? (
        <EmptyState
          title="Belum ada materi"
          description={
            isDosen
              ? "Unggah materi pertama Anda untuk mulai membagikan ke mahasiswa."
              : "Tidak ada materi untuk ditampilkan saat ini."
          }
          actionLabel={isDosen ? "Upload Sekarang" : undefined}
          actionHref={isDosen ? "#upload" : undefined}
        />
      ) : (
        <section className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {materials.data.map((m) => (
              <MaterialCard
                key={m.id}
                m={m}
                // server component tidak mengimpor client component secara langsung;
                // kita kirim sebagai "actions" (slot) agar aman.
                actions={isDosen ? <ConfirmDeleteMaterial id={m.id} /> : null}
              />
            ))}
          </div>

          {/* Pagination */}
          {materials.meta.total > materials.meta.per_page && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <div>
                Halaman {materials.meta.page} • Total {materials.meta.total}
              </div>
              <div className="flex gap-2">
                {materials.meta.page > 1 && (
                  <a
                    className="rounded-lg border border-gray-300 px-3 py-1.5 shadow-sm hover:bg-gray-50"
                    href={`?${new URLSearchParams({
                      ...Object.fromEntries(qs),
                      page: String(materials.meta.page - 1),
                    }).toString()}`}
                  >
                    Sebelumnya
                  </a>
                )}
                {materials.meta.page * materials.meta.per_page <
                  materials.meta.total && (
                  <a
                    className="rounded-lg border border-gray-300 px-3 py-1.5 shadow-sm hover:bg-gray-50"
                    href={`?${new URLSearchParams({
                      ...Object.fromEntries(qs),
                      page: String(materials.meta.page + 1),
                    }).toString()}`}
                  >
                    Berikutnya
                  </a>
                )}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
