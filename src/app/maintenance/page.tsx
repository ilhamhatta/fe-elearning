// src/app/maintenance/page.tsx
import Link from "next/link";
import ReloadButton from "@/components/ReloadButton";

export default function MaintenancePage() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-lg rounded-2xl ring-1 ring-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 p-0.5">
          <div className="rounded-2xl bg-white p-4">
            <h1 className="text-lg font-semibold text-gray-900">
              Sedang Perawatan
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Layanan backend tidak tersedia atau sedang pemeliharaan. Silakan
              coba lagi nanti.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ReloadButton />
          <Link
            href="/login"
            className="rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Ke Halaman Login
          </Link>
        </div>
      </div>
    </div>
  );
}
