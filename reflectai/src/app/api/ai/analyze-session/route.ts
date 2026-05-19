import { NextResponse } from 'next/server';

import {
  analyzeReflectionSession,
  buildFallbackAnalysis,
} from '@/lib/ai/reflectionAnalysis';
import { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser';
import { normalizePayload } from '@/lib/reflection/payload';
import { assertTrustedMutationOrigin } from '@/lib/security/origin';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { rateLimitResponse } from '@/lib/security/responses';
import { analyzeSessionSchema } from '@/lib/validations/ai';

export async function POST(request: Request) {
  try {
    assertTrustedMutationOrigin(request);

    const rateLimit = checkRateLimit(request, {
      key: 'ai:analyze-session',
      maxRequests: 20,
      windowMs: 60 * 60 * 1000,
    });

    if (rateLimit.limited) {
      return rateLimitResponse(rateLimit.retryAfterSeconds);
    }

    const body = await request.json().catch(() => null);
    const validation = analyzeSessionSchema.safeParse(body ?? {});

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

    let analysis = buildFallbackAnalysis(payload);

    try {
      analysis = (await analyzeReflectionSession(payload)) ?? analysis;
    } catch {
      analysis = buildFallbackAnalysis(payload);
    }

    const { data, error: updateError } = await supabase
      .from('reflection_sessions')
      .update({
        ai_analysis: analysis,
      })
      .eq('id', validation.data.sessionId)
      .eq('user_id', user.id)
      .select('id, ai_analysis')
      .single();

    if (updateError || !data) {
      return NextResponse.json(
        { error: { message: 'No se pudo guardar el analisis' } },
        { status: 500 },
      );
    }

    return NextResponse.json({
      data,
      message: 'Analisis generado correctamente',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Untrusted origin') {
      return NextResponse.json({ error: { message: 'Origen no permitido' } }, { status: 403 });
    }

    return NextResponse.json(
      { error: { message: 'Error inesperado al generar analisis' } },
      { status: 500 },
    );
  }
}
