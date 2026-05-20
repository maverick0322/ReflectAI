import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import LoginPage from '@/app/login/page';
import { ApiError } from '@/core/api/http';

const { loginUserMock, pushMock } = vi.hoisted(() => ({
  loginUserMock: vi.fn(async (...args: unknown[]) => {
    void args;
    return { message: 'ok' };
  }),
  pushMock: vi.fn(),
}));

vi.mock('@/features/auth/services/authService', () => ({
  loginUser: (email: string, password: string) => loginUserMock(email, password),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loginUserMock.mockResolvedValue({ message: 'ok' });
  });

  it('renders the login form structure', () => {
    render(<LoginPage />);

    expect(screen.getByRole('heading', { name: /reflectai/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /forgot your password/i })).toHaveAttribute(
      'href',
      '/recover',
    );
  });

  it('validates required fields when submitting an empty form', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('redirects to the dashboard when login succeeds', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText(/^email address$/i), 'ana@example.com');
    await user.type(screen.getByPlaceholderText(/^password$/i), 'ValidPassword123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(loginUserMock).toHaveBeenCalledWith('ana@example.com', 'ValidPassword123');
      expect(pushMock).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows the backend error when login fails', async () => {
    const user = userEvent.setup();
    loginUserMock.mockRejectedValueOnce(
      new ApiError('login failed', 401, { message: 'Invalid credentials' }),
    );

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText(/^email address$/i), 'ana@example.com');
    await user.type(screen.getByPlaceholderText(/^password$/i), 'ValidPassword123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials');
  });
});
