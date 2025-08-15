// src/app/(app)/courses/new/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { serverFetch, ApiError } from "@/lib/serverFetch";
import CreateCourseForm from "@/components/forms/CreateCourseForm";

export default async function Page() {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) redirect("/login?next=/courses/new");

  try {
    await serverFetch("/user", { method: "GET" });
  } catch (e) {
    if (e instanceof ApiError && e.status === 401)
      redirect("/login?next=/courses/new");
    throw e;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Buat Mata Kuliah</h1>
      <CreateCourseForm action="/api/courses" />
    </div>
  );
}
