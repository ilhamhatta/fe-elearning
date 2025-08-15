// src/components/SubmitButton.tsx
"use client";
import { useState } from "react";

type Props = {
  label: string;
  loadingLabel?: string;
  className?: string;
  disabled?: boolean;
};

export default function SubmitButton({
  label,
  loadingLabel = "Memproses…",
  className,
  disabled,
}: Props) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="submit"
      aria-busy={loading}
      disabled={loading || disabled}
      onClick={(e) => {
        // hanya set loading jika form valid
        const form = (e.currentTarget as HTMLButtonElement).closest("form");
        if (form && !form.checkValidity()) {
          // biarkan handler onSubmit form yang mencegah submit & menampilkan error
          setLoading(false);
          return;
        }
        setLoading(true);
      }}
      className={`${className ?? ""} disabled:opacity-50`}
    >
      {loading ? loadingLabel : label}
    </button>
  );
}
