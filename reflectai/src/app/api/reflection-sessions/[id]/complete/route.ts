import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";
import { completeReflectionSessionSchema } from "@/lib/validations/reflection";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { supabase, user, error: authError } = await getAuthenticatedUser();

    if (authError || !user) {
      return NextResponse.json({ error: { message: "No autorizado" } }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const validation = completeReflectionSessionSchema.safeParse(body);

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
        { error: { message: "La sesion ya esta completada" } },
        { status: 409 },
      );
    }

    const payload = Array.isArray(session.payload) ? session.payload : [];

    if (payload.length === 0) {
      return NextResponse.json(
        { error: { message: "No se puede completar una sesion sin respuestas" } },
        { status: 409 },
      );
    }

    const updateData: {
      status: "completed";
      completed_at: string;
      title?: string;
    } = {
      status: "completed",
      completed_at: new Date().toISOString(),
    };

    if (validation.data.title) {
      updateData.title = validation.data.title;
    }

    const { data, error } = await supabase
      .from("reflection_sessions")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id, title, status, started_at, completed_at, payload, ai_analysis")
      .single();

    if (error) {
      return NextResponse.json(
        { error: { message: "No se pudo completar la sesion" } },
        { status: 500 },
      );
    }

    return NextResponse.json({
      data,
      message: "Sesion completada correctamente",
    });
  } catch {
    return NextResponse.json(
      { error: { message: "Error inesperado al completar la sesion" } },
      { status: 500 },
    );
  }
}
