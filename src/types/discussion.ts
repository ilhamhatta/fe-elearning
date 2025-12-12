// src/types/discussion.ts
export type Discussion = {
  id: number;
  course_id: number;
  user_id: number;
  title: string;
  body: string;
  created_at: string;
};

export type Reply = {
  id: number;
  discussion_id: number;
  user_id: number;
  body: string;
  created_at: string;
};
