// src/app/(app)/courses/[id]/edit/page.tsx
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { serverFetch, ApiError } from "@/lib/serverFetch";
import EditCourseForm from "@/components/forms/EditCourseForm";

type Course = {
  id: number | string;
  name: string;
  description?: string | null;
  lecturer_id?: number | null;
};

type Params = { params: { id: string } };

// helper untuk respons { data: [...] } / langsung []
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

export default async function Page({ params }: Params) {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) redirect(`/login?next=/courses/${params.id}/edit`);

  try {
    await serverFetch("/user", { method: "GET" });
  } catch (e) {
    if (e instanceof ApiError && e.status === 401)
      redirect(`/login?next=/courses/${params.id}/edit`);
    throw e;
  }

  // Tidak ada GET /courses/{id} di spesifikasi → ambil list lalu cari id
  const listRes = await serverFetch("/courses", { method: "GET" });
  const raw = (await listRes.json()) as unknown;
  const all = coerceCourseList(raw);

  const idNum = Number(params.id);
  const course = all.find((c) => Number(c.id) === idNum);
  if (!course) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Edit Mata Kuliah</h1>

      <EditCourseForm
        action={`/api/courses/${course.id}`}
        initialName={course.name}
        initialDescription={course.description ?? ""}
      />
    </div>
  );
}
