// src/app/(app)/assignments/new/page.tsx
import { apiJson } from "@/lib/apiGuard";
import CreateAssignmentForm from "@/components/assignments/CreateAssignmentForm";

type User = { id: number; role: "dosen" | "mahasiswa" };
type Course = { id: number; name: string; lecturer_id: number };

export default async function NewAssignmentPage() {
  // Guard
  const me = await apiJson<User>("/user", {}, { next: "/assignments/new" });
  if (me.role !== "dosen") {
    // biar aman, meski backend juga cek role saat POST
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
        Hanya dosen yang bisa membuat tugas.
      </div>
    );
  }

  // Ambil courses milik dosen
  const courses = await apiJson<Course[]>(
    "/courses",
    {},
    { next: "/assignments/new" }
  );

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Buat Tugas</h1>
      <CreateAssignmentForm courses={courses} />
    </div>
  );
}
