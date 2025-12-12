// src/lib/serverFetch.ts
import "server-only";
import { cookies } from "next/headers";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const BASE = process.env.NEXT_PUBLIC_API_URL;

/** Gabung base URL + path dengan aman (hindari double slash) */
function joinUrl(base: string, path: string) {
  if (/^https?:\/\//i.test(path)) return path; // sudah absolut
  const b = base.replace(/\/+$/, "");
  const p = path.replace(/^\/+/, "");
  return `${b}/${p}`;
}

type ErrWithCode = { code?: unknown; cause?: { code?: unknown } | unknown };
function getErrCode(e: unknown): string | null {
  const ex = e as ErrWithCode;
  if (typeof ex.code === "string") return ex.code;
  if (ex.cause && typeof (ex.cause as { code?: unknown }).code === "string") {
    return (ex.cause as { code?: unknown }).code as string;
  }
  return null;
}

/** Retry sederhana untuk error jaringan/transient */
async function fetchWithRetry(url: string, init: RequestInit, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fetch(url, { ...init, cache: "no-store" });
    } catch (e) {
      const code = getErrCode(e);
      const transient = [
        "ECONNREFUSED",
        "ENOTFOUND",
        "ECONNRESET",
        "ETIMEDOUT",
      ].includes(code ?? "");
      if (i < retries && transient) {
        await new Promise((r) => setTimeout(r, 200 * (i + 1)));
        continue;
      }
      throw e;
    }
  }
  // seharusnya tidak tercapai
  throw new Error("unreachable");
}

export async function serverFetch(path: string, init?: RequestInit) {
  if (!BASE) {
    throw new ApiError(
      500,
      "NEXT_PUBLIC_API_URL belum dikonfigurasi. Set di .env.local lalu restart dev server."
    );
  }

  const jar = await cookies();
  const token = jar.get("auth_token")?.value;

  const headers = new Headers(init?.headers || {});
  headers.set("Accept", "application/json");
  // Jangan set Content-Type saat body = FormData (biar boundary otomatis)
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const url = joinUrl(BASE, path);

  let res: Response;
  try {
    res = await fetchWithRetry(url, { ...init, headers });
  } catch (e) {
    // Jaringan/Backend sedang tidak tersedia (mis. migrate:fresh)
    const code = getErrCode(e);
    const suffix = code ? ` (${code})` : "";
    throw new ApiError(
      503,
      `Tidak dapat menghubungi server API${suffix}. Pastikan backend berjalan.`
    );
  }

  if (!res.ok) {
    const ct = res.headers.get("content-type") || "";
    let msg = res.statusText;

    if (ct.includes("application/json")) {
      const j = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      const m = j["message"];
      if (typeof m === "string") msg = m;
    } else {
      const t = await res.text().catch(() => "");
      msg = t.slice(0, 500) || msg;
    }

    throw new ApiError(res.status, msg);
  }

  return res;
}

/**
 * Helper untuk langsung parse JSON dari hasil serverFetch.
 * - Menangani 204 No Content → kembalikan {} sebagai T.
 * - Lempar ApiError(500) jika body bukan JSON valid.
 */
export async function serverJson<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await serverFetch(path, init);
  if (res.status === 204) return {} as T;

  const ct = res.headers.get("content-type")?.toLowerCase() || "";
  try {
    // Tetap coba parse walau content-type tidak tepat (beberapa API tidak set benar)
    if (!ct.includes("application/json")) {
      return (await res.json()) as T;
    }
    return (await res.json()) as T;
  } catch {
    throw new ApiError(500, "Gagal parse JSON dari API");
  }
}
