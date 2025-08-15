// src/app/api/materials/route.ts
import { NextRequest, NextResponse } from "next/server";
import { serverFetch, ApiError } from "@/lib/serverFetch";

/**
 * Proxy ke Laravel: POST /materials (form-data)
 * Field: course_id, title, file
 * Dipanggil via fetch (X-Requested-With: fetch) → JSON
 */
export async function POST(req: NextRequest) {
  const isFetch = req.headers.get("x-requested-with") === "fetch";
  try {
    const form = await req.formData();
    const course_id = String(form.get("course_id") ?? "");
    const title = String(form.get("title") ?? "");
    const file = form.get("file");

    // Validasi minimal di edge: biar cepat feedback
    if (!course_id || !title || !file || typeof file === "string") {
      return NextResponse.json(
        { message: "course_id, title, dan file wajib diisi." },
        { status: 422 }
      );
    }

    // Kirim ulang sebagai FormData ke Laravel (biarkan boundary ditangani otomatis)
    const upstream = new FormData();
    upstream.set("course_id", course_id);
    upstream.set("title", title);
    upstream.set("file", file as File);

    await serverFetch("/materials", { method: "POST", body: upstream });

    return isFetch
      ? NextResponse.json({ ok: true })
      : NextResponse.redirect(new URL("/materials", req.url));
  } catch (e) {
    if (e instanceof ApiError) {
      return NextResponse.json(
        { message: e.message, status: e.status },
        { status: e.status }
      );
    }
    return NextResponse.json(
      { message: "Gagal mengunggah materi." },
      { status: 500 }
    );
  }
}
