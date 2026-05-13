import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import NuevaSesionPage from "@/app/nueva-sesion/page";

const {
  createReflectionSessionMock,
  getReflectionSessionMock,
  addReflectionResponseMock,
  completeReflectionSessionMock,
  useSearchParamsMock,
  routerMock,
} = vi.hoisted(() => {
  const baseResponse = {
    data: {
      id: "session-1",
      title: "Sesion de prueba",
      status: "draft",
      started_at: "2026-05-07T10:00:00.000Z",
      completed_at: null,
      payload: {
        metadata: {
          version: "1.1",
          started_at: "2026-05-07T10:00:00.000Z",
        },
        responses: [],
      },
      ai_analysis: {
        summary: "Resumen generado",
        recommendation: "Recomendacion generada",
        encouraging_message: "Mensaje alentador",
        professional_support_reminder:
          "Lo mejor es consultar a un profesional si el malestar persiste.",
      },
    },
    message: "ok",
  };

  return {
    createReflectionSessionMock: vi.fn(async () => baseResponse),
    getReflectionSessionMock: vi.fn(async () => baseResponse),
    addReflectionResponseMock: vi.fn(async () => baseResponse),
    completeReflectionSessionMock: vi.fn(async () => baseResponse),
    useSearchParamsMock: vi.fn(() => new URLSearchParams()),
    routerMock: {
      push: vi.fn(),
      back: vi.fn(),
    },
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
  useSearchParams: () => useSearchParamsMock(),
}));

vi.mock("@/lib/api/reflection", () => ({
  createReflectionSession: () => createReflectionSessionMock(),
  getReflectionSession: (...args: unknown[]) => getReflectionSessionMock(...args),
  requestNextQuestion: vi.fn(async () => ({
    data: { done: true },
  })),
  addReflectionResponse: (...args: unknown[]) => addReflectionResponseMock(...args),
  completeReflectionSession: (...args: unknown[]) => completeReflectionSessionMock(...args),
}));

const renderWizard = async () => {
  render(<NuevaSesionPage />);
  return screen.findByPlaceholderText(/Escribe aquí.../i);
};

