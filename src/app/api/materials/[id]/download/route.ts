// src/app/api/materials/[id]/download/route.ts
import { NextRequest, NextResponse } from "next/server";
import { serverFetch, ApiError } from "@/lib/serverFetch";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  try {
    // Minta file dari Laravel
    const res = await serverFetch(`/materials/${id}/download`, {
      method: "GET",
    });

    // Teruskan stream + header penting agar nama file & tipe tetap
    const headers = new Headers();
    const ct = res.headers.get("content-type");
    const cd = res.headers.get("content-disposition");
    if (ct) headers.set("content-type", ct);
    if (cd) headers.set("content-disposition", cd);

    return new NextResponse(res.body, { status: 200, headers });
  } catch (e) {
    if (e instanceof ApiError) {
      return NextResponse.json(
        { message: e.message, status: e.status },
        { status: e.status }
      );
    }
    return NextResponse.json(
      { message: "Gagal mengunduh materi." },
      { status: 500 }
    );
  }
}
