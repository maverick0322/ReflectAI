import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import CambiarContrasenaPage from '@/app/cambiar-contrasena/page';
import { changePassword, confirmRecovery } from '@/lib/api/auth';

const navigationMocks = vi.hoisted(() => ({
  push: vi.fn(),
  searchParams: new URLSearchParams(),
}));

vi.mock('@/lib/api/auth', () => ({
  changePassword: vi.fn(async () => ({ message: 'ok' })),
  confirmRecovery: vi.fn(async () => ({ message: 'ok' })),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: navigationMocks.push,
  }),
  useSearchParams: () => navigationMocks.searchParams,
}));

beforeEach(() => {
  vi.clearAllMocks();
  navigationMocks.searchParams = new URLSearchParams();
});

describe('CambiarContraseña - Paso 1 (Verificar identidad)', () => {
  it('muestra error si se envía el paso 1 vacío', async () => {
    const user = userEvent.setup();
    render(<CambiarContrasenaPage />);

    const continueButton = screen.getByRole('button', { name: /continuar/i });
    await user.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText(/la contraseña actual es obligatoria/i)).toBeInTheDocument();
    });
  });

  it('muestra paso 1 de 2 en el header', () => {
    render(<CambiarContrasenaPage />);
    expect(screen.getByText(/paso 1 de 2/i)).toBeInTheDocument();
  });

  it('tiene un enlace para recuperar contraseña', () => {
    render(<CambiarContrasenaPage />);
    const link = screen.getByRole('link', { name: /¿olvidaste tu contraseña/i });
    expect(link).toHaveAttribute('href', '/recuperar');
  });

  it('tiene un botón de cancelar que redirige al perfil', () => {
    render(<CambiarContrasenaPage />);
    const link = screen.getByRole('link', { name: /cancelar/i });
    expect(link).toHaveAttribute('href', '/perfil');
  });
});

describe('CambiarContraseña - Recuperación', () => {
  it('muestra directamente nueva contraseña cuando el callback ya creó la sesión', async () => {
    navigationMocks.searchParams = new URLSearchParams('mode=recovery');

    render(<CambiarContrasenaPage />);

    await waitFor(() => {
      expect(screen.getByText(/restablecer contraseña/i)).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText('Nueva contraseña')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/contraseña actual/i)).not.toBeInTheDocument();
    expect(confirmRecovery).not.toHaveBeenCalled();
  });

  it('confirma el codigo de recuperacion cuando llega directo a la pagina', async () => {
    navigationMocks.searchParams = new URLSearchParams('mode=recovery&code=code-1');

    render(<CambiarContrasenaPage />);

    await waitFor(() => {
      expect(confirmRecovery).toHaveBeenCalledWith('code-1');
    });

    expect(screen.getByText(/restablecer contraseña/i)).toBeInTheDocument();
  });
});

describe('CambiarContraseña - Paso 2 (Nueva contraseña)', () => {
  it('valida en tiempo real el paso 2 y limpia el error cuando la contraseña ya es válida', async () => {
    const user = userEvent.setup();
    render(<CambiarContrasenaPage />);

    const currentPassword = screen.getByPlaceholderText(/contraseña actual/i);
    await user.type(currentPassword, 'Contraseña123');

    const continueButton = screen.getByRole('button', { name: /continuar/i });
    await user.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText(/paso 2 de 2/i)).toBeInTheDocument();
    });

    const passwordInputs = screen.getAllByPlaceholderText(/contraseña/i);
    const newPasswordInput = passwordInputs[0];

    await user.type(newPasswordInput, 'validpassword123');

    await waitFor(() => {
      expect(
        screen.getByText(/debe contener al menos una mayúscula, una minúscula y un número/i),
      ).toBeInTheDocument();
    });

    await user.clear(newPasswordInput);
    await user.type(newPasswordInput, 'ValidPassword123');

    await waitFor(() => {
      expect(
        screen.queryByText(/debe contener al menos una mayúscula, una minúscula y un número/i),
      ).not.toBeInTheDocument();
    });
  });

  it('permite volver atrás del paso 2 al paso 1', async () => {
    const user = userEvent.setup();
    render(<CambiarContrasenaPage />);

    const currentPassword = screen.getByPlaceholderText(/contraseña actual/i);
    await user.type(currentPassword, 'Contraseña123');

    const continueButton = screen.getByRole('button', { name: /continuar/i });
    await user.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText(/paso 2 de 2/i)).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /atrás/i });
    await user.click(backButton);

    await waitFor(() => {
      expect(screen.getByText(/paso 1 de 2/i)).toBeInTheDocument();
    });
  });

  it('debe validar que las contraseñas coincidan', async () => {
    const user = userEvent.setup();
    render(<CambiarContrasenaPage />);

    const currentPassword = screen.getByPlaceholderText(/contraseña actual/i);
    await user.type(currentPassword, 'Contraseña123');

    const continueButton = screen.getByRole('button', { name: /continuar/i });
    await user.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText(/paso 2 de 2/i)).toBeInTheDocument();
    });

    const passwordInputs = screen.getAllByPlaceholderText(/contraseña/i);
    const newPasswordInput = passwordInputs[0];
    const confirmPasswordInput = passwordInputs[1];

    await user.type(newPasswordInput, 'ValidPassword123');
    await user.type(confirmPasswordInput, 'DifferentPassword123');

    await waitFor(() => {
      expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument();
    });

    await user.clear(confirmPasswordInput);
    await user.type(confirmPasswordInput, 'ValidPassword123');

    await waitFor(() => {
      expect(screen.queryByText(/las contraseñas no coinciden/i)).not.toBeInTheDocument();
    });
  });

  it('muestra error del backend si no se puede actualizar la contraseña', async () => {
    vi.mocked(changePassword).mockRejectedValueOnce(new Error('backend'));
    const user = userEvent.setup();
    render(<CambiarContrasenaPage />);

    await user.type(screen.getByPlaceholderText(/contraseña actual/i), 'Contraseña123');
    await user.click(screen.getByRole('button', { name: /continuar/i }));

    await waitFor(() => {
      expect(screen.getByText(/paso 2 de 2/i)).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText('Nueva contraseña'), 'ValidPassword123');
    await user.type(screen.getByPlaceholderText('Confirmar nueva contraseña'), 'ValidPassword123');
    await user.click(screen.getByRole('button', { name: /actualizar/i }));

    expect(
      await screen.findByText(/No se pudo actualizar la contraseña/i),
    ).toBeInTheDocument();
  });
});
