import { NextResponse } from 'next/server';

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

    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName ?? '',
        full_name: fullName,
        birth_date: birthDate,
      },
    });

    if (error) {
      console.error('Supabase register failed', error.message);
      const isRateLimited = error.message.toLowerCase().includes('rate limit');

      return NextResponse.json(
        {
          error: {
            message: getRegisterErrorMessage(error.message),
            details: error.message,
            field: getRegisterErrorField(error.message),
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
  } catch {
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
