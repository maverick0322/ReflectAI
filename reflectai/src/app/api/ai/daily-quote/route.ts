import { NextResponse } from 'next/server';

import { generateDailyQuote, getFallbackQuote } from '@/lib/ai/dailyQuote';
import { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser';

export async function GET() {
  try {
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
