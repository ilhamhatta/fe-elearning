// src/app/(app)/discussions/page.tsx
// Server Component: redirect pintar ke diskusi course relevan
import { redirect } from "next/navigation";
import { apiJson } from "@/lib/apiGuard";

type Me = { id: number; role: "dosen" | "mahasiswa" };
type CourseLite = { id: number; is_enrolled?: boolean };

export default async function Page() {
  const me = await apiJson<Me>("/user", {}, { next: "/discussions" });
  const courses = await apiJson<CourseLite[]>(
    "/courses",
    {},
    { next: "/discussions" }
  );

  const targetId =
    me.role === "dosen"
      ? courses[0]?.id
      : courses.find((c) => c.is_enrolled)?.id;

  redirect(targetId ? `/courses/${targetId}/discussions` : "/courses");
}
