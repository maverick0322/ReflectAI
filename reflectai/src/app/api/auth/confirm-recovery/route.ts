import { NextResponse } from 'next/server';

import { assertTrustedMutationOrigin } from '@/lib/security/origin';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { rateLimitResponse } from '@/lib/security/responses';
import { confirmRecoverySchema } from '@/lib/validations/auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    assertTrustedMutationOrigin(request);

    const rateLimit = checkRateLimit(request, {
      key: 'auth:confirm-recovery',
      maxRequests: 10,
      windowMs: 15 * 60 * 1000,
    });

    if (rateLimit.limited) {
      return rateLimitResponse(rateLimit.retryAfterSeconds);
    }

    const body = await request.json().catch(() => null);
    const validation = confirmRecoverySchema.safeParse(body ?? {});

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

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(
      validation.data.code,
    );

    if (error || !data.session) {
      return NextResponse.json(
        { error: { message: 'No se pudo confirmar la recuperacion' } },
        { status: 400 },
      );
    }

    return NextResponse.json({
      message: 'Recuperacion confirmada',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Untrusted origin') {
      return NextResponse.json({ error: { message: 'Origen no permitido' } }, { status: 403 });
    }

    return NextResponse.json(
      { error: { message: 'Error inesperado al confirmar recuperacion' } },
      { status: 500 },
    );
  }
}
