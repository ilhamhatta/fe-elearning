// src/app/api/materials/[id]/route.ts
import { ApiError, serverFetch } from "@/lib/serverFetch";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const res = await serverFetch(`/materials/${params.id}`, {
      method: "DELETE",
    });
    const data = await res.json().catch(() => ({}));
    return Response.json(data, { status: res.status });
  } catch (e) {
    if (e instanceof ApiError) {
      return Response.json({ message: e.message }, { status: e.status });
    }
    throw e;
  }
}
