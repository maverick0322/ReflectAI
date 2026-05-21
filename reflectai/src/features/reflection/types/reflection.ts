export type ReflectionSessionStatus = 'draft' | 'completed';

export type ReflectionSession = {
  id: string;
  user_id: string;
  title: string | null;
  status: ReflectionSessionStatus;
  started_at: string;
  completed_at: string | null;
  payload: ReflectionSessionPayload;
  ai_analysis: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export enum PrimaryEmotion {
  JOY = 'Alegria',
  TRUST = 'Confianza',
  FEAR = 'Miedo',
  SURPRISE = 'Sorpresa',
  SADNESS = 'Tristeza',
  AVERSION = 'Aversión',
  ANGER = 'Enojo',
  ANTICIPATION = 'Anticipación',
}

export type QuestionId =
  | 'Q1_SIT'
  | 'Q2_THO'
  | 'Q3_EMO'
  | 'Q4_INT'
  | 'Q5_TEL'
  | 'Q6_CON_MINE'
  | 'Q6_CON_OTHERS'
  | 'Q7_ALT'
  | 'SYS_GROUNDING'
  | 'SYS_AI_ADJUSTMENT';

export interface SessionResponse {
  id: QuestionId;
  text?: string;
  value?: number;
  category?: string;
  status?: string;
  method?: string;
  intervention?: string;
}

export interface SessionMetadata {
  version: string;
  started_at: string;
  completed_at?: string;
  interruption_detected?: boolean;
  resume_step?: number;
  flags?: string[];
  grounding_duration_seconds?: number;
  ai_hints?: string[];
}

export interface ReflectionSessionPayload {
  metadata: SessionMetadata;
  responses: SessionResponse[];
}
