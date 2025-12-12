// src/components/EnrollButton.tsx
// Enroll + Unenroll (untuk mahasiswa) dengan UI modern
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import StatusPill from "@/components/ui/StatusPill";
import UnenrollDialog from "@/components/UnenrollDialog";

export default function EnrollButton({
  courseId,
  courseName,
  initiallyEnrolled = false,
}: {
  courseId: number;
  courseName?: string;
  initiallyEnrolled?: boolean;
}) {
  const router = useRouter();
  const [enrolled, setEnrolled] = useState<boolean>(initiallyEnrolled);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function enroll() {
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) throw new Error(data.message || "Gagal mendaftar");
      setEnrolled(true);
      setMsg(data.message || "Berhasil mendaftar");
      router.refresh(); // segarkan count peserta
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : "Gagal mendaftar";
      setMsg(m);
      // Jika backend bilang sudah terdaftar, kunci tombol
      if (/already enrolled/i.test(m)) setEnrolled(true);
    } finally {
      setLoading(false);
    }
  }

  if (enrolled) {
    return (
      <div className="flex items-center gap-3">
        <StatusPill tone="success">Terdaftar</StatusPill>
        <UnenrollDialog
          courseId={courseId}
          courseName={courseName}
          onSuccess={() => {
            setEnrolled(false);
            setMsg("Berhasil keluar");
          }}
        />
        {msg && <p className="text-xs text-gray-600">{msg}</p>}
      </div>
    );
  }

  return (
    <div className="text-right">
      <button
        onClick={enroll}
        disabled={loading}
        className="rounded-lg bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-3 py-1.5 text-sm text-white shadow hover:opacity-95 active:scale-[0.98] disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-indigo-200"
        aria-label="Enroll ke mata kuliah ini"
      >
        {loading ? "Memproses..." : "Enroll"}
      </button>
      {msg && <p className="mt-1 text-xs text-gray-600">{msg}</p>}
    </div>
  );
}
