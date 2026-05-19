import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import EliminarCuentaPage from '@/app/eliminar-cuenta/page';

vi.mock('@/lib/api/auth', () => ({
  deleteAccount: vi.fn(async () => ({ message: 'ok' })),
}));

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe('EliminarCuenta Page', () => {
  it('muestra advertencia y exige confirmacion textual mas contrasena actual', async () => {
    const user = userEvent.setup();
    render(<EliminarCuentaPage />);

    expect(screen.getByText(/advertencia/i)).toBeInTheDocument();
    expect(screen.getByText(/irreversible/i)).toBeInTheDocument();

    const confirmInput = screen.getByPlaceholderText('ELIMINAR');
    const passwordInput = screen.getByPlaceholderText(/contrasena actual/i);
    const deleteButton = screen.getByRole('button', { name: /eliminar/i });

    expect(deleteButton).toBeDisabled();

    await user.type(confirmInput, 'ELIMINAR');
    expect(deleteButton).toBeDisabled();

    await user.type(passwordInput, 'PasswordActual123!');
    await waitFor(() => {
      expect(deleteButton).toBeEnabled();
    });
  });

  it('mantiene el enlace de cancelar hacia perfil', () => {
    render(<EliminarCuentaPage />);
    expect(screen.getByRole('link', { name: /cancelar/i })).toHaveAttribute(
      'href',
      '/perfil',
    );
  });

  it('muestra pantalla de exito y redirige al login tras eliminar', async () => {
    vi.useFakeTimers();
    render(<EliminarCuentaPage />);

    fireEvent.change(screen.getByPlaceholderText('ELIMINAR'), {
      target: { value: 'ELIMINAR' },
    });
    fireEvent.change(screen.getByPlaceholderText(/contrasena actual/i), {
      target: { value: 'PasswordActual123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /eliminar/i }));

    await Promise.resolve();
    expect(screen.getByText(/cuenta eliminada/i)).toBeInTheDocument();

    vi.advanceTimersByTime(2500);
    expect(pushMock).toHaveBeenCalledWith('/login');
    vi.useRealTimers();
  });
});
