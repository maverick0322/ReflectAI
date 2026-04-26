import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";
import { createReflectionSessionSchema } from "@/lib/validations/reflection";

export async function POST(request: Request) {
  try {
    const { supabase, user, error: authError } = await getAuthenticatedUser();

    if (authError || !user) {
      return NextResponse.json({ error: { message: "No autorizado" } }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const validation = createReflectionSessionSchema.safeParse(body ?? {});

    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            message: "Datos invalidos",
            details: validation.error.flatten(),
          },
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("reflection_sessions")
      .insert({
        user_id: user.id,
        title: validation.data.title ?? null,
        status: "draft",
        payload: [],
        ai_analysis: {},
      })
      .select("id, title, status, started_at, completed_at, payload, ai_analysis")
      .single();

    if (error) {
      return NextResponse.json(
        { error: { message: "No se pudo crear la sesion" } },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        data,
        message: "Sesion creada correctamente",
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: { message: "Error inesperado al crear sesion" } },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const { supabase, user, error: authError } = await getAuthenticatedUser();

    if (authError || !user) {
      return NextResponse.json({ error: { message: "No autorizado" } }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("reflection_sessions")
      .select("id, title, status, started_at, completed_at, ai_analysis")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: { message: "No se pudo obtener el historial" } },
        { status: 500 },
      );
    }

    return NextResponse.json({
      data,
      message: "Sesiones obtenidas correctamente",
    });
  } catch {
    return NextResponse.json(
      { error: { message: "Error inesperado al obtener sesiones" } },
      { status: 500 },
    );
  }
}
