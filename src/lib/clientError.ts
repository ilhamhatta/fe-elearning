// src/lib/clientError.ts
// Helper kecil untuk menangani error tanpa `any`
export function getErrorMessage(e: unknown): string {
  if (e instanceof Error && e.message) return e.message;
  return "Terjadi kesalahan tak terduga";
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/** Ekstrak pesan error dari Response (kompatibel dengan Laravel) */
export async function extractApiError(res: Response): Promise<string> {
  try {
    const data: unknown = await res.json();
    if (isRecord(data)) {
      if (typeof data.message === "string") return data.message;

      // Laravel validation errors: { errors: { field: ["msg"] } }
      if (isRecord(data.errors)) {
        const firstKey = Object.keys(data.errors)[0];
        const first = isRecord(data.errors)
          ? (data.errors as Record<string, unknown>)[firstKey]
          : undefined;
        if (Array.isArray(first) && first.length > 0) {
          const firstMsg = first[0];
          if (typeof firstMsg === "string") return firstMsg;
        }
      }
    }
  } catch {
    // ignore parse errors
  }
  return `${res.status} ${res.statusText}`;
}
