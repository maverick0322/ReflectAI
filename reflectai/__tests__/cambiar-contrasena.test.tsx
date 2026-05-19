import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import CambiarContrasenaPage from '@/app/cambiar-contrasena/page';
import {
  changePassword,
  confirmRecovery,
  fetchSessionStatus,
  verifyCurrentPassword,
} from '@/lib/api/auth';

const navigationMocks = vi.hoisted(() => ({
  push: vi.fn(),
  searchParams: new URLSearchParams(),
}));

vi.mock('@/lib/api/auth', () => ({
  changePassword: vi.fn(async () => ({ message: 'ok' })),
  confirmRecovery: vi.fn(async () => ({ message: 'ok' })),
  fetchSessionStatus: vi.fn(async () => ({ authenticated: true })),
  verifyCurrentPassword: vi.fn(async () => ({ message: 'ok' })),
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
  vi.mocked(fetchSessionStatus).mockResolvedValue({ authenticated: true });
});

describe('CambiarContrasena - Paso 1 (Verificar identidad)', () => {
  it('muestra error si se envia el paso 1 vacio', async () => {
    const user = userEvent.setup();
    render(<CambiarContrasenaPage />);

    await user.click(screen.getByRole('button', { name: /continuar/i }));

    expect(
      await screen.findAllByText(/contras.* actual es obligatoria/i),
    ).toHaveLength(2);
    expect(screen.getByRole('alert')).toHaveTextContent(/contras.* actual es obligatoria/i);
  });

  it('muestra paso 1 de 2 en el header', () => {
    render(<CambiarContrasenaPage />);
    expect(screen.getByText(/paso 1 de 2/i)).toBeInTheDocument();
  });

  it('tiene un enlace para recuperar contrasena', () => {
    render(<CambiarContrasenaPage />);
    expect(screen.getByRole('link', { name: /olvidaste tu contrase/i })).toHaveAttribute(
      'href',
      '/recuperar',
    );
  });

  it('tiene un boton de cancelar que redirige al perfil', () => {
    render(<CambiarContrasenaPage />);
    expect(screen.getByRole('link', { name: /cancelar/i })).toHaveAttribute(
      'href',
      '/perfil',
    );
  });

  it('no avanza al paso 2 si la contrasena actual es incorrecta', async () => {
    vi.mocked(verifyCurrentPassword).mockRejectedValueOnce(new Error('bad-current-password'));
    const user = userEvent.setup();
    render(<CambiarContrasenaPage />);

    await user.type(screen.getByPlaceholderText(/contrase.* actual/i), 'Contrasena123');
    await user.click(screen.getByRole('button', { name: /continuar/i }));

    expect(
      await screen.findAllByText(/no se pudo validar la contrase/i),
    ).toHaveLength(2);
    expect(screen.getByRole('alert')).toHaveTextContent(/no se pudo validar la contrase/i);
    expect(screen.queryByText(/paso 2 de 2/i)).not.toBeInTheDocument();
  });
});

describe('CambiarContrasena - Recuperacion', () => {
  it('muestra directamente nueva contrasena cuando el callback ya creo la sesion', async () => {
    navigationMocks.searchParams = new URLSearchParams('mode=recovery');

    render(<CambiarContrasenaPage />);

    await waitFor(() => {
      expect(screen.getByText(/restablecer contrase/i)).toBeInTheDocument();
    });

    expect(screen.getAllByPlaceholderText(/contrase/i)[0]).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/contrase.* actual/i)).not.toBeInTheDocument();
    expect(confirmRecovery).not.toHaveBeenCalled();
    expect(fetchSessionStatus).toHaveBeenCalled();
  });

  it('confirma el codigo de recuperacion cuando llega directo a la pagina', async () => {
    navigationMocks.searchParams = new URLSearchParams('mode=recovery&code=code-1');

    render(<CambiarContrasenaPage />);

    await waitFor(() => {
      expect(confirmRecovery).toHaveBeenCalledWith('code-1');
    });

    expect(screen.getByText(/restablecer contrase/i)).toBeInTheDocument();
  });
});

