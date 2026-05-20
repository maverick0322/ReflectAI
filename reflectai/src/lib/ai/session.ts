import type { QuestionId, ReflectionSessionPayload } from '@/types/reflection';
import type { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser';

import { getFallbackQuote, generateDailyQuote } from '@/lib/ai/dailyQuote';
import { generateNextQuestion } from '@/lib/ai/nextQuestion';
import {
  analyzeReflectionSession,
  buildFallbackAnalysis,
} from '@/lib/ai/reflectionAnalysis';
import {
  loadReflectionSessionPayload,
  saveReflectionSessionAnalysis,
} from '@/lib/reflection/sessionService';
import { getNextQuestionId, getQuestionText } from '@/lib/reflection/questionFlow';

type AuthenticatedContext = Awaited<ReturnType<typeof getAuthenticatedUser>>;
type AuthenticatedSupabaseClient = AuthenticatedContext['supabase'];
type AuthenticatedUser = NonNullable<AuthenticatedContext['user']>;

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

  const questionIds =
    requestedQuestionIds && requestedQuestionIds.length > 0
      ? requestedQuestionIds
      : [nextQuestionId];
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

export async function buildDailyQuoteForUser(user: AuthenticatedUser) {
  const metadata = user.user_metadata ?? {};
  const userName =
    typeof metadata.full_name === 'string' ? metadata.full_name : undefined;

  try {
    return {
      data: await generateDailyQuote(userName),
      aiGenerated: true,
    };
  } catch (error: unknown) {
    void error;
    return {
      data: {
        ...getFallbackQuote(),
        aiGenerated: false,
      },
      aiGenerated: false,
    };
  }
}

export async function buildOwnedNextQuestionsResult(
  supabase: AuthenticatedSupabaseClient,
  user: AuthenticatedUser,
  sessionId: string,
  questionIds?: QuestionId[],
) {
  const { payload } = await loadReflectionSessionPayload(supabase, user, sessionId);
  return buildNextQuestionsResult(payload, questionIds);
}

export async function analyzeOwnedReflectionSession(
  supabase: AuthenticatedSupabaseClient,
  user: AuthenticatedUser,
  sessionId: string,
) {
  const { payload } = await loadReflectionSessionPayload(supabase, user, sessionId);
  const analysis = await generateSessionAnalysis(payload);
  return saveReflectionSessionAnalysis(supabase, user, sessionId, analysis);
}
