import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ChangePasswordPage from '@/app/change-password/page';
import { ApiError } from '@/core/api/http';

const {
  changePasswordMock,
  confirmRecoveryMock,
  pushMock,
  useSearchParamsMock,
} = vi.hoisted(() => ({
  changePasswordMock: vi.fn(async (...args: unknown[]) => {
    void args;
    return { message: 'ok' };
  }),
  confirmRecoveryMock: vi.fn(async (...args: unknown[]) => {
    void args;
    return { message: 'ok' };
  }),
  pushMock: vi.fn(),
  useSearchParamsMock: vi.fn(() => new URLSearchParams()),
}));

vi.mock('@/features/auth/services/authService', () => ({
  changePassword: (payload: {
    currentPassword?: string;
    newPassword: string;
    confirmNewPassword: string;
  }) => changePasswordMock(payload),
  confirmRecovery: (code: string) => confirmRecoveryMock(code),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
  useSearchParams: () => useSearchParamsMock(),
}));

describe('ChangePasswordPage step 1', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
  });

  it('shows an error when step 1 is submitted empty', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordPage />);

    await user.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/current password is required/i)).toBeInTheDocument();
    });
  });

  it('shows step 1 of 2 in the header', () => {
    render(<ChangePasswordPage />);
    expect(screen.getByText(/step 1 of 2/i)).toBeInTheDocument();
  });

  it('includes a recovery link', () => {
    render(<ChangePasswordPage />);
    expect(screen.getByRole('link', { name: /forgot your password/i })).toHaveAttribute(
      'href',
      '/recover',
    );
  });

  it('includes a cancel link back to profile', () => {
    render(<ChangePasswordPage />);
    expect(screen.getByRole('link', { name: /cancel/i })).toHaveAttribute('href', '/profile');
  });
});

describe('ChangePasswordPage step 2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
    changePasswordMock.mockResolvedValue({ message: 'ok' });
    confirmRecoveryMock.mockResolvedValue({ message: 'ok' });
  });

  async function moveToStep2() {
    const user = userEvent.setup();
    render(<ChangePasswordPage />);

    await user.type(screen.getByPlaceholderText(/current password/i), 'CurrentPassword123');
    await user.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/step 2 of 2/i)).toBeInTheDocument();
    });

    return user;
  }

  it('validates the new password in real time and clears the error when valid', async () => {
    const user = await moveToStep2();
    const newPasswordInput = screen.getByPlaceholderText(/^new password$/i);

    await user.type(newPasswordInput, 'validpassword123');

    await waitFor(() => {
      expect(
        screen.getByText(/password must include uppercase, lowercase, and numeric characters/i),
      ).toBeInTheDocument();
    });

    await user.clear(newPasswordInput);
    await user.type(newPasswordInput, 'ValidPassword123');

    await waitFor(() => {
      expect(
        screen.queryByText(/password must include uppercase, lowercase, and numeric characters/i),
      ).not.toBeInTheDocument();
    });
  });

  it('allows returning from step 2 to step 1', async () => {
    const user = await moveToStep2();

    await user.click(screen.getByRole('button', { name: /back/i }));

    await waitFor(() => {
      expect(screen.getByText(/step 1 of 2/i)).toBeInTheDocument();
    });
  });

  it('validates that the new passwords match', async () => {
    const user = await moveToStep2();

    await user.type(screen.getByPlaceholderText(/^new password$/i), 'ValidPassword123');
    await user.type(
      screen.getByPlaceholderText(/^confirm new password$/i),
      'DifferentPassword123',
    );

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });

    await user.clear(screen.getByPlaceholderText(/^confirm new password$/i));
    await user.type(
      screen.getByPlaceholderText(/^confirm new password$/i),
      'ValidPassword123',
    );

    await waitFor(() => {
      expect(screen.queryByText(/passwords do not match/i)).not.toBeInTheDocument();
    });
  });

  it('opens directly in recovery mode when mode=recovery is present', async () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams('mode=recovery'));

    render(<ChangePasswordPage />);

    expect(await screen.findByText(/reset password/i)).toBeInTheDocument();
    expect(screen.queryByText(/step 1 of 2/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument();
  });

  it('validates the recovery link before showing the new password form', async () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams('code=recovery-code'));

    render(<ChangePasswordPage />);

    expect(screen.getAllByText(/validating link/i).length).toBeGreaterThan(0);

    await waitFor(() => {
      expect(confirmRecoveryMock).toHaveBeenCalledWith('recovery-code');
      expect(screen.getByText(/reset password/i)).toBeInTheDocument();
    });
  });

  it('shows the recovery confirmation error when the link is invalid', async () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams('code=bad-code'));
    confirmRecoveryMock.mockRejectedValueOnce(
      new ApiError('bad link', 400, { message: 'Recovery link expired' }),
    );

    render(<ChangePasswordPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Recovery link expired');
  });

  it('submits the recovery flow without a current password', async () => {
    const user = userEvent.setup();
    useSearchParamsMock.mockReturnValue(new URLSearchParams('mode=recovery'));

    render(<ChangePasswordPage />);

    await screen.findByText(/reset password/i);
    await user.type(screen.getByPlaceholderText(/^new password$/i), 'ValidPassword123');
    await user.type(
      screen.getByPlaceholderText(/^confirm new password$/i),
      'ValidPassword123',
    );
    await user.click(screen.getByRole('button', { name: /update password/i }));

    await waitFor(() => {
      expect(changePasswordMock).toHaveBeenCalledWith({
        currentPassword: undefined,
        newPassword: 'ValidPassword123',
        confirmNewPassword: 'ValidPassword123',
      });
      expect(pushMock).toHaveBeenCalledWith('/login');
    });
  });
});
