import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { supabase, user, error: authError } = await getAuthenticatedUser();

    if (authError || !user) {
      return NextResponse.json({ error: { message: "No autorizado" } }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("reflection_sessions")
      .select("id, title, status, started_at, completed_at, payload, ai_analysis")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: { message: "Sesion no encontrada" } },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data,
      message: "Sesion obtenida correctamente",
    });
  } catch {
    return NextResponse.json(
      { error: { message: "Error inesperado al obtener la sesion" } },
      { status: 500 },
    );
  }
}