describe("Wizard Nueva Sesión (Integración UI)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
  });

  it("Camino Malo: No debe dejar avanzar del Paso 1 si el campo está vacío", async () => {
    const user = userEvent.setup();
    await renderWizard();

    const btnSiguiente = screen.getByRole("button", { name: /siguiente/i });
    await user.click(btnSiguiente);

    expect(
      await screen.findByText(/Por favor, describe brevemente la situación/i)
    ).toBeInTheDocument();
    
    expect(
      screen.queryByText(/¿cuál fue el primer pensamiento que cruzó tu mente/i)
    ).not.toBeInTheDocument();
  });

  it("Camino Malo: Debe bloquear el Paso 2 si el texto es muy corto (Evitación)", async () => {
    const user = userEvent.setup();
    await renderWizard();

    await user.type(screen.getByPlaceholderText(/Escribe aquí.../i), "Discutí con mi jefe.");
    await user.click(screen.getByRole("button", { name: /siguiente/i }));

    expect(await screen.findByText(/¿cuál fue el primer pensamiento/i)).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText(/Me dije a mí mismo que.../i), "no");
    
    await user.click(screen.getByRole("button", { name: "Enojo" }));

    await user.click(screen.getByRole("button", { name: /siguiente/i }));

    expect(
      await screen.findByText(/Identificar el pensamiento es el paso más difícil/i)
    ).toBeInTheDocument();
  });

  it("Edge Case: Debe poder guardar un borrador y regresar entre pasos sin perder datos", async () => {
    const user = userEvent.setup();
    const inputPaso1 = await renderWizard();
    await user.type(inputPaso1, "Texto de prueba para borrador");
    await user.click(screen.getByRole("button", { name: /siguiente/i }));

    expect(await screen.findByText(/¿Qué emoción principal/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Pausar \/ Guardar borrador/i }));
    expect(await screen.findByText(/Borrador guardado correctamente/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Atrás/i }));

    expect(screen.getByPlaceholderText(/Escribe aquí.../i)).toHaveValue("Texto de prueba para borrador");
  });

  it("Camino Feliz: Debe completar los 4 pasos y mostrar la pantalla de éxito", async () => {
    const user = userEvent.setup();
    await renderWizard();

    await user.type(screen.getByPlaceholderText(/Escribe aquí.../i), "Un problema en el trabajo");
    await user.click(screen.getByRole("button", { name: /siguiente/i }));

    await screen.findByText(/primer pensamiento/i);
    await user.type(screen.getByPlaceholderText(/Me dije a mí mismo que.../i), "No soy lo suficientemente bueno");
    await user.click(screen.getByRole("button", { name: "Tristeza" }));
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "8" } });
    
    await user.click(screen.getByRole("button", { name: /siguiente/i }));

    await screen.findByText(/propósito oculto/i);
    await user.type(screen.getByPlaceholderText(/Siento que mi emoción intentaba.../i), "Protegerme del fracaso");
    await user.type(screen.getByPlaceholderText(/Mis acciones, mis palabras/i), "Mi esfuerzo");
    await user.type(screen.getByPlaceholderText(/Sus reacciones, sus decisiones/i), "La opinión del cliente");
    await user.click(screen.getByRole("button", { name: /siguiente/i }));

    await screen.findByText(/Sabiendo lo que sabes ahora/i);
    await user.type(screen.getByPlaceholderText(/Una perspectiva alternativa es.../i), "Hice lo mejor que pude con la información que tenía.");
    
    await user.click(screen.getByRole("button", { name: /Finalizar Reflexión/i }));

    await waitFor(() => {
      expect(screen.getByText(/¡Reflexión Guardada!/i)).toBeInTheDocument();
    });
  }, 10000);

  it("UI Reactiva: Debe quitar el mensaje de error tan pronto como el usuario escribe algo válido", async () => {
    const user = userEvent.setup();
    await renderWizard();

    const btnSiguiente = screen.getByRole("button", { name: /siguiente/i });
    await user.click(btnSiguiente);

    const mensajeError = await screen.findByText(/Por favor, describe brevemente la situación/i);
    expect(mensajeError).toBeInTheDocument();

    const inputPaso1 = screen.getByPlaceholderText(/Escribe aquí.../i);
    await user.type(inputPaso1, "Hola mundo");

    await waitFor(() => {
      expect(screen.queryByText(/Por favor, describe brevemente la situación/i)).not.toBeInTheDocument();
    });
  });

  it("Camino Malo: No debe dejar Finalizar Reflexión si la alternativa está vacía", async () => {
    const user = userEvent.setup();
    await renderWizard();

    await user.type(screen.getByPlaceholderText(/Escribe aquí.../i), "Situación válida");
    await user.click(screen.getByRole("button", { name: /siguiente/i }));

    await screen.findByText(/primer pensamiento/i);
    await user.type(screen.getByPlaceholderText(/Me dije a mí mismo que.../i), "Pensamiento válido");
    await user.click(screen.getByRole("button", { name: "Enojo" }));
    await user.click(screen.getByRole("button", { name: /siguiente/i }));

    await screen.findByText(/propósito oculto/i);
    await user.type(screen.getByPlaceholderText(/Siento que mi emoción intentaba.../i), "Propósito válido");
    await user.type(screen.getByPlaceholderText(/Mis acciones, mis palabras/i), "Control mío válido");
    await user.type(screen.getByPlaceholderText(/Sus reacciones, sus decisiones/i), "Control otros válido");
    await user.click(screen.getByRole("button", { name: /siguiente/i }));

    expect(await screen.findByText(/Sabiendo lo que sabes ahora/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Finalizar Reflexión/i }));

    expect(
      await screen.findByText(/Plantea una perspectiva alternativa/i)
    ).toBeInTheDocument();

    expect(screen.queryByText(/¡Reflexión Guardada!/i)).not.toBeInTheDocument();
  });

  it("debe reanudar una sesion existente sin crear una nueva", async () => {
    const user = userEvent.setup();
    useSearchParamsMock.mockReturnValue(new URLSearchParams("sessionId=session-1"));
    getReflectionSessionMock.mockResolvedValueOnce({
      data: {
        id: "session-1",
        title: "Sesion pausada",
        status: "draft",
        started_at: "2026-05-07T10:00:00.000Z",
        completed_at: null,
        payload: {
          metadata: {
            version: "1.1",
            started_at: "2026-05-07T10:00:00.000Z",
          },
          responses: [
            {
              id: "Q1_SIT",
              text: "Una situacion guardada previamente",
            },
          ],
        },
        ai_analysis: {},
      },
      message: "ok",
    });

    render(<NuevaSesionPage />);

    expect(await screen.findByText(/primer pensamiento/i)).toBeInTheDocument();
    await user.type(
      screen.getByPlaceholderText(/Me dije/i),
      "Un pensamiento suficientemente claro",
    );
    await user.click(screen.getByRole("button", { name: "Enojo" }));
    await user.click(screen.getByRole("button", { name: /siguiente/i }));

    await waitFor(() => {
      expect(addReflectionResponseMock).toHaveBeenCalledWith(
        "session-1",
        expect.objectContaining({ id: "Q2_THO" }),
        undefined,
      );
    });
    expect(createReflectionSessionMock).not.toHaveBeenCalled();
  });

  it("debe volver al paso anterior con respuestas rehidratadas al reanudar", async () => {
    const user = userEvent.setup();
    useSearchParamsMock.mockReturnValue(new URLSearchParams("sessionId=session-1"));
    getReflectionSessionMock.mockResolvedValueOnce({
      data: {
        id: "session-1",
        title: "Sesion pausada",
        status: "draft",
        started_at: "2026-05-07T10:00:00.000Z",
        completed_at: null,
        payload: {
          metadata: {
            version: "1.1",
            started_at: "2026-05-07T10:00:00.000Z",
            resume_step: 4,
          },
          responses: [
            { id: "Q1_SIT", text: "Una situacion guardada previamente" },
            { id: "Q2_THO", text: "Un pensamiento ya guardado" },
            { id: "Q3_EMO", text: "Enojo", category: "primary" },
            { id: "Q4_INT", value: 7 },
          ],
        },
        ai_analysis: {},
      },
      message: "ok",
    });

    render(<NuevaSesionPage />);

    expect(await screen.findByText(/oculto/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /atr/i }));

    expect(await screen.findByText(/primer pensamiento/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Me dije/i)).toHaveValue(
      "Un pensamiento ya guardado",
    );
    expect(screen.getByRole("button", { name: "Enojo" })).toHaveClass("bg-indigo-500");
    expect(screen.getByRole("slider")).toHaveValue("7");
  });
});
