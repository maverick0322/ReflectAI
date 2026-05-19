import { NextResponse } from 'next/server';

import { assertTrustedMutationOrigin } from '@/lib/security/origin';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { rateLimitResponse } from '@/lib/security/responses';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { registerSchema } from '@/lib/validations/auth';

function getRegisterErrorMessage(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes('already registered') ||
    normalizedMessage.includes('already exists') ||
    normalizedMessage.includes('already been registered')
  ) {
    return 'Ya existe una cuenta con ese correo.';
  }

  if (normalizedMessage.includes('rate limit')) {
    return 'Se hicieron demasiados intentos. Espera unos minutos antes de crear otra cuenta.';
  }

  if (normalizedMessage.includes('redirect') || normalizedMessage.includes('not allowed')) {
    return 'La URL de confirmacion no esta permitida en Supabase.';
  }

  return 'No se pudo registrar el usuario';
}

function getRegisterErrorField(message: string) {
  return getRegisterErrorMessage(message).includes('correo') ? 'email' : undefined;
}

export async function POST(request: Request) {
  try {
    assertTrustedMutationOrigin(request);

    const rateLimit = checkRateLimit(request, {
      key: 'auth:register',
      maxRequests: 5,
      windowMs: 60 * 60 * 1000,
    });

    if (rateLimit.limited) {
      return rateLimitResponse(rateLimit.retryAfterSeconds);
    }

    const body = await request.json().catch(() => null);

    const validation = registerSchema.safeParse({
      ...body,
      confirmEmail: body?.email,
      confirmPassword: body?.password,
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            message: 'Datos de registro invalidos',
            details: validation.error.flatten(),
          },
        },
        { status: 400 },
      );
    }

    const { firstName, lastName, email, password, birthDate } = validation.data;
    const fullName = [firstName, lastName].filter(Boolean).join(' ');

    const accountRateLimit = checkRateLimit(request, {
      key: 'auth:register:account',
      identifier: email,
      maxRequests: 3,
      windowMs: 60 * 60 * 1000,
    });

    if (accountRateLimit.limited) {
      return rateLimitResponse(accountRateLimit.retryAfterSeconds);
    }

    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm:
        process.env.NODE_ENV !== 'production' &&
        process.env.SUPABASE_AUTO_CONFIRM_EMAIL !== 'false',
      user_metadata: {
        first_name: firstName,
        last_name: lastName ?? '',
        full_name: fullName,
        birth_date: birthDate,
      },
    });

    if (error) {
      console.error('Supabase register failed', error.message);
      const normalizedMessage = error.message.toLowerCase();
      const isRateLimited = normalizedMessage.includes('rate limit');
      const isDuplicateEmail =
        normalizedMessage.includes('already registered') ||
        normalizedMessage.includes('already exists') ||
        normalizedMessage.includes('already been registered');

      return NextResponse.json(
        {
          error: {
            message: isRateLimited
              ? getRegisterErrorMessage(error.message)
              : isDuplicateEmail
                ? getRegisterErrorMessage(error.message)
                : 'No se pudo completar el registro.',
            field:
              isRateLimited || isDuplicateEmail
                ? getRegisterErrorField(error.message)
                : undefined,
          },
        },
        { status: isRateLimited ? 429 : 400 },
      );
    }

    return NextResponse.json(
      {
        data: {
          id: data.user?.id,
          email: data.user?.email,
          fullName,
        },
        message: 'Usuario registrado correctamente',
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'Untrusted origin') {
      return NextResponse.json({ error: { message: 'Origen no permitido' } }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: {
          message: 'Error inesperado al registrar usuario',
        },
      },
      { status: 500 },
    );
  }
}
