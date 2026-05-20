import type { ReflectionSessionPayload } from '@/features/reflection/types/reflection';

import { createGroqChatCompletion, type GroqChatMessage } from './groqClient';

export interface ReflectionAnalysisResult {
  primary_emotions: string[];
  average_intensity: number | null;
  key_themes: string[];
  cognitive_distortion_detected: string | null;
  session_title: string | null;
  summary: string | null;
  recommendation: string | null;
  encouraging_message: string | null;
  professional_support_reminder: string;
}

function findResponse(
  payload: ReflectionSessionPayload,
  id: string,
) {
  return payload.responses.find((response) => response.id === id);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseJsonContent(content: string): unknown {
  const trimmed = content.trim();
  try {
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      return JSON.parse(trimmed) as unknown;
    }

    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1)) as unknown;
    }
  } catch {
    return null;
  }

  return null;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === 'string')
    : [];
}

export function buildAnalysisMessages(payload: ReflectionSessionPayload): GroqChatMessage[] {
  return [
    {
      role: 'system',
      content:
        'You are an assistant that summarizes reflection sessions in Spanish. This is not clinical care. Return JSON only with keys: ' +
        'primary_emotions (array of strings), average_intensity (number or null), ' +
        'key_themes (array of strings), cognitive_distortion_detected (string or null), ' +
        'session_title (string or null), summary (string), recommendation (string), ' +
        'encouraging_message (string), professional_support_reminder (string). ' +
        'The reminder must always say that the best option is to consult a professional when discomfort is intense, persistent, or affects daily life.',
    },
    {
      role: 'user',
      content: JSON.stringify({
        task: 'Analyze the reflection session and summarize insights.',
        payload,
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
        : 'Esta reflexion no sustituye la atencion profesional. Si el malestar es intenso, persistente o afecta tu vida diaria, lo mejor es consultar a un profesional.',
  };
}

export function buildFallbackAnalysis(
  payload: ReflectionSessionPayload,
): ReflectionAnalysisResult {
  const emotion = findResponse(payload, 'Q3_EMO')?.text;
  const intensity = findResponse(payload, 'Q4_INT')?.value;
  const situation = findResponse(payload, 'Q1_SIT')?.text;
  const alternative = findResponse(payload, 'Q7_ALT')?.text;
  const titleSource = alternative || situation || 'Sesion de reflexion';
  const normalizedTitle =
    titleSource.length > 64 ? `${titleSource.slice(0, 61).trim()}...` : titleSource;

  return {
    primary_emotions: emotion ? [emotion] : [],
    average_intensity: typeof intensity === 'number' ? intensity : null,
    key_themes: [],
    cognitive_distortion_detected: null,
    session_title: normalizedTitle,
    summary:
      'Registraste la situacion, el pensamiento asociado, la emocion principal y una interpretacion alternativa para mirar lo ocurrido con mas claridad.',
    recommendation:
      'Usa tu perspectiva alternativa como punto de apoyo y elige una accion pequena que dependa de ti para el siguiente paso.',
    encouraging_message:
      'Tomarte este tiempo para ordenar lo que sientes es un avance concreto.',
    professional_support_reminder:
      'Esta reflexion no sustituye la atencion profesional. Si el malestar es intenso, persistente o afecta tu vida diaria, lo mejor es consultar a un profesional.',
  };
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
