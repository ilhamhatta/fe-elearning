// src/components/UnenrollDialog.tsx
// Dialog konfirmasi "Keluar" (unenroll) untuk mahasiswa
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function UnenrollDialog({
  courseId,
  courseName,
  onSuccess,
}: {
  courseId: number;
  courseName?: string;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleUnenroll() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "DELETE",
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok)
        throw new Error(data.message || "Gagal keluar dari mata kuliah");
      setOpen(false);
      onSuccess?.();
      router.refresh(); // segarkan count peserta di card
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          className="rounded-lg border border-rose-300 px-3 py-1.5 text-sm text-rose-700 hover:bg-rose-50"
          aria-label="Keluar dari mata kuliah"
        >
          Keluar
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Keluar dari mata kuliah?</AlertDialogTitle>
          <AlertDialogDescription>
            Anda akan berhenti terdaftar
            {courseName ? ` dari “${courseName}”` : ""}. Anda bisa mendaftar
            lagi kapan saja.
          </AlertDialogDescription>
          {err && (
            <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
              {err}
            </p>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleUnenroll} disabled={loading}>
            {loading ? "Memproses..." : "Keluar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
