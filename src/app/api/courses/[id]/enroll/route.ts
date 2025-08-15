// src/app/api/courses/[id]/enroll/route.ts
import { NextRequest, NextResponse } from "next/server";
import { serverFetch, ApiError } from "@/lib/serverFetch";

/**
 * Enroll mahasiswa → proxy ke Laravel POST /courses/{id}/enroll
 * Body opsional: { course_id: id } (mengikuti contoh koleksi Postman)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    await serverFetch(`/courses/${id}/enroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ course_id: id }),
    });
    if (req.headers.get("x-requested-with") === "fetch") {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.redirect(new URL("/courses", req.url));
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 401) {
        return NextResponse.redirect(new URL("/login?next=/courses", req.url));
      }
      return NextResponse.json(
        { message: e.message, status: e.status },
        { status: e.status }
      );
    }
    return NextResponse.json({ message: "Gagal enroll." }, { status: 500 });
  }
}
