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
  verifyCurrentPasswordMock,
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
  verifyCurrentPasswordMock: vi.fn(async (...args: unknown[]) => {
    void args;
    return { message: 'ok' };
  }),
}));

vi.mock('@/features/auth/services/authService', () => ({
  changePassword: (payload: {
    currentPassword?: string;
    newPassword: string;
    confirmNewPassword: string;
  }) => changePasswordMock(payload),
  confirmRecovery: (code: string) => confirmRecoveryMock(code),
  verifyCurrentPassword: (currentPassword: string) =>
    verifyCurrentPasswordMock(currentPassword),
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
    verifyCurrentPasswordMock.mockResolvedValue({ message: 'ok' });
  });

  it('shows an error when step 1 is submitted empty', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordPage />);

    await user.click(screen.getByRole('button', { name: /continuar/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/la contrase(?:n|\u00f1)a actual es obligatoria/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/revisa los campos marcados/i)).toBeInTheDocument();
    });
  });

  it('clears the step 1 validation message when the password becomes valid', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordPage />);

    await user.click(screen.getByRole('button', { name: /continuar/i }));
    expect(
      screen.getByText(/la contrase(?:n|\u00f1)a actual es obligatoria/i),
    ).toBeInTheDocument();

    await user.type(
      screen.getByPlaceholderText(/contrase(?:n|\u00f1)a actual/i),
      'CurrentPassword123',
    );

    await waitFor(() => {
      expect(
        screen.queryByText(/la contrase(?:n|\u00f1)a actual es obligatoria/i),
      ).not.toBeInTheDocument();
    });
  });

  it('shows step 1 of 2 in the header', () => {
    render(<ChangePasswordPage />);
    expect(screen.getByText(/paso 1 de 2/i)).toBeInTheDocument();
  });

  it('includes a recovery link', () => {
    render(<ChangePasswordPage />);
    expect(
      screen.getByRole('link', { name: /olvidaste tu contrase(?:n|\u00f1)a/i }),
    ).toHaveAttribute('href', '/recover');
  });

  it('includes a cancel link back to profile', () => {
    render(<ChangePasswordPage />);
    expect(screen.getByRole('link', { name: /cancelar/i })).toHaveAttribute('href', '/profile');
  });

  it('shows the backend error when the current password is invalid', async () => {
    const user = userEvent.setup();
    verifyCurrentPasswordMock.mockRejectedValueOnce(
      new ApiError('invalid password', 400, {
        message: 'Current password is incorrect',
      }),
    );

    render(<ChangePasswordPage />);

    await user.type(
      screen.getByPlaceholderText(/contrase(?:n|\u00f1)a actual/i),
      'WrongPassword123',
    );
    await user.click(screen.getByRole('button', { name: /continuar/i }));

    await waitFor(() => {
      expect(verifyCurrentPasswordMock).toHaveBeenCalledWith('WrongPassword123');
      expect(screen.getByRole('alert')).toHaveTextContent('Current password is incorrect');
      expect(screen.getByText(/paso 1 de 2/i)).toBeInTheDocument();
    });
  });

  it('uses the shared auth card sizing classes', () => {
    const { container } = render(<ChangePasswordPage />);
    const card = container.querySelector('.rounded-\\[2rem\\]');

    expect(card).toHaveClass('mx-auto', 'w-full', 'max-w-md', 'gap-6', 'p-8');
  });
});

