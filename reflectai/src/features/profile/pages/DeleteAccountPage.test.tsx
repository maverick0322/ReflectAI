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

    expect(screen.getByText(/warning/i)).toBeInTheDocument();
    expect(screen.getByText(/irreversible/i)).toBeInTheDocument();
    expect(screen.getByText(/all of your data will be removed permanently/i)).toBeInTheDocument();
  });

  it('requires typing DELETE to enable the button', async () => {
    const user = userEvent.setup();
    render(<DeleteAccountPage />);

    const input = screen.getByPlaceholderText('DELETE');
    const deleteButton = screen.getByRole('button', { name: /^delete$/i });

    expect(deleteButton).toBeDisabled();

    await user.type(input, 'DELETE');

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
    expect(screen.getByRole('link', { name: /cancel/i })).toHaveAttribute('href', '/profile');
  });

  it('shows the success state after deletion', async () => {
    const user = userEvent.setup();
    render(<DeleteAccountPage />);

    await user.type(screen.getByPlaceholderText('DELETE'), 'DELETE');
    await user.click(screen.getByRole('button', { name: /^delete$/i }));

    await waitFor(() => {
      expect(screen.getByText(/account deleted/i)).toBeInTheDocument();
    });
  });

  it('applies the disabled styles when confirmation is invalid', async () => {
    const user = userEvent.setup();
    render(<DeleteAccountPage />);

    const deleteButton = screen.getByRole('button', { name: /^delete$/i });
    expect(deleteButton).toHaveClass('cursor-not-allowed');

    await user.type(screen.getByPlaceholderText('DELETE'), 'DELETE');

    await waitFor(() => {
      expect(deleteButton).not.toHaveClass('cursor-not-allowed');
    });
  });

  it('redirects to login 2.5 seconds after deletion', async () => {
    vi.useFakeTimers();
    render(<DeleteAccountPage />);

    const input = screen.getByPlaceholderText('DELETE');
    fireEvent.change(input, { target: { value: 'DELETE' } });
    fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));

    await Promise.resolve();
    expect(pushMock).not.toHaveBeenCalled();

    vi.advanceTimersByTime(2500);
    expect(pushMock).toHaveBeenCalledWith('/login');

    vi.useRealTimers();
  });
});
