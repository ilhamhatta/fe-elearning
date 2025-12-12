// src/app/(app)/dashboard/page.tsx
import Link from "next/link";
import { apiJson, apiJsonOptional } from "@/lib/apiGuard";

/** ===== Types sinkron dengan API backend ===== */
type User = {
  id: number;
  name?: string;
  email?: string;
  role?: "dosen" | "mahasiswa";
};

type Course = {
  id: number;
  name?: string;
  title?: string;
  code?: string;
  students_count?: number;
  is_enrolled?: boolean;
  lecturer_id?: number;
  lecturer?: { id: number; name?: string } | null;
};

type AssignmentRow = {
  id: number;
  title: string;
  deadline: string;
  total_submissions: number;
  on_time: number;
  late: number;
  graded_count: number;
  avg_score: number | null;
};

type ReportAssignmentsResponse = { data: AssignmentRow[] };

type StudentReportData = {
  student_id: number;
  courses_enrolled: number;
  assignments_total: number;
  submissions_made: number;
  on_time: number;
  late: number;
  avg_score: number | null;
  last_activity_unix: number | null;
  recent_submissions: {
    id: number;
    course_id: number;
    course_title: string;
    assignment_id: number;
    assignment_title: string;
    deadline: string;
    submitted_at: string | null;
    score: number | null;
  }[];
};
type ReportStudentResponse = { data: StudentReportData };

