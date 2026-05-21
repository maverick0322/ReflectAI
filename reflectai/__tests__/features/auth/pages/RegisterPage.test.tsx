import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import RegisterPage from '@/app/register/page';
import { ApiError } from '@/core/api/http';

const { pushMock, registerUserMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  registerUserMock: vi.fn(async () => ({ message: 'ok' })),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock('@/features/auth/services/authService', () => ({
  registerUser: registerUserMock,
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    pushMock.mockReset();
    registerUserMock.mockReset();
    registerUserMock.mockResolvedValue({ message: 'ok' });
  });

  it('renders the main register form structure', () => {
    render(<RegisterPage />);

    expect(screen.getByRole('heading', { name: /crear cuenta/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrarme/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /inicia sesi(?:o|\u00f3)n aqu(?:i|\u00ed)/i })).toHaveAttribute(
      'href',
      '/login',
    );
  });

  it('validates required fields when submitting an empty form', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.click(screen.getByRole('button', { name: /registrarme/i }));

    await waitFor(() => {
      expect(screen.getByText(/el nombre es obligatorio/i)).toBeInTheDocument();
      expect(screen.getAllByText(/el correo es obligatorio/i).length).toBeGreaterThan(0);
      expect(
        screen.getAllByText(/la contrase(?:n|\u00f1)a es obligatoria/i).length,
      ).toBeGreaterThan(0);
      expect(screen.getByText(/la fecha de nacimiento es obligatoria/i)).toBeInTheDocument();
      expect(screen.getByText(/revisa los campos marcados/i)).toBeInTheDocument();
    });
  });

  it('shows confirm email validation when the form is checked', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText(/nombre/i), 'Ana');
    await user.type(
      screen.getByPlaceholderText(/^correo electr(?:o|\u00f3)nico$/i),
      'ana@example.com',
    );
    await user.type(screen.getByPlaceholderText(/^confirma tu correo$/i), 'ana@other.com');
    await user.type(
      screen.getByPlaceholderText(/^contrase(?:n|\u00f1)a$/i),
      'ValidPassword123',
    );
    await user.type(
      screen.getByPlaceholderText(/^confirma tu contrase(?:n|\u00f1)a$/i),
      'ValidPassword123',
    );
    await user.type(screen.getByPlaceholderText(/^dd\/mm\/yyyy$/i), '10/05/1998');

    await user.click(screen.getByRole('button', { name: /registrarme/i }));

    await waitFor(() => {
      expect(screen.getByText(/los correos no coinciden/i)).toBeInTheDocument();
    });
  });

  it('clears field validation messages as each field is corrected', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.click(screen.getByRole('button', { name: /registrarme/i }));

    expect(screen.getByText(/el nombre es obligatorio/i)).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText(/nombre/i), 'Ana');

    await waitFor(() => {
      expect(screen.queryByText(/el nombre es obligatorio/i)).not.toBeInTheDocument();
    });

    expect(screen.getAllByText(/el correo es obligatorio/i).length).toBeGreaterThan(0);
    await user.type(
      screen.getByPlaceholderText(/^correo electr(?:o|\u00f3)nico$/i),
      'ana@example.com',
    );

    await waitFor(() => {
      expect(screen.getAllByText(/el correo es obligatorio/i).length).toBe(1);
    });

    await user.type(screen.getByPlaceholderText(/^confirma tu correo$/i), 'ana@example.com');

    await waitFor(() => {
      expect(screen.queryByText(/el correo es obligatorio/i)).not.toBeInTheDocument();
    });
  });

  it('redirects to login when registration succeeds', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText(/nombre/i), 'Ana');
    await user.type(
      screen.getByPlaceholderText(/^correo electr(?:o|\u00f3)nico$/i),
      'ana@example.com',
    );
    await user.type(screen.getByPlaceholderText(/^confirma tu correo$/i), 'ana@example.com');
    await user.type(
      screen.getByPlaceholderText(/^contrase(?:n|\u00f1)a$/i),
      'ValidPassword123',
    );
    await user.type(
      screen.getByPlaceholderText(/^confirma tu contrase(?:n|\u00f1)a$/i),
      'ValidPassword123',
    );
    await user.type(screen.getByPlaceholderText(/^dd\/mm\/yyyy$/i), '10/05/1998');

    await user.click(screen.getByRole('button', { name: /registrarme/i }));

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

  it('shows the backend error when registration fails', async () => {
    const user = userEvent.setup();
    registerUserMock.mockRejectedValue(
      new ApiError('Unable to create account', 400, {
        message: 'That email is already registered',
      }),
    );

    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText(/nombre/i), 'Ana');
    await user.type(
      screen.getByPlaceholderText(/^correo electr(?:o|\u00f3)nico$/i),
      'ana@example.com',
    );
    await user.type(screen.getByPlaceholderText(/^confirma tu correo$/i), 'ana@example.com');
    await user.type(
      screen.getByPlaceholderText(/^contrase(?:n|\u00f1)a$/i),
      'ValidPassword123',
    );
    await user.type(
      screen.getByPlaceholderText(/^confirma tu contrase(?:n|\u00f1)a$/i),
      'ValidPassword123',
    );
    await user.type(screen.getByPlaceholderText(/^dd\/mm\/yyyy$/i), '10/05/1998');

    await user.click(screen.getByRole('button', { name: /registrarme/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('That email is already registered');
    });
  });
});
