import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import RegisterPage from '@/app/registro/page';
import { ApiError } from '@/lib/api/http';

const { pushMock, registerUserMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  registerUserMock: vi.fn(async () => ({ message: 'ok' })),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock('@/lib/api/auth', () => ({
  registerUser: registerUserMock,
}));

describe('Registro Page', () => {
  beforeEach(() => {
    pushMock.mockReset();
    registerUserMock.mockReset();
    registerUserMock.mockResolvedValue({ message: 'ok' });
  });

  it('muestra la estructura principal del formulario', () => {
    render(<RegisterPage />);

    expect(screen.getByRole('heading', { name: /crear cuenta/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrarse/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /inicia sesión aquí/i })).toHaveAttribute(
      'href',
      '/login',
    );
  });

  it('valida los campos requeridos al enviar vacío', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.click(screen.getByRole('button', { name: /registrarse/i }));

    await waitFor(() => {
      expect(screen.getByText(/el nombre es obligatorio/i)).toBeInTheDocument();
    });
  });

  it('redirige a login cuando el registro se completa', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText(/nombre/i), 'Ana');
    await user.type(screen.getByPlaceholderText(/^correo electrónico$/i), 'ana@example.com');
    await user.type(
      screen.getByPlaceholderText(/confirmar correo electrónico/i),
      'ana@example.com',
    );
    await user.type(screen.getByPlaceholderText(/^contraseña$/i), 'ValidPassword123');
    await user.type(
      screen.getByPlaceholderText(/confirmar contraseña/i),
      'ValidPassword123',
    );
    await user.type(screen.getByPlaceholderText(/fecha de nacimiento/i), '1998-05-10');

    await user.click(screen.getByRole('button', { name: /registrarse/i }));

    await waitFor(() => {
      expect(registerUserMock).toHaveBeenCalledWith({
        firstName: 'Ana',
        lastName: '',
        email: 'ana@example.com',
        password: 'ValidPassword123',
        birthDate: '1998-05-10',
      });
      expect(pushMock).toHaveBeenCalledWith('/login');
    });
  });

  it('muestra el error del backend si el registro falla', async () => {
    const user = userEvent.setup();
    registerUserMock.mockRejectedValue(
      new ApiError('No se pudo crear la cuenta', 400, {
        message: 'Ese correo ya está registrado',
      }),
    );

    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText(/nombre/i), 'Ana');
    await user.type(screen.getByPlaceholderText(/^correo electrónico$/i), 'ana@example.com');
    await user.type(
      screen.getByPlaceholderText(/confirmar correo electrónico/i),
      'ana@example.com',
    );
    await user.type(screen.getByPlaceholderText(/^contraseña$/i), 'ValidPassword123');
    await user.type(
      screen.getByPlaceholderText(/confirmar contraseña/i),
      'ValidPassword123',
    );
    await user.type(screen.getByPlaceholderText(/fecha de nacimiento/i), '1998-05-10');

    await user.click(screen.getByRole('button', { name: /registrarse/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Ese correo ya está registrado');
    });
  });
});
