// src/components/ApiStatusProbe.tsx
// Server Component: mencoba ping API, jika 5xx → tampilkan banner ramah, tidak melempar error.
import ApiStatusBanner from "./ApiStatusBanner";
import { ApiError, serverFetch } from "@/lib/serverFetch";

export default async function ApiStatusProbe() {
  try {
    // Ping ringan: /user cukup, 401 dianggap normal (belum login)
    await serverFetch("/user", { method: "GET" });
    return null;
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 401) return null; // tidak crash di halaman login
      if (e.status >= 500) {
        return (
          <ApiStatusBanner
            message={`Layanan backend tidak tersedia (${e.status}). Coba lagi beberapa saat.`}
          />
        );
      }
      // 4xx lain: tidak perlu banner global
      return null;
    }
    // Error tak dikenal → tampilkan banner generik, tetap jangan melempar.
    return <ApiStatusBanner />;
  }
}
