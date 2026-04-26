import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";
import { addReflectionResponseSchema } from "@/lib/validations/reflection";
import type { ReflectionEntry } from "@/types/reflection";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { supabase, user, error: authError } = await getAuthenticatedUser();

    if (authError || !user) {
      return NextResponse.json({ error: { message: "No autorizado" } }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const validation = addReflectionResponseSchema.safeParse(body);

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

    const { data: session, error: sessionError } = await supabase
      .from("reflection_sessions")
      .select("id, status, payload")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: { message: "Sesion no encontrada" } },
        { status: 404 },
      );
    }

    if (session.status === "completed") {
      return NextResponse.json(
        {
          error: {
            message: "No se pueden agregar respuestas a una sesion completada",
          },
        },
        { status: 409 },
      );
    }

    const currentPayload = Array.isArray(session.payload)
      ? (session.payload as ReflectionEntry[])
      : [];

    const newEntry: ReflectionEntry = {
      step_order: currentPayload.length + 1,
      question: validation.data.question,
      user_response: validation.data.userResponse,
      detected_emotion: validation.data.detectedEmotion ?? null,
      intensity: validation.data.intensity ?? null,
      created_at: new Date().toISOString(),
    };

    const updatedPayload = [...currentPayload, newEntry];

    const { data, error } = await supabase
      .from("reflection_sessions")
      .update({
        payload: updatedPayload,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id, title, status, started_at, completed_at, payload, ai_analysis")
      .single();

    if (error) {
      return NextResponse.json(
        { error: { message: "No se pudo guardar la respuesta" } },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        data,
        message: "Respuesta guardada correctamente",
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: { message: "Error inesperado al guardar la respuesta" } },
      { status: 500 },
    );
  }
}
