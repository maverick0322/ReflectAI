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

// Frontend types used by the reflection wizard and local session state.
export enum PrimaryEmotion {
  ALEGRIA = 'Alegría',
  CONFIANZA = 'Confianza',
  MIEDO = 'Miedo',
  SORPRESA = 'Sorpresa',
  TRISTEZA = 'Tristeza',
  AVERSION = 'Aversión',
  ENOJO = 'Enojo',
  ANTICIPACION = 'Anticipación',
}

// Strict question identifiers used by the JSONB reflection payload.
export type QuestionId =
  | 'Q1_SIT' // Situation
  | 'Q2_THO' // Thought
  | 'Q3_EMO' // Emotion
  | 'Q4_INT' // Intensity (1-10)
  | 'Q5_TEL' // Purpose
  | 'Q6_CON_MINE' // Internal control
  | 'Q6_CON_OTHERS' // External control
  | 'Q7_ALT' // Alternative reframing
  | 'SYS_GROUNDING' // System grounding intervention metadata
  | 'SYS_AI_ADJUSTMENT';

// Internal response shape required by the wizard flow.
export interface SessionResponse {
  id: QuestionId;
  text?: string;
  value?: number;
  category?: string;
  status?: string;
  method?: string;
  intervention?: string;
}

// Session metadata persisted in the reflection payload.
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

// Final payload shape sent to backend once the session is composed.
export interface ReflectionSessionPayload {
  metadata: SessionMetadata;
  responses: SessionResponse[];
}
