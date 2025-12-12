// src/app/api/materials/[id]/download/route.ts
import { ApiError, serverFetch } from "@/lib/serverFetch";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const res = await serverFetch(`/materials/${params.id}/download`, {
      method: "GET",
    });

    // forward stream & headers penting
    const headers = new Headers();
    const forwardHeaders = [
      "content-type",
      "content-length",
      "content-disposition",
      "etag",
      "cache-control",
      "x-file-name",
    ];
    forwardHeaders.forEach((h) => {
      const v = res.headers.get(h);
      if (v) headers.set(h, v);
    });

    return new Response(res.body, {
      status: res.status,
      headers,
    });
  } catch (e) {
    if (e instanceof ApiError) {
      return Response.json({ message: e.message }, { status: e.status });
    }
    throw e;
  }
}
