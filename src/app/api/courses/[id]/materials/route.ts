// src/app/api/courses/[id]/materials/route.ts
import { NextResponse } from "next/server";
import { serverFetch, ApiError } from "@/lib/serverFetch";

type Material = {
  id: number;
  name?: string | null;
  filename?: string | null;
  size?: number | null;
  uploaded_at?: string | null;
};

function normalize(u: unknown): Material | null {
  const o = u as Record<string, unknown>;
  const id = Number(o.id);
  if (!Number.isFinite(id)) return null;

  const name =
    typeof o.name === "string"
      ? o.name
      : typeof o.title === "string"
      ? (o.title as string)
      : null;

  const filename =
    typeof o.filename === "string"
      ? (o.filename as string)
      : typeof o.file_name === "string"
      ? (o.file_name as string)
      : typeof o.file_path === "string"
      ? (o.file_path as string).split("/").pop() || null
      : null;

  const rawSize = o.size;
  const size =
    typeof rawSize === "number"
      ? rawSize
      : typeof rawSize === "string" && !Number.isNaN(Number(rawSize))
      ? Number(rawSize)
      : null;

  const uploaded_at =
    typeof o.uploaded_at === "string"
      ? (o.uploaded_at as string)
      : typeof o.created_at === "string"
      ? (o.created_at as string)
      : null;

  return { id, name, filename, size, uploaded_at };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> } // Next.js App Router: params harus di-await
) {
  const { id } = await params;
  try {
    const res = await serverFetch(
      `/materials?course_id=${encodeURIComponent(id)}`,
      {
        method: "GET",
      }
    );
    const json = (await res.json()) as { materials?: unknown[] } | unknown[];
    const arr = Array.isArray(json)
      ? json
      : Array.isArray(json.materials)
      ? json.materials!
      : [];
    const materials = arr
      .map(normalize)
      .filter((m): m is Material => m !== null);
    return NextResponse.json({ materials });
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 401) {
        return NextResponse.json(
          { message: "Unauthenticated" },
          { status: 401 }
        );
      }
      return NextResponse.json({ message: e.message }, { status: e.status });
    }
    return NextResponse.json(
      { message: "Terjadi kesalahan tak terduga." },
      { status: 500 }
    );
  }
}
