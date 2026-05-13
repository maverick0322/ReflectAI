import { NextResponse } from 'next/server';

import { generateNextQuestion } from '@/lib/ai/nextQuestion';
import { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser';
import { getNextQuestionId, getQuestionText } from '@/lib/reflection/questionFlow';
import { normalizePayload } from '@/lib/reflection/payload';
import { nextQuestionSchema } from '@/lib/validations/ai';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const validation = nextQuestionSchema.safeParse(body ?? {});

    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            message: 'Datos invalidos',
            details: validation.error.flatten(),
          },
        },
        { status: 400 },
      );
    }

    const { supabase, user, error: authError } = await getAuthenticatedUser();

    if (authError || !user) {
      return NextResponse.json({ error: { message: 'No autorizado' } }, { status: 401 });
    }

    const { data: session, error } = await supabase
      .from('reflection_sessions')
      .select('id, payload, started_at')
      .eq('id', validation.data.sessionId)
      .eq('user_id', user.id)
      .single();

    if (error || !session) {
      return NextResponse.json(
        { error: { message: 'Sesion no encontrada' } },
        { status: 404 },
      );
    }

    const payload = normalizePayload(
      session.payload,
      session.started_at ?? new Date().toISOString(),
    );
    const requestedQuestionIds = validation.data.questionIds;
    const nextQuestionId = requestedQuestionIds?.[0] ?? getNextQuestionId(payload.responses);

    if (!nextQuestionId) {
      return NextResponse.json({
        data: { done: true },
        message: 'No hay mas preguntas',
      });
    }

    const questionIds = requestedQuestionIds ?? [nextQuestionId];
    const questions = await Promise.all(
      questionIds.map(async (questionId) => {
        let questionText = getQuestionText(questionId);
        let aiGenerated = false;

        try {
          questionText = await generateNextQuestion(payload, questionId);
          aiGenerated = true;
        } catch {
          questionText = getQuestionText(questionId);
        }

        return {
          questionId,
          questionText,
          aiGenerated,
        };
      }),
    );
    const primaryQuestion = questions[0];

    return NextResponse.json({
      data: {
        done: false,
        questionId: primaryQuestion.questionId,
        questionText: primaryQuestion.questionText,
        aiGenerated: primaryQuestion.aiGenerated,
        questions,
      },
    });
  } catch {
    return NextResponse.json(
      { error: { message: 'Error inesperado al generar pregunta' } },
      { status: 500 },
    );
  }
}
