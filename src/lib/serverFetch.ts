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

export async function serverFetch(path: string, init?: RequestInit) {
  const jar = await cookies();
  const token = jar.get("auth_token")?.value;

  const headers = new Headers(init?.headers || {});
  headers.set("Accept", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const ct = res.headers.get("content-type") || "";
    let msg = res.statusText;
    if (ct.includes("application/json")) {
      const j = await res.json().catch(() => ({}));
      msg = j?.message || msg;
    } else {
      const t = await res.text().catch(() => "");
      msg = t.slice(0, 500) || msg;
    }
    throw new ApiError(res.status, msg);
  }
  return res;
}