export default async function DashboardPage() {
  // 1) Guard login
  const me = await apiJson<User>("/user", {}, { next: "/dashboard" });
  const isDosen = me?.role === "dosen";

  // 2) Data dasar: daftar courses
  const courses = await apiJson<Course[]>(
    "/courses",
    {},
    { next: "/dashboard" }
  );

  // 3) Pilih courseId default (dosen: course pertama miliknya; mhs: course pertama yang di-enroll)
  const courseId: number | null = isDosen
    ? courses[0]?.id ?? null
    : courses.find((c) => c.is_enrolled)?.id ?? null;

  // 4) Ambil assignments (dibungkus { data: [] } oleh backend)
  const assignments: AssignmentRow[] = courseId
    ? (
        await apiJson<ReportAssignmentsResponse>(
          `/reports/assignments?course_id=${courseId}`,
          {},
          { next: "/dashboard" }
        )
      ).data ?? []
    : [];

  // 5) Derivatives untuk UI
  const myCourses: Course[] = isDosen
    ? courses
    : courses.filter((c) => c.is_enrolled === true);
  const totalCourses = myCourses.length;

  const graded = assignments.reduce((s, a) => s + (a.graded_count ?? 0), 0);
  const totalSubmissions = assignments.reduce(
    (s, a) => s + (a.total_submissions ?? 0),
    0
  );
  const ungraded = Math.max(0, totalSubmissions - graded);
  const totalAssignments = totalSubmissions; // progress penilaian berbasis jumlah submit

  // 6) Ringkasan per mahasiswa (dibungkus { data: {...} })
  const studentRes = await apiJsonOptional<ReportStudentResponse>(
    `/reports/students/${me.id}`,
    {},
    { next: "/dashboard", ignore: [404] }
  );
  const student = studentRes?.data;
  const avgScore = student?.avg_score ?? null;
  const submitted = student?.submissions_made ?? 0;
  const pending = Math.max(0, (student?.assignments_total ?? 0) - submitted);

  // 7) Top courses (by students_count)
  const topCourses = [...myCourses]
    .map((c) => ({
      id: c.id,
      name: c.name || c.title || "Tanpa nama",
      count: Number(c.students_count ?? 0),
      lecturer: c.lecturer?.name,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  const hasCourseContext = courseId !== null;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white p-6 shadow">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">
              Halo, {me?.name || me?.email} 👋
            </h1>
            <p className="text-white/90 mt-1">
              Selamat datang di dashboard E-Learning Anda.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            {isDosen ? (
              <Link
                href="/courses/new"
                className="rounded-lg bg-white/15 hover:bg-white/25 px-4 py-2 text-sm font-medium"
              >
                + Buat Mata Kuliah
              </Link>
            ) : (
              <Link
                href="/courses"
                className="rounded-lg bg-white/15 hover:bg-white/25 px-4 py-2 text-sm font-medium"
              >
                + Enroll Mata Kuliah
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={isDosen ? "Total Mata Kuliah" : "Kursus Diikuti"}
          value={totalCourses}
          hint={isDosen ? "Hanya milik Anda" : "Terdaftar saat ini"}
        />
        <StatCard
          title="Tugas Dinilai"
          value={graded}
          hint={`${totalAssignments} total submit`}
        />
        <StatCard title="Tugas Belum Dinilai" value={ungraded} danger />
        {isDosen ? (
          <StatCard
            title="Aktivitas Kelas"
            value={topCourses.reduce((s, c) => s + (c.count || 0), 0)}
            hint={`Total mahasiswa di ${topCourses.length} kelas teratas`}
          />
        ) : (
          <StatCard
            title="Rata-rata Nilai Saya"
            value={avgScore ?? "—"}
            hint={`${submitted} dikumpulkan • ${pending} menunggu`}
          />
        )}
      </section>

      {/* Panels */}
      <section className="grid gap-4 md:grid-cols-2">
        {/* Top courses */}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              {isDosen ? "Mata Kuliah Teratas" : "Kursus Teratas"}
            </h3>
            <Link
              href="/courses"
              className="text-sm text-indigo-700 hover:underline"
            >
              Lihat semua
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {topCourses.length ? (
              topCourses.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between rounded-xl border border-gray-200 p-3 hover:bg-gray-50 transition"
                >
                  <div className="min-w-0">
                    <div className="truncate text-gray-800 font-medium">
                      {c.name}
                    </div>
                    {!isDosen && c.lecturer && (
                      <div className="text-xs text-gray-500">
                        Dosen: {c.lecturer}
                      </div>
                    )}
                  </div>
                  <span className="text-sm rounded-md bg-gray-100 px-2 py-0.5 text-gray-600">
                    {c.count} mhs
                  </span>
                </li>
              ))
            ) : (
              <EmptyState
                text={isDosen ? "Belum ada data kursus." : "Belum ada kursus."}
              />
            )}
          </ul>
        </div>

        {/* Assignment status */}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              {isDosen ? "Status Penilaian" : "Status Tugas Saya"}
            </h3>
            <Link
              href="/assignments"
              className="text-sm text-indigo-700 hover:underline"
            >
              Kelola
            </Link>
          </div>

          {hasCourseContext ? (
            <>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <StatusPill label="Dinilai" value={graded} />
                <StatusPill label="Belum dinilai" value={ungraded} danger />
              </div>
              <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full bg-gradient-to-r from-indigo-600 to-fuchsia-600"
                  style={{
                    width: `${
                      totalAssignments ? (graded / totalAssignments) * 100 : 0
                    }%`,
                  }}
                />
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {totalAssignments
                  ? Math.round((graded / totalAssignments) * 100)
                  : 0}
                % submissions telah dinilai.
              </p>
            </>
          ) : (
            <div className="mt-4">
              <EmptyState text="Belum ada course terpilih atau belum ada course." />
            </div>
          )}
        </div>
      </section>

      {/* Kursus Saya / Diikuti */}
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            {isDosen ? "Kursus Saya" : "Kursus Diikuti"}
          </h3>
          <Link
            href="/courses"
            className="text-sm text-indigo-700 hover:underline"
          >
            Kelola kursus
          </Link>
        </div>

        <ul className="mt-4 space-y-3">
          {myCourses.slice(0, 5).length ? (
            myCourses.slice(0, 5).map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 p-3 hover:bg-gray-50 transition"
              >
                <div className="min-w-0">
                  <div className="truncate text-gray-800 font-medium">
                    {c.name || c.title || "Tanpa nama"}
                  </div>
                  {c.code && (
                    <div className="text-xs text-gray-500">{c.code}</div>
                  )}
                </div>
                {typeof c.students_count === "number" ? (
                  <span className="text-sm rounded-md bg-gray-100 px-2 py-0.5 text-gray-600">
                    {c.students_count} mhs
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">—</span>
                )}
              </li>
            ))
          ) : (
            <EmptyState
              text={
                isDosen
                  ? "Belum ada mata kuliah. Buat yang pertama!"
                  : "Belum mengikuti mata kuliah apa pun."
              }
            />
          )}
        </ul>
      </section>
    </div>
  );
}

/* ====== UI atoms ====== */
function StatCard({
  title,
  value,
  hint,
  danger,
}: {
  title: string;
  value: number | string;
  hint?: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 hover:shadow transition">
      <p className="text-sm text-gray-600">{title}</p>
      <div
        className={`mt-2 text-3xl font-bold ${
          danger ? "text-rose-600" : "text-gray-900"
        }`}
      >
        {typeof value === "number" ? value.toLocaleString("id-ID") : value}
      </div>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

function StatusPill({
  label,
  value,
  danger,
}: {
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 p-3">
      <div
        className={`text-2xl font-semibold ${
          danger ? "text-rose-600" : "text-gray-900"
        }`}
      >
        {value ?? 0}
      </div>
      <div className="text-sm text-gray-600">{label}</div>
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
