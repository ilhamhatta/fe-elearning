// src/types/course.ts
// Path: src/types/course.ts
export type Role = "mahasiswa" | "dosen";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface Course {
  id: number;
  name: string;
  description?: string | null;
  lecturer_id: number;
  lecturer?: { id: number; name: string } | null;
  /** dari controller index(): true bila user saat ini sudah terdaftar (pivot aktif) */
  is_enrolled?: boolean;
  /** dari controller index(): jumlah peserta aktif */
  students_count?: number;
}
