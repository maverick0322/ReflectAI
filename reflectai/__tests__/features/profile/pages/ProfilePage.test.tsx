import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ProfilePage from '@/app/profile/page';

const {
  fetchProfileMock,
  updateProfileMock,
  uploadProfileAvatarMock,
  logoutUserMock,
  pushMock,
} = vi.hoisted(() => ({
  fetchProfileMock: vi.fn(async () => ({
    data: {
      id: 'user-1',
      first_name: 'Arturo',
      last_name: 'Cuevas',
      full_name: 'Arturo Cuevas',
      birth_date: '2005-06-19',
      avatar_url: null,
      email: 'arturo@reflectai.com',
    },
    message: 'ok',
  })),
  updateProfileMock: vi.fn(async () => ({
    data: {
      id: 'user-1',
      first_name: 'Arturo',
      last_name: '',
      full_name: 'Arturo',
      birth_date: '2005-06-19',
      avatar_url: null,
      email: 'arturo@reflectai.com',
    },
    message: 'ok',
  })),
  uploadProfileAvatarMock: vi.fn(async () => ({
    data: {
      id: 'user-1',
      first_name: 'Arturo',
      last_name: 'Cuevas',
      full_name: 'Arturo Cuevas',
      birth_date: '2005-06-19',
      avatar_url: 'https://example.com/avatar.png',
      email: 'arturo@reflectai.com',
    },
    message: 'ok',
  })),
  logoutUserMock: vi.fn(async () => ({ message: 'ok' })),
  pushMock: vi.fn(),
}));

vi.mock('@/features/profile/services/profileService', () => ({
  fetchProfile: fetchProfileMock,
  updateProfile: updateProfileMock,
  uploadProfileAvatar: uploadProfileAvatarMock,
}));

vi.mock('@/features/auth/services/authService', () => ({
  logoutUser: logoutUserMock,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ProfilePage', () => {
  it('shows the user name and initials when there is no avatar', async () => {
    render(<ProfilePage />);

    expect(await screen.findByRole('heading', { name: /arturo cuevas/i })).toBeInTheDocument();
    expect(screen.getByText('AC')).toBeInTheDocument();
  });

  it('validates the first name, clears the error, and saves the changes', async () => {
    render(<ProfilePage />);
    await screen.findByRole('heading', { name: /arturo cuevas/i });

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    const firstNameInput = screen.getByPlaceholderText('First name');
    fireEvent.change(firstNameInput, { target: { value: 'Artur0' } });

    expect(await screen.findByText('First name can only contain letters')).toBeInTheDocument();

    fireEvent.change(firstNameInput, { target: { value: 'Arturo' } });

    await waitFor(() => {
      expect(screen.queryByText('First name can only contain letters')).not.toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Last name'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /arturo/i })).toBeInTheDocument();
    });
  });

  it('cancels changes and returns to the initial state', async () => {
    render(<ProfilePage />);
    await screen.findByRole('heading', { name: /arturo cuevas/i });

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    fireEvent.change(screen.getByPlaceholderText('First name'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByPlaceholderText('Last name'), { target: { value: 'Lopez' } });
    fireEvent.change(screen.getByDisplayValue('2005-06-19'), { target: { value: '1999-01-01' } });
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(screen.getByRole('heading', { name: /arturo cuevas/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(screen.getByPlaceholderText('First name')).toHaveValue('Arturo');
    expect(screen.getByPlaceholderText('Last name')).toHaveValue('Cuevas');
    expect(screen.getByDisplayValue('2005-06-19')).toBeInTheDocument();
  });

  it('does not allow saving an empty birth date', async () => {
    render(<ProfilePage />);
    await screen.findByRole('heading', { name: /arturo cuevas/i });

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    fireEvent.change(screen.getByDisplayValue('2005-06-19'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText('Birth date is required')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /arturo cuevas/i })).toBeInTheDocument();
  });

  it('toggles the preference switches', async () => {
    render(<ProfilePage />);
    await screen.findByRole('heading', { name: /arturo cuevas/i });

    const notificationSwitch = screen.getByRole('switch', { name: /daily notifications/i });
    const darkModeSwitch = screen.getByRole('switch', { name: /dark mode/i });

    fireEvent.click(notificationSwitch);
    expect(notificationSwitch).toHaveClass('bg-slate-300/50');
    expect(notificationSwitch).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(darkModeSwitch);
    expect(darkModeSwitch).toHaveClass('bg-indigo-500');
    expect(darkModeSwitch).toHaveAttribute('aria-checked', 'true');
  });

  it('shows account links for password change and delete account', async () => {
    render(<ProfilePage />);
    await screen.findByRole('heading', { name: /arturo cuevas/i });

    expect(screen.getByRole('link', { name: /change password/i })).toHaveAttribute(
      'href',
      '/change-password',
    );
    expect(screen.getByRole('link', { name: /delete account permanently/i })).toHaveAttribute(
      'href',
      '/delete-account',
    );
  });

  it('signs out and redirects to login', async () => {
    const user = userEvent.setup();
    render(<ProfilePage />);
    await screen.findByRole('heading', { name: /arturo cuevas/i });

    await user.click(screen.getByRole('button', { name: /sign out/i }));

    expect(logoutUserMock).toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith('/login');
  });

  it('redirects to login even if sign out fails', async () => {
    const user = userEvent.setup();
    logoutUserMock.mockRejectedValueOnce(new Error('network'));
    render(<ProfilePage />);
    await screen.findByRole('heading', { name: /arturo cuevas/i });

    await user.click(screen.getByRole('button', { name: /sign out/i }));

    expect(pushMock).toHaveBeenCalledWith('/login');
  });

  it('uploads a profile photo through the backend handler', async () => {
    const user = userEvent.setup();
    render(<ProfilePage />);
    await screen.findByRole('heading', { name: /arturo cuevas/i });

    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(uploadProfileAvatarMock).toHaveBeenCalledWith(file);
    });
  });

  it('shows an error when avatar upload fails', async () => {
    const user = userEvent.setup();
    uploadProfileAvatarMock.mockRejectedValueOnce(new Error('upload failed'));
    render(<ProfilePage />);
    await screen.findByRole('heading', { name: /arturo cuevas/i });

    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(input, file);

    expect(await screen.findByText(/unable to upload the profile photo/i)).toBeInTheDocument();
  });

  it('shows an error state when the profile cannot be loaded', async () => {
    fetchProfileMock.mockRejectedValueOnce(new Error('db down'));
    render(<ProfilePage />);

    expect(await screen.findByText(/unable to load the profile/i)).toBeInTheDocument();
  });

  it('shows the backend error when saving the profile fails', async () => {
    updateProfileMock.mockRejectedValueOnce(new Error('save failed'));
    render(<ProfilePage />);
    await screen.findByRole('heading', { name: /arturo cuevas/i });

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    fireEvent.change(screen.getByPlaceholderText('First name'), {
      target: { value: 'Arturo' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/unable to update the profile/i);
  });
});