describe('ChangePasswordPage step 2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
    changePasswordMock.mockResolvedValue({ message: 'ok' });
    confirmRecoveryMock.mockResolvedValue({ message: 'ok' });
    verifyCurrentPasswordMock.mockResolvedValue({ message: 'ok' });
  });

  async function moveToStep2() {
    const user = userEvent.setup();
    render(<ChangePasswordPage />);

    await user.type(
      screen.getByPlaceholderText(/contrase(?:n|\u00f1)a actual/i),
      'CurrentPassword123',
    );
    await user.click(screen.getByRole('button', { name: /continuar/i }));

    await waitFor(() => {
      expect(verifyCurrentPasswordMock).toHaveBeenCalledWith('CurrentPassword123');
      expect(screen.getByText(/paso 2 de 2/i)).toBeInTheDocument();
    });

    return user;
  }

  it('validates the new password in real time and clears the error when valid', async () => {
    const user = await moveToStep2();
    const newPasswordInput = screen.getByPlaceholderText(
      /^nueva contrase(?:n|\u00f1)a$/i,
    );

    await user.type(newPasswordInput, 'validpassword123');

    await waitFor(() => {
      expect(
        screen.getByText(
          /la contrase(?:n|\u00f1)a debe incluir may(?:u|\u00fa)sculas, min(?:u|\u00fa)sculas y n(?:u|\u00fa)meros/i,
        ),
      ).toBeInTheDocument();
    });

    await user.clear(newPasswordInput);
    await user.type(newPasswordInput, 'ValidPassword123');

    await waitFor(() => {
      expect(
        screen.queryByText(
          /la contrase(?:n|\u00f1)a debe incluir may(?:u|\u00fa)sculas, min(?:u|\u00fa)sculas y n(?:u|\u00fa)meros/i,
        ),
      ).not.toBeInTheDocument();
    });
  });

  it('allows returning from step 2 to step 1', async () => {
    const user = await moveToStep2();

    await user.click(screen.getByRole('button', { name: /atr(?:a|\u00e1)s/i }));

    await waitFor(() => {
      expect(screen.getByText(/paso 1 de 2/i)).toBeInTheDocument();
    });
  });

  it('validates that the new passwords match', async () => {
    const user = await moveToStep2();

    await user.type(screen.getByPlaceholderText(/^nueva contrase(?:n|\u00f1)a$/i), 'ValidPassword123');
    await user.type(
      screen.getByPlaceholderText(/^confirma tu nueva contrase(?:n|\u00f1)a$/i),
      'DifferentPassword123',
    );

    await waitFor(() => {
      expect(screen.getByText(/las contrase(?:n|\u00f1)as no coinciden/i)).toBeInTheDocument();
    });

    await user.clear(
      screen.getByPlaceholderText(/^confirma tu nueva contrase(?:n|\u00f1)a$/i),
    );
    await user.type(
      screen.getByPlaceholderText(/^confirma tu nueva contrase(?:n|\u00f1)a$/i),
      'ValidPassword123',
    );

    await waitFor(() => {
      expect(
        screen.queryByText(/las contrase(?:n|\u00f1)as no coinciden/i),
      ).not.toBeInTheDocument();
    });
  });

  it('shows validation messages when step 2 is submitted empty', async () => {
    const user = await moveToStep2();

    await user.click(
      screen.getByRole('button', { name: /actualizar contrase(?:n|\u00f1)a/i }),
    );

    await waitFor(() => {
      expect(screen.getByText(/la contrase(?:n|\u00f1)a es obligatoria/i)).toBeInTheDocument();
      expect(
        screen.getAllByText(/confirma tu nueva contrase(?:n|\u00f1)a/i).length,
      ).toBeGreaterThan(0);
      expect(screen.getByText(/revisa los campos marcados/i)).toBeInTheDocument();
    });
  });

  it('clears the step 2 validation messages as fields are corrected', async () => {
    const user = await moveToStep2();

    await user.click(
      screen.getByRole('button', { name: /actualizar contrase(?:n|\u00f1)a/i }),
    );
    expect(screen.getByText(/la contrase(?:n|\u00f1)a es obligatoria/i)).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText(/^nueva contrase(?:n|\u00f1)a$/i), 'ValidPassword123');

    await waitFor(() => {
      expect(
        screen.queryByText(/la contrase(?:n|\u00f1)a es obligatoria/i),
      ).not.toBeInTheDocument();
    });

    expect(screen.getAllByText(/confirma tu nueva contrase(?:n|\u00f1)a/i).length).toBeGreaterThan(0);
    await user.type(
      screen.getByPlaceholderText(/^confirma tu nueva contrase(?:n|\u00f1)a$/i),
      'ValidPassword123',
    );

    await waitFor(() => {
      expect(
        screen.queryByText(/^Confirma tu nueva contrase(?:n|\u00f1)a$/i),
      ).not.toBeInTheDocument();
    });
  });

  it('opens directly in recovery mode when mode=recovery is present', async () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams('mode=recovery'));

    render(<ChangePasswordPage />);

    expect(await screen.findByText(/restablecer contrase(?:n|\u00f1)a/i)).toBeInTheDocument();
    expect(screen.queryByText(/paso 1 de 2/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /atr(?:a|\u00e1)s/i })).not.toBeInTheDocument();
  });

  it('validates the recovery link before showing the new password form', async () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams('code=recovery-code'));

    render(<ChangePasswordPage />);

    expect(screen.getAllByText(/validando enlace/i).length).toBeGreaterThan(0);

    await waitFor(() => {
      expect(confirmRecoveryMock).toHaveBeenCalledWith('recovery-code');
      expect(screen.getByText(/restablecer contrase(?:n|\u00f1)a/i)).toBeInTheDocument();
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

    await screen.findByText(/restablecer contrase(?:n|\u00f1)a/i);
    await user.type(screen.getByPlaceholderText(/^nueva contrase(?:n|\u00f1)a$/i), 'ValidPassword123');
    await user.type(
      screen.getByPlaceholderText(/^confirma tu nueva contrase(?:n|\u00f1)a$/i),
      'ValidPassword123',
    );
    await user.click(
      screen.getByRole('button', { name: /actualizar contrase(?:n|\u00f1)a/i }),
    );

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
