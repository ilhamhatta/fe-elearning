// src/app/(app)/assignments/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiJson } from "@/lib/apiGuard";

/** ===== Types sinkron dgn backend ===== */
type User = {
  id: number;
  role: "dosen" | "mahasiswa";
  name?: string;
  email?: string;
};

type SubmissionRow = {
  id: number;
  student: { id: number; name: string; email: string };
  submitted_at: string | null;
  is_late: boolean;
  score: number | null;
  graded_at: string | null;
};
type SubmissionsResponse = { data: SubmissionRow[] };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next 15: params harus di-await
  const { id } = await params;

  // Guard login (401 → redirect di apiGuard)
  const me = await apiJson<User>("/user", {}, { next: `/assignments/${id}` });

  // Ambil list submissions (dibungkus { data: [...] })
  let rows: SubmissionRow[] = [];
  try {
    const res = await apiJson<SubmissionsResponse>(
      `/assignments/${id}/submissions`,
      {},
      { next: `/assignments/${id}` }
    );
    rows = Array.isArray(res.data) ? res.data : [];
  } catch {
    notFound();
  }

  const isDosen = me.role === "dosen";

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Submissions Assignment #{id}
          </h1>
          <p className="text-sm text-gray-600">
            {isDosen
              ? "Nilai kiriman mahasiswa di bawah ini."
              : "Lihat status kiriman Anda untuk assignment ini."}
          </p>
        </div>
        <Link
          href="/assignments"
          className="text-sm text-indigo-700 hover:underline"
        >
          ← Kembali
        </Link>
      </header>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        {rows.length === 0 ? (
          <Empty
            text={
              isDosen
                ? "Belum ada submission."
                : "Anda belum mengirim submission."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-gray-600">
                <tr>
                  <th className="px-3 py-2">Mahasiswa</th>
                  <th className="px-3 py-2">Submitted</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Skor</th>
                  {isDosen && <th className="px-3 py-2">Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-3 py-2">
                      <div className="font-medium text-gray-900">
                        {r.student.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {r.student.email}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {r.submitted_at
                        ? new Date(r.submitted_at).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                          r.is_late
                            ? "bg-rose-100 text-rose-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {r.is_late ? "Late" : "On-time"}
                      </span>
                    </td>
                    <td className="px-3 py-2">{r.score ?? "—"}</td>
                    {isDosen && (
                      <td className="px-3 py-2">
                        {/* Client component untuk submit nilai */}
                        <InlineGrade
                          submissionId={r.id}
                          initialScore={r.score}
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tombol aksi untuk mahasiswa (opsional) */}
        {!isDosen && (
          <div className="mt-4">
            <Link
              href={`/assignments/${id}/submit`}
              className="inline-flex items-center rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white shadow hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-indigo-200"
            >
              {rows.length ? "Perbarui Submission" : "Upload Submission"}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
      {text}
    </div>
  );
}

// @ts-expect-error Server file — komponen client di bawah (file berbeda)
import InlineGrade from "@/components/assignments/InlineGrade";
