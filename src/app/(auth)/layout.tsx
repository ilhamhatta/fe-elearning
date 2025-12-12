// src/app/(auth)/layout.tsx
import { ReactNode } from "react";

// Server Component (tanpa fetch/alert). Akses /login & /register diatur middleware.
export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 flex items-center justify-center p-6">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
