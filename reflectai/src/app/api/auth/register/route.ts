import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { registerSchema } from "@/lib/validations/auth";

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
            message: "Datos de registro invalidos",
            details: validation.error.flatten(),
          },
        },
        { status: 400 },
      );
    }

    const { firstName, lastName, email, password, birthDate } = validation.data;
    const fullName = [firstName, lastName].filter(Boolean).join(" ");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName ?? "",
          full_name: fullName,
          birth_date: birthDate,
        },
      },
    });

    if (error) {
      return NextResponse.json(
        {
          error: {
            message: "No se pudo registrar el usuario",
          },
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        data: {
          id: data.user?.id,
          email: data.user?.email,
          fullName,
        },
        message: "Usuario registrado correctamente",
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      {
        error: {
          message: "Error inesperado al registrar usuario",
        },
      },
      { status: 500 },
    );
  }
}
