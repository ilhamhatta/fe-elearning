// src/app/not-found.tsx
export default function NotFound() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-lg rounded-2xl ring-1 ring-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-lg font-semibold text-gray-900">
          Halaman Tidak Ditemukan
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Periksa kembali alamat URL Anda.
        </p>
      </div>
    </div>
  );
}
