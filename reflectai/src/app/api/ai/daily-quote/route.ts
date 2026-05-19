import { NextResponse } from 'next/server';

import { generateDailyQuote, getFallbackQuote } from '@/lib/ai/dailyQuote';
import { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { rateLimitResponse } from '@/lib/security/responses';

export async function GET(request?: Request) {
  try {
    const rateLimit = checkRateLimit(request, {
      key: 'ai:daily-quote',
      maxRequests: 30,
      windowMs: 60 * 60 * 1000,
    });

    if (rateLimit.limited) {
      return rateLimitResponse(rateLimit.retryAfterSeconds);
    }

    const { user, error: authError } = await getAuthenticatedUser();

    if (authError || !user) {
      return NextResponse.json({ error: { message: 'No autorizado' } }, { status: 401 });
    }

    const metadata = user.user_metadata ?? {};
    const userName =
      typeof metadata.full_name === 'string' ? metadata.full_name : undefined;

    try {
      const quote = await generateDailyQuote(userName);
      return NextResponse.json({
        data: quote,
        message: 'Cita generada correctamente',
      });
    } catch {
      return NextResponse.json({
        data: {
          ...getFallbackQuote(),
          aiGenerated: false,
        },
        message: 'Cita local generada correctamente',
      });
    }
  } catch {
    return NextResponse.json(
      { error: { message: 'Error inesperado al generar cita' } },
      { status: 500 },
    );
  }
}
