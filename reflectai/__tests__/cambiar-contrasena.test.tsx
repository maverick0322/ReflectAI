import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import CambiarContraseñaPage from "@/app/cambiar-contrasena/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("CambiarContraseña - Paso 1 (Verificar identidad)", () => {
  it("muestra error si se envía el paso 1 vacío", async () => {
    const user = userEvent.setup();
    render(<CambiarContraseñaPage />);

    const continueButton = screen.getByRole("button", { name: /continuar/i });
    await user.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText(/la contraseña actual es obligatoria/i)).toBeInTheDocument();
    });
  });

  it("muestra paso 1 de 2 en el header", () => {
    render(<CambiarContraseñaPage />);
    expect(screen.getByText(/paso 1 de 2/i)).toBeInTheDocument();
  });

  it("tiene un enlace para recuperar contraseña", () => {
    render(<CambiarContraseñaPage />);
    const link = screen.getByRole("link", { name: /¿olvidaste tu contraseña/i });
    expect(link).toHaveAttribute("href", "/recuperar");
  });

  it("tiene un botón de cancelar que redirige al perfil", () => {
    render(<CambiarContraseñaPage />);
    const link = screen.getByRole("link", { name: /cancelar/i });
    expect(link).toHaveAttribute("href", "/perfil");
  });
});

describe("CambiarContraseña - Paso 2 (Nueva contraseña)", () => {
  it("valida en tiempo real el paso 2 y limpia el error cuando la contraseña ya es válida", async () => {
    const user = userEvent.setup();
    render(<CambiarContraseñaPage />);

    const currentPassword = screen.getByPlaceholderText(/contraseña actual/i);
    await user.type(currentPassword, "Contraseña123");

    const continueButton = screen.getByRole("button", { name: /continuar/i });
    await user.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText(/paso 2 de 2/i)).toBeInTheDocument();
    });

    const passwordInputs = screen.getAllByPlaceholderText(/contraseña/i);
    const newPasswordInput = passwordInputs[0]; 

    await user.type(newPasswordInput, "validpassword123");

    await waitFor(() => {
      expect(
        screen.getByText(/debe contener al menos una mayúscula, una minúscula y un número/i)
      ).toBeInTheDocument();
    });

    await user.clear(newPasswordInput);
    await user.type(newPasswordInput, "ValidPassword123");

    await waitFor(() => {
      expect(
        screen.queryByText(/debe contener al menos una mayúscula, una minúscula y un número/i)
      ).not.toBeInTheDocument();
    });
  });

  it("permite volver atrás del paso 2 al paso 1", async () => {
    const user = userEvent.setup();
    render(<CambiarContraseñaPage />);

    const currentPassword = screen.getByPlaceholderText(/contraseña actual/i);
    await user.type(currentPassword, "Contraseña123");

    let continueButton = screen.getByRole("button", { name: /continuar/i });
    await user.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText(/paso 2 de 2/i)).toBeInTheDocument();
    });

    const backButton = screen.getByRole("button", { name: /atrás/i });
    await user.click(backButton);

    await waitFor(() => {
      expect(screen.getByText(/paso 1 de 2/i)).toBeInTheDocument();
    });
  });

  it("debe validar que las contraseñas coincidan", async () => {
    const user = userEvent.setup();
    render(<CambiarContraseñaPage />);

    const currentPassword = screen.getByPlaceholderText(/contraseña actual/i);
    await user.type(currentPassword, "Contraseña123");

    const continueButton = screen.getByRole("button", { name: /continuar/i });
    await user.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText(/paso 2 de 2/i)).toBeInTheDocument();
    });

    const passwordInputs = screen.getAllByPlaceholderText(/contraseña/i);
    const newPasswordInput = passwordInputs[0];
    const confirmPasswordInput = passwordInputs[1];

    await user.type(newPasswordInput, "ValidPassword123");
    await user.type(confirmPasswordInput, "DifferentPassword123");

    await waitFor(() => {
      expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument();
    });

    await user.clear(confirmPasswordInput);
    await user.type(confirmPasswordInput, "ValidPassword123");

    await waitFor(() => {
      expect(screen.queryByText(/las contraseñas no coinciden/i)).not.toBeInTheDocument();
    });
  });
});
