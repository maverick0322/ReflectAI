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

    fireEvent.click(screen.getByRole('button', { name: /editar/i }));

    const firstNameInput = screen.getByPlaceholderText('Nombre');
    fireEvent.change(firstNameInput, { target: { value: 'Artur0' } });

    expect(await screen.findByText('El nombre solo puede contener letras')).toBeInTheDocument();

    fireEvent.change(firstNameInput, { target: { value: 'Arturo' } });

    await waitFor(() => {
      expect(screen.queryByText('El nombre solo puede contener letras')).not.toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Apellidos'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /arturo/i })).toBeInTheDocument();
    });
  });

  it('cancels changes and returns to the initial state', async () => {
    render(<ProfilePage />);
    await screen.findByRole('heading', { name: /arturo cuevas/i });

    fireEvent.click(screen.getByRole('button', { name: /editar/i }));
    fireEvent.change(screen.getByPlaceholderText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByPlaceholderText('Apellidos'), { target: { value: 'Lopez' } });
    fireEvent.change(screen.getByDisplayValue('19/06/2005'), { target: { value: '01/01/1999' } });
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(screen.getByRole('heading', { name: /arturo cuevas/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /editar/i }));
    expect(screen.getByPlaceholderText('Nombre')).toHaveValue('Arturo');
    expect(screen.getByPlaceholderText('Apellidos')).toHaveValue('Cuevas');
    expect(screen.getByDisplayValue('19/06/2005')).toBeInTheDocument();
  });

  it('does not allow saving an empty birth date', async () => {
    render(<ProfilePage />);
    await screen.findByRole('heading', { name: /arturo cuevas/i });

    fireEvent.click(screen.getByRole('button', { name: /editar/i }));
    fireEvent.change(screen.getByDisplayValue('19/06/2005'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

    expect(await screen.findByText('La fecha de nacimiento es obligatoria')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /arturo cuevas/i })).toBeInTheDocument();
  });

  it('toggles the preference switches', async () => {
    render(<ProfilePage />);
    await screen.findByRole('heading', { name: /arturo cuevas/i });

    const notificationSwitch = screen.getByRole('switch', { name: /notificaciones diarias/i });
    const darkModeSwitch = screen.getByRole('switch', { name: /modo oscuro/i });

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

    expect(screen.getByRole('link', { name: /cambiar contraseÑa/i })).toHaveAttribute(
      'href',
      '/change-password',
    );
    expect(screen.getByRole('link', { name: /eliminar cuenta permanentemente/i })).toHaveAttribute(
      'href',
      '/delete-account',
    );
  });

  it('signs out and redirects to login', async () => {
    const user = userEvent.setup();
    render(<ProfilePage />);
    await screen.findByRole('heading', { name: /arturo cuevas/i });

    await user.click(screen.getByRole('button', { name: /cerrar sesiÓn/i }));

    expect(logoutUserMock).toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith('/login');
  });

  it('redirects to login even if sign out fails', async () => {
    const user = userEvent.setup();
    logoutUserMock.mockRejectedValueOnce(new Error('network'));
    render(<ProfilePage />);
    await screen.findByRole('heading', { name: /arturo cuevas/i });

    await user.click(screen.getByRole('button', { name: /cerrar sesiÓn/i }));

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

    expect(await screen.findByText(/no se pudo subir la foto de perfil/i)).toBeInTheDocument();
  });

  it('shows an error state when the profile cannot be loaded', async () => {
    fetchProfileMock.mockRejectedValueOnce(new Error('db down'));
    render(<ProfilePage />);

    expect(await screen.findByText(/no se pudo cargar el perfil/i)).toBeInTheDocument();
  });

  it('shows the backend error when saving the profile fails', async () => {
    updateProfileMock.mockRejectedValueOnce(new Error('save failed'));
    render(<ProfilePage />);
    await screen.findByRole('heading', { name: /arturo cuevas/i });

    fireEvent.click(screen.getByRole('button', { name: /editar/i }));
    fireEvent.change(screen.getByPlaceholderText('Nombre'), {
      target: { value: 'Arturo' },
    });
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/no se pudo actualizar el perfil/i);
  });
});
