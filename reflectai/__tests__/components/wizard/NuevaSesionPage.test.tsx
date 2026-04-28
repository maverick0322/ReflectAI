import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import NuevaSesionPage from "@/app/nueva-sesion/page"; 


const mockPush = vi.fn();
const mockBack = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

global.alert = vi.fn();

describe("Wizard Nueva Sesión (Integración UI)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Camino Malo: No debe dejar avanzar del Paso 1 si el campo está vacío", async () => {
    const user = userEvent.setup();
    render(<NuevaSesionPage />);

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
    render(<NuevaSesionPage />);

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
    render(<NuevaSesionPage />);

    const inputPaso1 = screen.getByPlaceholderText(/Escribe aquí.../i);
    await user.type(inputPaso1, "Texto de prueba para borrador");
    await user.click(screen.getByRole("button", { name: /siguiente/i }));

    expect(await screen.findByText(/¿Qué emoción principal/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Pausar \/ Guardar borrador/i }));
    expect(global.alert).toHaveBeenCalledWith("Progreso guardado localmente.");

    await user.click(screen.getByRole("button", { name: /Atrás/i }));

    expect(screen.getByPlaceholderText(/Escribe aquí.../i)).toHaveValue("Texto de prueba para borrador");
  });

  it("Camino Feliz: Debe completar los 4 pasos y mostrar la pantalla de éxito", async () => {
    const user = userEvent.setup();
    render(<NuevaSesionPage />);

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
  });

  it("UI Reactiva: Debe quitar el mensaje de error tan pronto como el usuario escribe algo válido", async () => {
    const user = userEvent.setup();
    render(<NuevaSesionPage />);

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
    render(<NuevaSesionPage />);

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
});