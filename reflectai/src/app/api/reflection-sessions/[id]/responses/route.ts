import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";
import { applyMetadataPatch, normalizePayload } from "@/lib/reflection/payload";
import { addReflectionResponseSchema } from "@/lib/validations/reflection";

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
      .select("id, status, payload, started_at")
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

    const currentPayload = normalizePayload(
      session.payload,
      session.started_at ?? new Date().toISOString(),
    );

    const existingResponses = currentPayload.responses;
    const existingIndex = existingResponses.findIndex(
      (response) => response.id === validation.data.response.id,
    );

    const nextResponses = existingIndex >= 0
      ? existingResponses.map((response, index) =>
          index === existingIndex ? validation.data.response : response,
        )
      : [...existingResponses, validation.data.response];

    const updatedPayload = applyMetadataPatch(
      {
        ...currentPayload,
        responses: nextResponses,
      },
      validation.data.metadataPatch,
    );

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
