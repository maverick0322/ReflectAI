import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import RecoverPasswordPage from '@/app/recover/page';
import { ApiError } from '@/core/api/http';

const { recoverPasswordMock } = vi.hoisted(() => ({
  recoverPasswordMock: vi.fn(async (...args: unknown[]) => {
    void args;
    return { message: 'ok' };
  }),
}));

vi.mock('@/features/auth/services/authService', () => ({
  recoverPassword: (email: string) => recoverPasswordMock(email),
}));

describe('RecoverPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    recoverPasswordMock.mockResolvedValue({ message: 'ok' });
  });

  it('renders the recovery form', () => {
    render(<RecoverPasswordPage />);

    expect(screen.getByRole('heading', { name: /recuperar acceso/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar enlace/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /volver a iniciar sesiÓn/i })).toHaveAttribute(
      'href',
      '/login',
    );
  });

  it('validates the email field when submitting an empty form', async () => {
    const user = userEvent.setup();
    render(<RecoverPasswordPage />);

    await user.click(screen.getByRole('button', { name: /enviar enlace/i }));

    await waitFor(() => {
      expect(screen.getByText(/el correo es obligatorio/i)).toBeInTheDocument();
    });
  });

  it('shows the success state when the reset link is sent', async () => {
    const user = userEvent.setup();
    render(<RecoverPasswordPage />);

    await user.type(screen.getByPlaceholderText(/^correo electrÓnico$/i), 'ana@example.com');
    await user.click(screen.getByRole('button', { name: /enviar enlace/i }));

    await waitFor(() => {
      expect(recoverPasswordMock).toHaveBeenCalledWith('ana@example.com');
      expect(screen.getByRole('status')).toHaveTextContent(/revisa tu bandeja de entrada/i);
    });
  });

  it('shows the backend error when sending the link fails', async () => {
    const user = userEvent.setup();
    recoverPasswordMock.mockRejectedValueOnce(
      new ApiError('recover failed', 400, { message: 'Email not found' }),
    );

    render(<RecoverPasswordPage />);

    await user.type(screen.getByPlaceholderText(/^correo electrÓnico$/i), 'ana@example.com');
    await user.click(screen.getByRole('button', { name: /enviar enlace/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Email not found');
  });
});
