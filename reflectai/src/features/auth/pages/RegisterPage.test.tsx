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

    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in here/i })).toHaveAttribute(
      'href',
      '/login',
    );
  });

  it('validates required fields when submitting an empty form', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
    });
  });

  it('redirects to login when registration succeeds', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText(/first name/i), 'Ana');
    await user.type(screen.getByPlaceholderText(/^email address$/i), 'ana@example.com');
    await user.type(screen.getByPlaceholderText(/^confirm email address$/i), 'ana@example.com');
    await user.type(screen.getByPlaceholderText(/^password$/i), 'ValidPassword123');
    await user.type(screen.getByPlaceholderText(/^confirm password$/i), 'ValidPassword123');
    await user.type(screen.getByPlaceholderText(/birth date/i), '1998-05-10');

    await user.click(screen.getByRole('button', { name: /register/i }));

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

    await user.type(screen.getByPlaceholderText(/first name/i), 'Ana');
    await user.type(screen.getByPlaceholderText(/^email address$/i), 'ana@example.com');
    await user.type(screen.getByPlaceholderText(/^confirm email address$/i), 'ana@example.com');
    await user.type(screen.getByPlaceholderText(/^password$/i), 'ValidPassword123');
    await user.type(screen.getByPlaceholderText(/^confirm password$/i), 'ValidPassword123');
    await user.type(screen.getByPlaceholderText(/birth date/i), '1998-05-10');

    await user.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('That email is already registered');
    });
  });
});
