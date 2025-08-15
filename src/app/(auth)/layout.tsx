// src/app/(auth)/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError, serverFetch } from "@/lib/serverFetch";

// Server Component (jangan pakai "use client")
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Kalau sudah ada cookie, validasi ke Laravel
  const token = (await cookies()).get("auth_token")?.value;

  if (token) {
    try {
      // /user dilindungi sanctum → kalau sukses berarti token valid
      await serverFetch("/user", { method: "GET" });
      redirect("/dashboard"); // sudah login: jangan boleh lihat /login /register
    } catch (e) {
      // Token ada tapi invalid/expired → biarkan user melihat halaman auth
      if (!(e instanceof ApiError && e.status === 401)) {
        throw e; // selain 401, biar error asli muncul
      }
    }
  }

  // Wrapper tampilan auth (bg gradasi + center)
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 flex items-center justify-center p-6">
      {children}
    </div>
  );
}
