// src/app/(app)/discussions/[id]/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiJson } from "@/lib/apiGuard";
import ChatClient from "./ChatClient";

type Role = "mahasiswa" | "dosen";
type UserMe = { id: number; name: string; email: string; role: Role };
type Author = { id: number; name: string; email: string };
type ReplyRow = {
  id: number;
  body: string;
  created_at: string;
  author: Author;
};
type RepliesResp = {
  data: ReplyRow[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
};
type DiscussionDetail = {
  id: number;
  course_id: number;
  title: string;
  body: string;
  author: Author;
};

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get("auth_token")?.value;
  const { id } = await props.params;
  if (!token) redirect(`/login?next=/discussions/${id}`);

  // Guard user (tangkap 401 → redirect oleh apiJson)
  const me = await apiJson<UserMe>("/user", {}, { next: `/discussions/${id}` });

  // Detail diskusi
  const detail = await apiJson<{ data: DiscussionDetail }>(
    `/discussions/${id}`
  );

  // Ambil meta dulu untuk tahu last_page, lalu ambil halaman terakhir agar tampilan seperti chat
  const first = await apiJson<RepliesResp>(
    `/discussions/${id}/replies?per_page=20&page=1`
  );
  const lastPage = Math.max(1, first.meta.last_page);
  const initial =
    lastPage === 1
      ? first
      : await apiJson<RepliesResp>(
          `/discussions/${id}/replies?per_page=20&page=${lastPage}`
        );

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] space-y-4">
      <header>
        <h1 className="text-xl font-semibold text-gray-900">
          {detail.data.title}
        </h1>
        <p className="text-sm text-gray-600">
          Diskusi #{detail.data.id} • Kursus #{detail.data.course_id}
        </p>
      </header>

      <ChatClient
        discussionId={detail.data.id}
        currentUserId={me.id}
        initialPage={initial.meta.current_page}
        lastPage={lastPage}
        initialMessages={initial.data}
      />
    </div>
  );
}

// Hindari cache agar state chat up-to-date
export const dynamic = "force-dynamic";
