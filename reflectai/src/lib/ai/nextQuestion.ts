import type { QuestionId, ReflectionSessionPayload } from '@/types/reflection';

import { createGroqChatCompletion, type GroqChatMessage } from './groqClient';
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
  if (start === -1 || end === -1 || end <= start) {
    return trimmed;
  }

  try {
    const parsed = JSON.parse(trimmed.slice(start, end + 1)) as unknown;
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'question_text' in parsed &&
      typeof (parsed as { question_text: unknown }).question_text === 'string'
    ) {
      return (parsed as { question_text: string }).question_text;
    }
  } catch {
    return fallback;
  }

  return fallback;
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
