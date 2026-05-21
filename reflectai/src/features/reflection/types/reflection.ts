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
  JOY = 'Joy',
  TRUST = 'Trust',
  FEAR = 'Fear',
  SURPRISE = 'Surprise',
  SADNESS = 'Sadness',
  AVERSION = 'Aversion',
  ANGER = 'Anger',
  ANTICIPATION = 'Anticipation',
}

export const PRIMARY_EMOTION_LABELS: Record<PrimaryEmotion, string> = {
  [PrimaryEmotion.JOY]: 'Alegría',
  [PrimaryEmotion.TRUST]: 'Confianza',
  [PrimaryEmotion.FEAR]: 'Miedo',
  [PrimaryEmotion.SURPRISE]: 'Sorpresa',
  [PrimaryEmotion.SADNESS]: 'Tristeza',
  [PrimaryEmotion.AVERSION]: 'Aversión',
  [PrimaryEmotion.ANGER]: 'Enojo',
  [PrimaryEmotion.ANTICIPATION]: 'Anticipación',
};

const PRIMARY_EMOTION_ALIASES: Record<string, PrimaryEmotion> = {
  joy: PrimaryEmotion.JOY,
  alegria: PrimaryEmotion.JOY,
  trust: PrimaryEmotion.TRUST,
  confianza: PrimaryEmotion.TRUST,
  fear: PrimaryEmotion.FEAR,
  miedo: PrimaryEmotion.FEAR,
  surprise: PrimaryEmotion.SURPRISE,
  sorpresa: PrimaryEmotion.SURPRISE,
  sadness: PrimaryEmotion.SADNESS,
  tristeza: PrimaryEmotion.SADNESS,
  aversion: PrimaryEmotion.AVERSION,
  anger: PrimaryEmotion.ANGER,
  enojo: PrimaryEmotion.ANGER,
  anticipation: PrimaryEmotion.ANTICIPATION,
  anticipacion: PrimaryEmotion.ANTICIPATION,
};

function normalizeEmotionKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function normalizePrimaryEmotion(value: string) {
  return PRIMARY_EMOTION_ALIASES[normalizeEmotionKey(value)] ?? null;
}

export function getPrimaryEmotionLabel(value: string) {
  const normalized = normalizePrimaryEmotion(value);
  return normalized ? PRIMARY_EMOTION_LABELS[normalized] : value;
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
