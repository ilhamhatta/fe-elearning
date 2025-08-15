// src/app/(app)/dashboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError, serverFetch } from "@/lib/serverFetch";

type User = {
  id: number;
  name?: string;
  email?: string;
  role?: "dosen" | "mahasiswa";
};
type CourseStat = {
  course?: string;
  name?: string;
  students?: number;
  students_count?: number;
  total?: number;
};
type CoursesResponse = CourseStat[] | { data?: CourseStat[]; total?: number };

type AssignmentStat = {
  graded?: number;
  ungraded?: number;
  total?: number;
  dinilai?: number;
  belum_dinilai?: number;
};
type StudentStats = {
  avg_score?: number;
  rata_rata?: number;
  submitted?: number;
  tugas_dikumpulkan?: number;
  pending?: number;
  tugas_belum?: number;
};

export default async function DashboardPage() {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) redirect("/login?next=/dashboard");

  let me: User;
  try {
    me = await (await serverFetch("/user", { method: "GET" })).json();
  } catch (e) {
    // jika token invalid/expired di Laravel → 401
    if (e instanceof ApiError && e.status === 401) {
      redirect("/login?next=/dashboard");
    }
    throw e; // selain 401, biarkan error asli muncul
  }

  // ----- Courses
  let rawCourses: CoursesResponse | null = null;
  try {
    rawCourses = await (
      await serverFetch("/reports/courses", { method: "GET" })
    ).json();
  } catch {}

  let coursesData: CourseStat[] = [];
  let coursesTotalFromObj: number | undefined;

  if (Array.isArray(rawCourses)) {
    coursesData = rawCourses;
  } else if (rawCourses && typeof rawCourses === "object") {
    if (Array.isArray(rawCourses.data)) coursesData = rawCourses.data;
    if (typeof rawCourses.total === "number")
      coursesTotalFromObj = rawCourses.total;
  }

  // ----- Assignments
  let assignments: AssignmentStat = {};
  try {
    assignments = await (
      await serverFetch("/reports/assignments", { method: "GET" })
    ).json();
  } catch {}

  // ----- Student (opsional)
  let student: StudentStats | null = null;
  if (me?.id) {
    try {
      student = await (
        await serverFetch(`/reports/students/${me.id}`, { method: "GET" })
      ).json();
    } catch {}
  }

  // ----- Derivatives
  const totalCourses =
    typeof coursesTotalFromObj === "number"
      ? coursesTotalFromObj
      : coursesData.length;

  const graded = Number(assignments.dinilai ?? assignments.graded ?? 0);
  const ungraded = Number(
    assignments.belum_dinilai ?? assignments.ungraded ?? 0
  );
  const totalAssignments = Number(assignments.total ?? graded + ungraded);

  const avgScore = student
    ? Number(student.rata_rata ?? student.avg_score ?? 0)
    : null;
  const submitted = student
    ? Number(student.tugas_dikumpulkan ?? student.submitted ?? 0)
    : 0;
  const pending = student
    ? Number(student.tugas_belum ?? student.pending ?? 0)
    : 0;

  const topCourses = coursesData
    .map((c) => ({
      name: c.name || c.course || "Tanpa nama",
      count: Number(c.students ?? c.students_count ?? c.total ?? 0),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  const isDosen = me?.role === "dosen";

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
              <a
                href="/courses/new"
                className="rounded-lg bg-white/15 hover:bg-white/25 px-4 py-2 text-sm font-medium"
              >
                + Buat Mata Kuliah
              </a>
            ) : (
              <a
                href="/courses"
                className="rounded-lg bg-white/15 hover:bg-white/25 px-4 py-2 text-sm font-medium"
              >
                + Enroll Mata Kuliah
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Mata Kuliah"
          value={totalCourses}
          hint="Dari laporan kursus"
        />
        <StatCard
          title="Tugas Dinilai"
          value={graded}
          hint={`${totalAssignments} total`}
        />
        <StatCard title="Tugas Belum Dinilai" value={ungraded} danger />
        {isDosen ? (
          <StatCard
            title="Aktivitas Kelas"
            value={topCourses.reduce((s, c) => s + (c.count || 0), 0)}
            hint="Total mahasiswa di 4 kelas teratas"
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
            <h3 className="font-semibold text-gray-900">Mata Kuliah Teratas</h3>
            <a
              href="/courses"
              className="text-sm text-indigo-700 hover:underline"
            >
              Lihat semua
            </a>
          </div>
          <ul className="mt-4 space-y-3">
            {topCourses.length ? (
              topCourses.map((c, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-gray-200 p-3 hover:bg-gray-50 transition"
                >
                  <span className="text-gray-800">{c.name}</span>
                  <span className="text-sm rounded-md bg-gray-100 px-2 py-0.5 text-gray-600">
                    {c.count} mhs
                  </span>
                </li>
              ))
            ) : (
              <EmptyState text="Belum ada data kursus." />
            )}
          </ul>
        </div>

        {/* Assignment status */}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              {isDosen ? "Status Penilaian" : "Status Tugas Saya"}
            </h3>
            <a
              href="/assignments"
              className="text-sm text-indigo-700 hover:underline"
            >
              Kelola
            </a>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <StatusPill label="Dinilai" value={graded} />
            <StatusPill label="Belum dinilai" value={ungraded} danger />
            {!isDosen && (
              <>
                <StatusPill label="Dikumpulkan" value={submitted} />
                <StatusPill label="Menunggu" value={pending} />
              </>
            )}
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
            % tugas sudah dinilai.
          </p>
        </div>
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
