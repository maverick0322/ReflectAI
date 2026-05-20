import type { QuestionId, ReflectionSessionPayload } from '@/types/reflection';

import { generateNextQuestion } from '@/lib/ai/nextQuestion';
import {
  analyzeReflectionSession,
  buildFallbackAnalysis,
} from '@/lib/ai/reflectionAnalysis';
import { getNextQuestionId, getQuestionText } from '@/lib/reflection/questionFlow';

type QuestionResult = {
  questionId: QuestionId;
  questionText: string;
  aiGenerated: boolean;
};

async function buildQuestionResult(
  payload: ReflectionSessionPayload,
  questionId: QuestionId,
): Promise<QuestionResult> {
  try {
    return {
      questionId,
      questionText: await generateNextQuestion(payload, questionId),
      aiGenerated: true,
    };
  } catch (error: unknown) {
    void error;
    return {
      questionId,
      questionText: getQuestionText(questionId),
      aiGenerated: false,
    };
  }
}

export async function buildNextQuestionsResult(
  payload: ReflectionSessionPayload,
  requestedQuestionIds?: QuestionId[],
) {
  const nextQuestionId =
    requestedQuestionIds?.[0] ?? getNextQuestionId(payload.responses);

  if (!nextQuestionId) {
    return {
      done: true as const,
    };
  }

  const questionIds = requestedQuestionIds ?? [nextQuestionId];
  const questions = await Promise.all(
    questionIds.map((questionId) => buildQuestionResult(payload, questionId)),
  );
  const primaryQuestion = questions[0];

  return {
    done: false as const,
    questionId: primaryQuestion.questionId,
    questionText: primaryQuestion.questionText,
    aiGenerated: primaryQuestion.aiGenerated,
    questions,
  };
}

export async function generateSessionAnalysis(payload: ReflectionSessionPayload) {
  try {
    return (await analyzeReflectionSession(payload)) ?? buildFallbackAnalysis(payload);
  } catch (error: unknown) {
    void error;
    return buildFallbackAnalysis(payload);
  }
}
