// src/components/courses/CourseMaterialsSection.tsx
// Server Component: tarik data materials per course & render daftar
import MaterialCard from "@/components/materials/MaterialCard";
import ConfirmDeleteMaterial from "@/components/materials/ConfirmDeleteMaterial";
import UploadMaterialForCourse from "@/components/materials/UploadMaterialForCourse";
import EmptyState from "@/components/ui/EmptyState";
import { apiJson } from "@/lib/apiGuard";

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

export default async function CourseMaterialsSection({
  courseId,
  isOwner,
}: {
  courseId: number;
  isOwner: boolean; // dosen pemilik course?
}) {
  const materials = await apiJson<MaterialsResponse>(
    `/materials?course_id=${courseId}&per_page=50`,
    {},
    { next: `/courses/${courseId}` }
  );

  return (
    <section className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-100">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Materi</h2>
        {isOwner && <UploadMaterialForCourse courseId={courseId} />}
      </div>

      {materials.data.length === 0 ? (
        <EmptyState
          title="Belum ada materi."
          description={
            isOwner
              ? "Unggah materi pertama Anda untuk mulai membagikan ke mahasiswa."
              : "Belum tersedia materi untuk mata kuliah ini."
          }
          actionLabel={isOwner ? "Upload Materi" : undefined}
          actionHref={isOwner ? "#upload-materi" : undefined}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {materials.data.map((m) => (
            <MaterialCard
              key={m.id}
              m={m}
              actions={isOwner ? <ConfirmDeleteMaterial id={m.id} /> : null}
            />
          ))}
        </div>
      )}
    </section>
  );
}
import * as React from "react";
