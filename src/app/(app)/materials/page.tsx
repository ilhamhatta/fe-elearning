// src/app/(app)/materials/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { serverFetch, ApiError } from "@/lib/serverFetch";
import UploadMaterialForm from "@/components/forms/UploadMaterialForm";
import DownloadMaterialBox from "@/components/DownloadMaterialBox";

type User = { id: number; name: string; role: "mahasiswa" | "dosen" };
type Course = { id: number | string; name: string };

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
  if (!token) redirect("/login?next=/materials");

  let me: User;
  try {
    const u = await serverFetch("/user", { method: "GET" });
    me = (await u.json()) as User;
  } catch (e) {
    if (e instanceof ApiError && e.status === 401)
      redirect("/login?next=/materials");
    throw e;
  }

  // dropdown courses untuk upload
  const listRes = await serverFetch("/courses", { method: "GET" });
  const raw = (await listRes.json()) as unknown;
  const courses = coerceCourseList(raw);

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-gray-200/70 bg-gradient-to-r from-indigo-600/10 via-transparent to-fuchsia-600/10 p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Materials</h1>
        <p className="mt-1 text-sm text-gray-600">
          Upload & unduh materi perkuliahan.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload hanya untuk Dosen */}
        {me.role === "dosen" && (
          <div className="rounded-2xl ring-1 ring-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">
              Upload Materi
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Unggah file materi untuk mata kuliah tertentu.
            </p>
            <div className="mt-4">
              <UploadMaterialForm
                action="/api/materials"
                courses={courses.map((c) => ({
                  id: Number(c.id),
                  name: c.name,
                }))}
              />
            </div>
          </div>
        )}

        {/* Download untuk semua role */}
        <div className="rounded-2xl ring-1 ring-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">
            Unduh Materi
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Masukkan <span className="font-medium">ID materi</span> yang ingin
            diunduh.
          </p>
          <div className="mt-4">
            <DownloadMaterialBox />
          </div>
        </div>
      </div>
    </div>
  );
}
