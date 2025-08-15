"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Role = "mahasiswa" | "dosen";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("mahasiswa");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password_confirmation, setPasswordConfirmation] = useState("");

  // kontrol visibility & fokus untuk 2 field password
  const pwdRef = useRef<HTMLInputElement>(null);
  const [pwdVisible, setPwdVisible] = useState(false);
  const [pwdFocused, setPwdFocused] = useState(false);

  const pwd2Ref = useRef<HTMLInputElement>(null);
  const [pwd2Visible, setPwd2Visible] = useState(false);
  const [pwd2Focused, setPwd2Focused] = useState(false);

  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  const minName = 10;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOk(false);

    if (name.trim().length < minName) {
      setErr(`Nama minimal ${minName} karakter.`);
      return;
    }
    if (password.length < 8) {
      setErr("Password minimal 8 karakter.");
      return;
    }
    if (password !== password_confirmation) {
      setErr("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        password_confirmation,
        role,
      }),
    });
    setLoading(false);

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j?.message || "Registrasi gagal. Periksa isian Anda.");
      return;
    }

    setOk(true);
    setTimeout(() => router.push("/login"), 900);
  };

  return (
    <div className="w-full max-w-xl">
      <div className="relative rounded-2xl bg-white shadow-xl ring-1 ring-black/5 overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 grid place-content-center text-white font-bold shadow">
              E
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Buat Akun</h1>
              <p className="text-sm text-gray-500">
                Isi data di bawah untuk mendaftar
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="px-8 pb-8 pt-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Lengkap
            </label>
            <input
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2
                         text-gray-900 placeholder:text-gray-400
                         focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500"
              placeholder={`Nama minimal ${minName} karakter`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500">
              Gunakan nama lengkap (min {minName} karakter).
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2
                         text-gray-900 placeholder:text-gray-400
                         focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          {/* Peran */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Peran
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["mahasiswa", "dosen"] as Role[]).map((r) => {
                const active = role === r;
                return (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    aria-pressed={active}
                    className={[
                      "w-full rounded-lg px-3 py-2 text-sm font-medium transition focus:outline-none",
                      active
                        ? "bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow hover:opacity-95 focus:ring-4 focus:ring-indigo-200"
                        : "border border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 focus:ring-4 focus:ring-indigo-200",
                    ].join(" ")}
                  >
                    {r[0].toUpperCase() + r.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  ref={pwdRef}
                  type={pwdVisible ? "text" : "password"}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10
                             text-gray-900 placeholder:text-gray-400
                             focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500"
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPwdFocused(true)}
                  onBlur={() => setPwdFocused(false)}
                  required
                />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()} // cegah blur
                  onClick={() => {
                    setPwdVisible((v) => !v);
                    pwdRef.current?.focus();
                  }}
                  aria-label={
                    pwdVisible ? "Sembunyikan password" : "Tampilkan password"
                  }
                  className={[
                    "absolute inset-y-0 right-2 grid place-content-center px-2 transition-opacity duration-150",
                    pwdFocused
                      ? "opacity-100"
                      : "opacity-0 pointer-events-none",
                    "text-gray-500 hover:text-gray-700",
                  ].join(" ")}
                >
                  {pwdVisible ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Konfirmasi Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konfirmasi Password
              </label>
              <div className="relative">
                <input
                  ref={pwd2Ref}
                  type={pwd2Visible ? "text" : "password"}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10
                             text-gray-900 placeholder:text-gray-400
                             focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500"
                  placeholder="Ulangi password"
                  value={password_confirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  onFocus={() => setPwd2Focused(true)}
                  onBlur={() => setPwd2Focused(false)}
                  required
                />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()} // cegah blur
                  onClick={() => {
                    setPwd2Visible((v) => !v);
                    pwd2Ref.current?.focus();
                  }}
                  aria-label={
                    pwd2Visible ? "Sembunyikan password" : "Tampilkan password"
                  }
                  className={[
                    "absolute inset-y-0 right-2 grid place-content-center px-2 transition-opacity duration-150",
                    pwd2Focused
                      ? "opacity-100"
                      : "opacity-0 pointer-events-none",
                    "text-gray-500 hover:text-gray-700",
                  ].join(" ")}
                >
                  {pwd2Visible ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
          </div>

          {err && (
            <div className="rounded-lg bg-rose-50 text-rose-700 px-3 py-2 text-sm border border-rose-100">
              {err}
            </div>
          )}
          {ok && (
            <div className="rounded-lg bg-emerald-50 text-emerald-700 px-3 py-2 text-sm border border-emerald-100">
              Registrasi sukses. Mengarahkan ke halaman masuk…
            </div>
          )}

          <button
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2.5 font-medium text-white shadow hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:opacity-50"
          >
            {loading && (
              <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  className="opacity-25"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  d="M4 12a8 8 0 018-8"
                  className="opacity-75"
                  fill="currentColor"
                />
              </svg>
            )}
            Daftar
          </button>

          <p className="text-center text-sm text-gray-600">
            Sudah punya akun?{" "}
            <a
              href="/login"
              className="font-semibold text-indigo-700 hover:underline"
            >
              Masuk
            </a>
          </p>
        </form>
      </div>

      {/* Footer note */}
      <p className="mt-4 text-center text-xs text-white/80">
        © {new Date().getFullYear()} E-Learning
      </p>
    </div>
  );
}

/* ===== Ikon ===== */
function EyeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle
        cx="12"
        cy="12"
        r="3.25"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function EyeSlashIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M2.25 12s3.75-6.75 9.75-6.75c2.05 0 3.86.6 5.39 1.54M21.75 12s-3.75 6.75-9.75 6.75c-2.05 0-3.86-.6-5.39-1.54"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M9.75 9.75A3.25 3.25 0 0012 15.25"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
