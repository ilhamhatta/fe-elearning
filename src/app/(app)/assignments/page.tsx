// src/app/(app)/assignments/page.tsx
import Link from "next/link";
import { apiJson } from "@/lib/apiGuard";

type User = {
  id: number;
  role: "dosen" | "mahasiswa";
  name?: string;
  email?: string;
};

type Course = {
  id: number;
  name: string;
  students_count?: number;
  is_enrolled?: boolean;
  lecturer_id: number;
  lecturer?: { id: number; name?: string } | null;
};

type AssignmentRow = {
  id: number;
  title: string;
  deadline: string; // ISO
  total_submissions: number;
  on_time: number;
  late: number;
  graded_count: number;
  avg_score: number | null;
};

type ReportAssignmentsResponse = { data: AssignmentRow[] };

export const dynamic = "force-dynamic";

export default async function AssignmentsPage({
  searchParams,
}: {
  searchParams?: { course?: string };
}) {
  // Guard 401/5xx handled by apiGuard (redirect)
  const me = await apiJson<User>("/user", {}, { next: "/assignments" });
  const isDosen = me.role === "dosen";

  // Ambil daftar course (role-aware di backend)
  const courses = await apiJson<Course[]>(
    "/courses",
    {},
    { next: "/assignments" }
  );

  // Tentukan courseId terpilih: query param > default (mahasiswa: yang di-enroll, dosen: pertama)
  const courseParam = searchParams?.course;
  const selectedId: number | null =
    courseParam && Number.isFinite(Number(courseParam))
      ? Number(courseParam)
      : isDosen
      ? courses[0]?.id ?? null
      : courses.find((c) => c.is_enrolled)?.id ?? null;

  // Ambil daftar assignments (dibungkus { data: [] } oleh backend)
  const assignmentsRes: ReportAssignmentsResponse =
    selectedId !== null
      ? await apiJson<ReportAssignmentsResponse>(
          `/reports/assignments?course_id=${selectedId}`,
          {},
          { next: "/assignments" }
        )
      : { data: [] };

  // Pastikan selalu array agar aman dipakai .map
  const assignments: AssignmentRow[] = Array.isArray(assignmentsRes.data)
    ? assignmentsRes.data
    : [];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Assignments</h1>
          <p className="text-sm text-gray-600">
            Kelola dan pantau tugas per mata kuliah.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDosen && (
            <Link
              href="/assignments/new"
              className="inline-flex items-center rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white shadow hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-indigo-200"
            >
              + Buat Tugas
            </Link>
          )}
        </div>
      </header>

      {/* Filter by Course */}
      <div className="flex flex-wrap items-center gap-3">
        <form
          action="/assignments"
          method="GET"
          className="flex items-center gap-2"
        >
          <label htmlFor="course" className="text-sm text-gray-700">
            Pilih Mata Kuliah
          </label>
          <select
            id="course"
            name="course"
            defaultValue={selectedId ?? ""}
            className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-200"
          >
            <option value="" disabled>
              -- pilih --
            </option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            type="submit"
          >
            Terapkan
          </button>
        </form>
      </div>

      {isDosen && selectedId !== null && (
        <div>
          <Link
            href={`/assignments/${selectedId}`}
            className="inline-flex items-center rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Kelola submissions
          </Link>
        </div>
      )}

      {/* Tabel assignments */}
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        {selectedId === null ? (
          <EmptyState text="Belum ada mata kuliah terpilih atau Anda belum terdaftar." />
        ) : assignments.length === 0 ? (
          <EmptyState text="Belum ada tugas pada mata kuliah ini." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-gray-600">
                <tr>
                  <th className="px-3 py-2">Judul</th>
                  <th className="px-3 py-2">Deadline</th>
                  <th className="px-3 py-2">Submit</th>
                  <th className="px-3 py-2">On-time</th>
                  <th className="px-3 py-2">Late</th>
                  <th className="px-3 py-2">Graded</th>
                  <th className="px-3 py-2">Rata</th>
                  {!isDosen && <th className="px-3 py-2">Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.id} className="border-t">
                    <td className="px-3 py-2 font-medium text-gray-900">
                      <Link
                        href={`/assignments/${a.id}`}
                        className="hover:underline focus:outline-none focus:ring-4 focus:ring-indigo-200 rounded-md"
                        aria-label={`Lihat submissions untuk ${a.title}`}
                      >
                        {a.title}
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      {new Date(a.deadline).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">{a.total_submissions}</td>
                    <td className="px-3 py-2">{a.on_time}</td>
                    <td className="px-3 py-2">{a.late}</td>
                    <td className="px-3 py-2">{a.graded_count}</td>
                    <td className="px-3 py-2">{a.avg_score ?? "—"}</td>
                    {!isDosen && (
                      <td className="px-3 py-2">
                        <Link
                          href={`/assignments/${a.id}/submit`}
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                        >
                          Upload Tugas
                        </Link>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Panel aksi dosen: Quick Grade by Submission ID (tanpa list submissions) */}
      {isDosen && (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <h3 className="mb-3 font-semibold text-gray-900">Quick Grade</h3>
          <p className="mb-4 text-sm text-gray-600">
            Masukkan ID submission dan skor. (Untuk daftar submissions per
            assignment, kita bisa tambah endpoint GET submissions nanti.)
          </p>
          <GradeSubmissionForm />
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
      {text}
    </div>
  );
}

// Client component kecil (import inline agar 1 file ini tetap server by default)
function GradeSubmissionForm() {
  // dummy wrapper untuk bundling — komponen aslinya terpisah di bawah
  return <_GradeSubmissionForm />;
}

// @ts-expect-error Server file, komponen client didefinisikan di bawah (file yang sama)
import _GradeSubmissionForm from "@/components/assignments/GradeSubmissionForm";
