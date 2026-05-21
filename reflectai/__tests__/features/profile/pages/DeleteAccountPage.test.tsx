import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import DeleteAccountPage from '@/app/delete-account/page';

vi.mock('@/features/auth/services/authService', () => ({
  deleteAccount: vi.fn(async () => ({ message: 'ok' })),
}));

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe('DeleteAccountPage', () => {
  it('shows the warning state', () => {
    render(<DeleteAccountPage />);

    expect(screen.getByText(/advertencia/i)).toBeInTheDocument();
    expect(screen.getByText(/irreversible/i)).toBeInTheDocument();
    expect(
      screen.getByText(/todos tus datos se eliminar(?:a|\u00e1)n permanentemente/i),
    ).toBeInTheDocument();
  });

  it('requires typing DELETE to enable the button', async () => {
    const user = userEvent.setup();
    render(<DeleteAccountPage />);

    const input = screen.getByPlaceholderText('DELETE');
    const passwordInput = screen.getByPlaceholderText(/contrase(?:n|\u00f1)a actual/i);
    const deleteButton = screen.getByRole('button', { name: /^eliminar$/i });

    expect(deleteButton).toBeDisabled();

    await user.type(input, 'DELETE');
    expect(deleteButton).toBeDisabled();
    await user.type(passwordInput, 'PasswordActual123');

    await waitFor(() => {
      expect(deleteButton).toBeEnabled();
    });
  });

  it('filters non-letter characters and uppercases the confirmation input', async () => {
    const user = userEvent.setup();
    render(<DeleteAccountPage />);

    const input = screen.getByPlaceholderText('DELETE') as HTMLInputElement;
    await user.type(input, 'delete123!');

    expect(input.value).toBe('DELETE');
  });

  it('limits the confirmation input to 8 characters', async () => {
    const user = userEvent.setup();
    render(<DeleteAccountPage />);

    const input = screen.getByPlaceholderText('DELETE') as HTMLInputElement;
    await user.type(input, 'deleteaccount');

    expect(input.value).toHaveLength(8);
    expect(input.value).toBe('DELETEAC');
  });

  it('includes a cancel link back to profile', () => {
    render(<DeleteAccountPage />);
    expect(screen.getByRole('link', { name: /cancelar/i })).toHaveAttribute('href', '/profile');
  });

  it('uses the shared auth card sizing classes', () => {
    const { container } = render(<DeleteAccountPage />);
    const card = container.querySelector('.rounded-\\[2rem\\]');

    expect(card).toHaveClass('mx-auto', 'w-full', 'max-w-md', 'gap-6', 'p-8');
  });

  it('shows the success state after deletion', async () => {
    const user = userEvent.setup();
    render(<DeleteAccountPage />);

    await user.type(screen.getByPlaceholderText('DELETE'), 'DELETE');
    await user.type(
      screen.getByPlaceholderText(/contrase(?:n|\u00f1)a actual/i),
      'PasswordActual123',
    );
    await user.click(screen.getByRole('button', { name: /^eliminar$/i }));

    await waitFor(() => {
      expect(screen.getByText(/cuenta eliminada/i)).toBeInTheDocument();
    });
  });

  it('applies the disabled styles when confirmation is invalid', async () => {
    const user = userEvent.setup();
    render(<DeleteAccountPage />);

    const deleteButton = screen.getByRole('button', { name: /^eliminar$/i });
    expect(deleteButton).toHaveClass('cursor-not-allowed');

    await user.type(screen.getByPlaceholderText('DELETE'), 'DELETE');
    expect(deleteButton).toHaveClass('cursor-not-allowed');
    await user.type(
      screen.getByPlaceholderText(/contrase(?:n|\u00f1)a actual/i),
      'PasswordActual123',
    );

    await waitFor(() => {
      expect(deleteButton).not.toHaveClass('cursor-not-allowed');
    });
  });

  it('redirects to login 2.5 seconds after deletion', async () => {
    vi.useFakeTimers();
    render(<DeleteAccountPage />);

    const input = screen.getByPlaceholderText('DELETE');
    const passwordInput = screen.getByPlaceholderText(/contrase(?:n|\u00f1)a actual/i);
    fireEvent.change(input, { target: { value: 'DELETE' } });
    fireEvent.change(passwordInput, { target: { value: 'PasswordActual123' } });
    fireEvent.click(screen.getByRole('button', { name: /^eliminar$/i }));

    await Promise.resolve();
    expect(pushMock).not.toHaveBeenCalled();

    vi.advanceTimersByTime(2500);
    expect(pushMock).toHaveBeenCalledWith('/login');

    vi.useRealTimers();
  });
});
