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

    expect(deleteButton).toBeDisabled();

    await user.type(input, "DELETE");
    expect(deleteButton).toBeDisabled();

    await user.clear(input);
    await user.type(input, "ELIMINAR");

    await waitFor(() => {
      expect(deleteButton).toBeEnabled();
    });
  });

  it("filtra solo letras y convierte a mayúsculas en el input de confirmación", async () => {
    const user = userEvent.setup();
    render(<EliminarCuentaPage />);

    const input = screen.getByPlaceholderText("ELIMINAR") as HTMLInputElement;

    expect(input).toBeInTheDocument();

    await user.type(input, "eliminar");

    expect(input.value).toBe("ELIMINAR");
  });

  it("limita a 8 caracteres máximo", async () => {
    const user = userEvent.setup();
    render(<EliminarCuentaPage />);

    const input = screen.getByPlaceholderText("ELIMINAR") as HTMLInputElement;

    await user.type(input, "ELIMINARMUCHASTEXTO");

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

    const input = screen.getByPlaceholderText("ELIMINAR");
    await user.type(input, "ELIMINAR");

    const deleteButton = screen.getByRole("button", { name: /eliminar/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(/cuenta.*eliminada/i)).toBeInTheDocument();
    });
  });

  it("aplica estilos disabled al botón cuando input es inválido", async () => {
    render(<EliminarCuentaPage />);

    const deleteButton = screen.getByRole("button", { name: /eliminar/i });

    expect(deleteButton).toHaveClass("cursor-not-allowed");

    const user = userEvent.setup();
    const input = screen.getByPlaceholderText("ELIMINAR");
    await user.type(input, "ELIMINAR");

    await waitFor(() => {
      expect(deleteButton).not.toHaveClass("cursor-not-allowed");
    });
  });

  it("redirige al login después de 2.5 segundos tras eliminar", () => {
    vi.useFakeTimers(); 
    
    render(<EliminarCuentaPage />);

    const input = screen.getByPlaceholderText("ELIMINAR");
    fireEvent.change(input, { target: { value: "ELIMINAR" } });

    const deleteButton = screen.getByRole("button", { name: /eliminar/i });
    fireEvent.click(deleteButton);

    expect(pushMock).not.toHaveBeenCalled();

    vi.advanceTimersByTime(2500);

    expect(pushMock).toHaveBeenCalledWith("/login");
    
    vi.useRealTimers(); 
  });
});