describe('CambiarContrasena - Paso 2 (Nueva contrasena)', () => {
  it('valida la contrasena actual antes de mostrar el paso 2', async () => {
    const user = userEvent.setup();
    render(<CambiarContrasenaPage />);

    await user.type(screen.getByPlaceholderText(/contrase.* actual/i), 'Contrasena123');
    await user.click(screen.getByRole('button', { name: /continuar/i }));

    await waitFor(() => {
      expect(verifyCurrentPassword).toHaveBeenCalledWith('Contrasena123');
    });

    expect(await screen.findByText(/paso 2 de 2/i)).toBeInTheDocument();
  });

  it('valida en tiempo real el paso 2 y limpia el error cuando la contrasena ya es valida', async () => {
    const user = userEvent.setup();
    render(<CambiarContrasenaPage />);

    await user.type(screen.getByPlaceholderText(/contrase.* actual/i), 'Contrasena123');
    await user.click(screen.getByRole('button', { name: /continuar/i }));

    expect(await screen.findByText(/paso 2 de 2/i)).toBeInTheDocument();

    const [newPasswordInput, confirmPasswordInput] = screen.getAllByPlaceholderText(/contrase/i);

    await user.type(newPasswordInput, 'validpassword123');

    expect(
      await screen.findAllByText(
        /debe tener al menos 8 caracteres, una may.*scula, una min.*scula, un n.*mero y un car.*cter especial/i,
      ),
    ).toHaveLength(2);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(newPasswordInput).toHaveAttribute('aria-invalid', 'true');

    await user.clear(newPasswordInput);
    await user.type(newPasswordInput, 'ValidPassword123!');
    await user.type(confirmPasswordInput, 'ValidPassword123!');

    await waitFor(() => {
      expect(
        screen.queryByText(
          /debe tener al menos 8 caracteres, una may.*scula, una min.*scula, un n.*mero y un car.*cter especial/i,
        ),
      ).not.toBeInTheDocument();
    });
  });

  it('permite volver atras del paso 2 al paso 1', async () => {
    const user = userEvent.setup();
    render(<CambiarContrasenaPage />);

    await user.type(screen.getByPlaceholderText(/contrase.* actual/i), 'Contrasena123');
    await user.click(screen.getByRole('button', { name: /continuar/i }));

    expect(await screen.findByText(/paso 2 de 2/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /atr.s/i }));

    expect(await screen.findByText(/paso 1 de 2/i)).toBeInTheDocument();
  });

  it('marca ambos campos cuando las contrasenas no coinciden', async () => {
    const user = userEvent.setup();
    render(<CambiarContrasenaPage />);

    await user.type(screen.getByPlaceholderText(/contrase.* actual/i), 'Contrasena123');
    await user.click(screen.getByRole('button', { name: /continuar/i }));

    expect(await screen.findByText(/paso 2 de 2/i)).toBeInTheDocument();

    const passwordInputs = screen.getAllByPlaceholderText(/contrase/i);
    const [newPasswordInput, confirmPasswordInput] = passwordInputs;

    await user.type(newPasswordInput, 'ValidPassword123!');
    await user.type(confirmPasswordInput, 'DifferentPassword123!');

    await waitFor(() => {
      expect(screen.getAllByText(/las contrase.* no coinciden/i)).toHaveLength(1);
    });

    expect(newPasswordInput).toHaveAttribute('aria-invalid', 'true');
    expect(confirmPasswordInput).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent(/las contrase.* no coinciden/i);

    await user.clear(confirmPasswordInput);
    await user.type(confirmPasswordInput, 'ValidPassword123!');

    await waitFor(() => {
      expect(screen.queryAllByText(/las contrase.* no coinciden/i)).toHaveLength(0);
    });
  });

  it('muestra error del backend si no se puede actualizar la contrasena', async () => {
    vi.mocked(changePassword).mockRejectedValueOnce(new Error('backend'));
    const user = userEvent.setup();
    render(<CambiarContrasenaPage />);

    await user.type(screen.getByPlaceholderText(/contrase.* actual/i), 'Contrasena123');
    await user.click(screen.getByRole('button', { name: /continuar/i }));

    expect(await screen.findByText(/paso 2 de 2/i)).toBeInTheDocument();

    await user.type(screen.getAllByPlaceholderText(/contrase/i)[0], 'ValidPassword123!');
    await user.type(
      screen.getAllByPlaceholderText(/contrase/i)[1],
      'ValidPassword123!',
    );
    await user.click(screen.getByRole('button', { name: /actualizar/i }));

    expect(
      await screen.findAllByText(/no se pudo actualizar la contrase/i),
    ).toHaveLength(1);
    expect(screen.getByRole('alert')).toHaveTextContent(/no se pudo actualizar la contrase/i);
  });
});
