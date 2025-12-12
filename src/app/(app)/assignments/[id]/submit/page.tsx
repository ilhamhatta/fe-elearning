// src/app/(app)/assignments/[id]/submit/page.tsx
import UploadAssignmentForm from "@/components/assignments/UploadAssignmentForm";
import { apiJson } from "@/lib/apiGuard";

type User = { id: number; role: "dosen" | "mahasiswa" };

export default async function SubmitAssignmentPage({
  params,
}: {
  params: { id: string };
}) {
  // Guard (mahasiswa)
  const me = await apiJson<User>(
    "/user",
    {},
    { next: `/assignments/${params.id}/submit` }
  );
  if (me.role !== "mahasiswa") {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
        Hanya mahasiswa yang dapat mengumpulkan tugas.
      </div>
    );
  }

  const assignmentId = Number(params.id);
  if (!Number.isFinite(assignmentId)) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
        Assignment ID tidak valid.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Upload Tugas</h1>
      <UploadAssignmentForm assignmentId={assignmentId} />
    </div>
  );
}
