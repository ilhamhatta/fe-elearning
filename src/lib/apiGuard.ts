// src/lib/apiGuard.ts
import { redirect, notFound } from "next/navigation";
import { ApiError, serverFetch } from "./serverFetch";

export type GuardOptions = {
  /** append ?next= saat 401 */
  next?: string;
  /** override path bawaan */
  on401?: string; // default: "/login"
  on403?: string; // default: "/forbidden"
  on5xx?: string; // default: "/maintenance"
  /** 404: "notFound" (default) atau redirect ke path lain */
  on404?: "notFound" | string;
  /** status yang DIABAIKAN (khusus *Optional) → return null */
  ignore?: number[];
};

export function handleApiError(e: unknown, opt: GuardOptions = {}): never {
  if (e instanceof ApiError) {
    const next = opt.next ? `?next=${encodeURIComponent(opt.next)}` : "";
    if (e.status === 401) redirect((opt.on401 ?? "/login") + next);
    if (e.status === 403) redirect(opt.on403 ?? "/forbidden");
    if (e.status === 404) {
      if (opt.on404 === "notFound" || !opt.on404) notFound();
      redirect(opt.on404);
    }
    if (e.status >= 500) redirect(opt.on5xx ?? "/maintenance");
  }
  throw e; // non-ApiError: lempar ke error boundary
}

/** GET → JSON, auto-redirect (401/403/404/5xx) */
export async function apiJson<T>(
  path: string,
  init: Omit<RequestInit, "method"> = {},
  opt: GuardOptions = {}
): Promise<T> {
  try {
    const res = await serverFetch(path, { ...init, method: "GET" });
    return (await res.json()) as T;
  } catch (e) {
    handleApiError(e, opt);
  }
}

/** GET opsional: abaikan status tertentu (mis. 404) → kembalikan null */
export async function apiJsonOptional<T>(
  path: string,
  init: Omit<RequestInit, "method"> = {},
  opt: GuardOptions = {}
): Promise<T | null> {
  try {
    const res = await serverFetch(path, { ...init, method: "GET" });
    return (await res.json()) as T;
  } catch (e) {
    if (e instanceof ApiError && opt.ignore?.includes(e.status)) {
      return null;
    }
    handleApiError(e, opt);
  }
}

/** Call generic (POST/PUT/DELETE), auto-redirect sesuai status */
export async function apiCall(
  path: string,
  init: RequestInit,
  opt: GuardOptions = {}
): Promise<Response> {
  try {
    return await serverFetch(path, init);
  } catch (e) {
    handleApiError(e, opt);
  }
}
