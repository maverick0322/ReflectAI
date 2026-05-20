import type { QuestionId, ReflectionSessionPayload } from '@/types/reflection';

import { createGroqChatCompletion, type GroqChatMessage } from './groqClient';
import { extractEmbeddedJsonObject, isRecord } from './json';
import { getQuestionText } from '@/lib/reflection/questionFlow';

export interface NextQuestionResult {
  questionId: QuestionId;
  questionText: string;
}

function buildContextPayload(payload: ReflectionSessionPayload) {
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
      text: response.text ? response.text.slice(0, 120) : null,
    })),
  };
}

export function buildNextQuestionMessages(
  payload: ReflectionSessionPayload,
  questionId: QuestionId,
): GroqChatMessage[] {
  const baseQuestion = getQuestionText(questionId);

  return [
    {
      role: 'system',
      content:
        'You are a concise facilitator. Rewrite the next question in Spanish, ' +
        'keeping the same intent but adapting it to the user answers already captured. ' +
        'Do not repeat the exact base question unless there is no useful context. ' +
        'Return JSON only with key question_text.',
    },
    {
      role: 'user',
      content: JSON.stringify({
        next_question_id: questionId,
        base_question: baseQuestion,
        payload: buildContextPayload(payload),
      }),
    },
  ];
}

export function parseNextQuestionContent(content: string, fallback: string): string {
  const trimmed = content.trim();
  if (!trimmed) {
    return fallback;
  }

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  const parsed = extractEmbeddedJsonObject(trimmed);

  if (!parsed) {
    return start === -1 || end === -1 || end <= start ? trimmed : fallback;
  }

  if (!isRecord(parsed) || typeof parsed.question_text !== 'string') {
    return fallback;
  }

  return parsed.question_text;
}

export async function generateNextQuestion(
  payload: ReflectionSessionPayload,
  questionId: QuestionId,
): Promise<string> {
  const fallback = getQuestionText(questionId);
  const messages = buildNextQuestionMessages(payload, questionId);
  const content = await createGroqChatCompletion({
    messages,
    temperature: 0.4,
    maxTokens: 200,
  });

  return parseNextQuestionContent(content, fallback);
}
