import type { ReflectionSessionPayload } from '@/types/reflection';

import { createGroqChatCompletion, type GroqChatMessage } from './groqClient';
import { extractEmbeddedJsonObject, isRecord } from './json';

export interface ReflectionAnalysisResult {
  primary_emotions: string[];
  average_intensity: number | null;
  key_themes: string[];
  cognitive_distortion_detected: string | null;
  session_title: string | null;
  summary: string | null;
  recommendation: string | null;
  encouraging_message: string | null;
  professional_support_reminder: string | null;
}

function findResponse(payload: ReflectionSessionPayload, id: string) {
  return payload.responses.find((response) => response.id === id);
}

function parseJsonContent(content: string): unknown {
  return extractEmbeddedJsonObject(content);
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === 'string')
    : [];
}

function buildRedactedPayload(payload: ReflectionSessionPayload) {
  return {
    metadata: {
      version: payload.metadata.version,
      completed_at: payload.metadata.completed_at ?? null,
    },
    responses: payload.responses.map((response) => ({
      id: response.id,
      value: response.value ?? null,
      category: response.category ?? null,
      status: response.status ?? null,
      method: response.method ?? null,
      text: response.text ? '[REDACTED_SENSITIVE_TEXT]' : null,
    })),
  };
}

const ANALYSIS_SYSTEM_PROMPT = [
  'You are an assistant that summarizes reflection sessions in Spanish.',
  'This is not clinical care.',
  'Return JSON only with keys:',
  'primary_emotions (array of strings),',
  'average_intensity (number or null),',
  'key_themes (array of strings),',
  'cognitive_distortion_detected (string or null),',
  'session_title (string or null),',
  'summary (string),',
  'recommendation (string),',
  'encouraging_message (string),',
  'professional_support_reminder (string).',
  'The reminder must always say that the best option is to consult a professional',
  'when discomfort is intense, persistent, or affects daily life.',
].join(' ');

export function buildAnalysisMessages(payload: ReflectionSessionPayload): GroqChatMessage[] {
  return [
    {
      role: 'system',
      content: ANALYSIS_SYSTEM_PROMPT,
    },
    {
      role: 'user',
      content: JSON.stringify({
        task: 'Analyze the reflection session and summarize insights.',
        payload: buildRedactedPayload(payload),
      }),
    },
  ];
}

export function parseAnalysisResult(content: string): ReflectionAnalysisResult | null {
  const parsed = parseJsonContent(content);
  if (!parsed || !isRecord(parsed)) {
    return null;
  }

  return {
    primary_emotions: toStringArray(parsed.primary_emotions),
    average_intensity:
      typeof parsed.average_intensity === 'number' ? parsed.average_intensity : null,
    key_themes: toStringArray(parsed.key_themes),
    cognitive_distortion_detected:
      typeof parsed.cognitive_distortion_detected === 'string'
        ? parsed.cognitive_distortion_detected
        : null,
    session_title:
      typeof parsed.session_title === 'string' ? parsed.session_title : null,
    summary: typeof parsed.summary === 'string' ? parsed.summary : null,
    recommendation:
      typeof parsed.recommendation === 'string' ? parsed.recommendation : null,
    encouraging_message:
      typeof parsed.encouraging_message === 'string'
        ? parsed.encouraging_message
        : null,
    professional_support_reminder:
      typeof parsed.professional_support_reminder === 'string'
        ? parsed.professional_support_reminder
        : null,
  };
}

export function buildFallbackAnalysis(
  payload: ReflectionSessionPayload,
): ReflectionAnalysisResult {
  const emotion = findResponse(payload, 'Q3_EMO')?.text;
  const intensity = findResponse(payload, 'Q4_INT')?.value;
  const situation = findResponse(payload, 'Q1_SIT')?.text;
  const alternative = findResponse(payload, 'Q7_ALT')?.text;
  const titleSource = alternative || situation || null;
  const normalizedTitle = getNormalizedSessionTitle(titleSource);

  return {
    primary_emotions: emotion ? [emotion] : [],
    average_intensity: typeof intensity === 'number' ? intensity : null,
    key_themes: [],
    cognitive_distortion_detected: null,
    session_title: normalizedTitle,
    summary: null,
    recommendation: null,
    encouraging_message: null,
    professional_support_reminder: null,
  };
}

function getNormalizedSessionTitle(titleSource: string | null) {
  if (!titleSource) {
    return null;
  }

  if (titleSource.length <= 64) {
    return titleSource;
  }

  return `${titleSource.slice(0, 61).trim()}...`;
}

export async function analyzeReflectionSession(
  payload: ReflectionSessionPayload,
): Promise<ReflectionAnalysisResult | null> {
  const messages = buildAnalysisMessages(payload);
  const content = await createGroqChatCompletion({
    messages,
    temperature: 0.2,
    maxTokens: 700,
  });

  return parseAnalysisResult(content);
}
