// src/app/(app)/layout.tsx
import Link from "next/link";
import { serverFetch } from "@/lib/serverFetch";

type User = {
  id?: number;
  name?: string;
  email?: string;
  role?: "dosen" | "mahasiswa";
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ambil profil utk avatar/role (silent fail jika API error)
  let me: User | null = null;
  try {
    me = await (await serverFetch("/user", { method: "GET" })).json();
  } catch {}

  const initials = (me?.name || me?.email || "E")
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr]">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 grid place-content-center text-white font-bold shadow">
              {initials}
            </div>
            <nav className="hidden sm:flex items-center gap-1 text-sm">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                Dashboard
              </Link>
              <Link
                href="/courses"
                className="px-3 py-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                Courses
              </Link>
              <Link
                href="/materials"
                className="px-3 py-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                Materials
              </Link>
              <Link
                href="/assignments"
                className="px-3 py-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                Assignments
              </Link>
              <Link
                href="/reports"
                className="px-3 py-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                Reports
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {me?.role && (
              <span className="hidden sm:inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                {me.role === "dosen" ? "Dosen" : "Mahasiswa"}
              </span>
            )}
            <form action="/api/logout" method="POST">
              <button
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                type="submit"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
