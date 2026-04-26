export type ReflectionSessionStatus = "draft" | "completed";

export type ReflectionEntry = {
  step_order: number;
  question: string;
  user_response: string;
  detected_emotion: string | null;
  intensity: number | null;
  created_at: string;
};

export type ReflectionSession = {
  id: string;
  user_id: string;
  title: string | null;
  status: ReflectionSessionStatus;
  started_at: string;
  completed_at: string | null;
  payload: ReflectionEntry[];
  ai_analysis: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};
