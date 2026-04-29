import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import EliminarCuentaPage from "@/app/eliminar-cuenta/page";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe("EliminarCuenta Page", () => {
  it("muestra advertencia con ícono de exclamación", () => {
    render(<EliminarCuentaPage />);
    expect(screen.getByText(/advertencia/i)).toBeInTheDocument();
    expect(screen.getByText(/irreversible/i)).toBeInTheDocument();
    expect(screen.getByText(/se perderán todos tus datos/i)).toBeInTheDocument();
  });

  it("requiere escribir ELIMINAR para habilitar el botón", async () => {
    const user = userEvent.setup();
    render(<EliminarCuentaPage />);

    const input = screen.getByPlaceholderText("ELIMINAR");
    const deleteButton = screen.getByRole("button", { name: /eliminar/i });

    // Botón debe estar deshabilitado al inicio
    expect(deleteButton).toBeDisabled();

    // Escribir texto incorrecto
    await user.type(input, "DELETE");
    expect(deleteButton).toBeDisabled();

    // Escribir el texto correcto
    await user.clear(input);
    await user.type(input, "ELIMINAR");

    // Botón debe habilitarse
    await waitFor(() => {
      expect(deleteButton).toBeEnabled();
    });
  });

  it("filtra solo letras y convierte a mayúsculas en el input de confirmación", async () => {
    const user = userEvent.setup();
    render(<EliminarCuentaPage />);

    const input = screen.getByPlaceholderText("ELIMINAR") as HTMLInputElement;

    // El handleInputChange debe estar en el input
    expect(input).toBeInTheDocument();

    // Escribir con números y minúsculas, debería convertir a mayúsculas y remover números
    await user.type(input, "eliminar");

    // Debe quedar solo ELIMINAR (todas mayúsculas)
    expect(input.value).toBe("ELIMINAR");
  });

  it("limita a 8 caracteres máximo", async () => {
    const user = userEvent.setup();
    render(<EliminarCuentaPage />);

    const input = screen.getByPlaceholderText("ELIMINAR") as HTMLInputElement;

    // Intentar escribir más de 8 letras
    await user.type(input, "ELIMINARMUCHASTEXTO");

    // Debe quedar solo los primeros 8
    expect(input.value).toBe("ELIMINAR");
  });

  it("tiene botón de cancelar que regresa a /perfil", () => {
    render(<EliminarCuentaPage />);

    const cancelButton = screen.getByRole("link", { name: /cancelar/i });
    expect(cancelButton).toHaveAttribute("href", "/perfil");
  });

  it("muestra pantalla de éxito después de eliminar (con palomita verde)", async () => {
    const user = userEvent.setup();
    render(<EliminarCuentaPage />);

    // Escribir confirmación
    const input = screen.getByPlaceholderText("ELIMINAR");
    await user.type(input, "ELIMINAR");

    // Clickear delete
    const deleteButton = screen.getByRole("button", { name: /eliminar/i });
    await user.click(deleteButton);

    // Debe mostrar pantalla de éxito
    await waitFor(() => {
      expect(screen.getByText(/cuenta.*eliminada/i)).toBeInTheDocument();
    });
  });

  it("aplica estilos disabled al botón cuando input es inválido", async () => {
    render(<EliminarCuentaPage />);

    const deleteButton = screen.getByRole("button", { name: /eliminar/i });

    // Debe tener clase de disabled
    expect(deleteButton).toHaveClass("cursor-not-allowed");

    const user = userEvent.setup();
    const input = screen.getByPlaceholderText("ELIMINAR");
    await user.type(input, "ELIMINAR");

    // Debe cambiar a estilos activos
    await waitFor(() => {
      expect(deleteButton).not.toHaveClass("cursor-not-allowed");
    });
  });

  it("redirige al login después de 2.5 segundos tras eliminar", () => {
    vi.useFakeTimers(); 
    
    // 1. Renderizamos
    render(<EliminarCuentaPage />);

    // 2. Llenamos el input síncronamente
    const input = screen.getByPlaceholderText("ELIMINAR");
    fireEvent.change(input, { target: { value: "ELIMINAR" } });

    // 3. Clickeamos el botón síncronamente
    const deleteButton = screen.getByRole("button", { name: /eliminar/i });
    fireEvent.click(deleteButton);

    // 4. Verificamos que en el milisegundo 0 NO ha redirigido
    expect(pushMock).not.toHaveBeenCalled();

    // 5. Mágicamente adelantamos el reloj 2.5 segundos exactos
    vi.advanceTimersByTime(2500);

    // 6. Verificamos directamente (sin waitFor, porque el tiempo ya pasó)
    expect(pushMock).toHaveBeenCalledWith("/login");
    
    // 7. Limpiamos
    vi.useRealTimers(); 
  });
});
