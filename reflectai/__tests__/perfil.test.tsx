import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PerfilPage from '@/app/perfil/page';

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

vi.mock('@/lib/api/profile', () => ({
  fetchProfile: fetchProfileMock,
  updateProfile: updateProfileMock,
  uploadProfileAvatar: uploadProfileAvatarMock,
}));

vi.mock('@/lib/api/auth', () => ({
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

describe('PerfilPage', () => {
  it('muestra el nombre del usuario y sus iniciales cuando no hay foto', async () => {
    render(<PerfilPage />);

    expect(await screen.findByRole('heading', { name: /arturo cuevas/i })).toBeInTheDocument();
    
    expect(screen.getByText('AC')).toBeInTheDocument();
  });

  it('valida el nombre, limpia el error al corregir y guarda los cambios', async () => {
    render(<PerfilPage />);

    await screen.findByRole('heading', { name: /arturo cuevas/i });

    fireEvent.click(screen.getByRole('button', { name: /editar/i }));

    const firstNameInput = screen.getByPlaceholderText('Nombre(s)');
    fireEvent.change(firstNameInput, { target: { value: 'Artur0' } });

    expect(await screen.findByText('El nombre solo puede contener letras')).toBeInTheDocument();

    fireEvent.change(firstNameInput, { target: { value: 'Arturo' } });

    await waitFor(() => {
      expect(screen.queryByText('El nombre solo puede contener letras')).not.toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Apellido(s)'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /arturo/i })).toBeInTheDocument();
    });
  });

  it('descarta los cambios al cancelar y vuelve al estado inicial', async () => {
    render(<PerfilPage />);

    await screen.findByRole('heading', { name: /arturo cuevas/i });

    fireEvent.click(screen.getByRole('button', { name: /editar/i }));

    fireEvent.change(screen.getByPlaceholderText('Nombre(s)'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByPlaceholderText('Apellido(s)'), { target: { value: 'López' } });
    fireEvent.change(screen.getByDisplayValue('2005-06-19'), { target: { value: '1999-01-01' } });

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(screen.getByRole('heading', { name: /arturo cuevas/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /editar/i }));

    expect(screen.getByPlaceholderText('Nombre(s)')).toHaveValue('Arturo');
    expect(screen.getByPlaceholderText('Apellido(s)')).toHaveValue('Cuevas');
    expect(screen.getByDisplayValue('2005-06-19')).toBeInTheDocument();
  });

  it('no permite guardar la fecha vacía', async () => {
    render(<PerfilPage />);

    await screen.findByRole('heading', { name: /arturo cuevas/i });

    fireEvent.click(screen.getByRole('button', { name: /editar/i }));

    fireEvent.change(screen.getByDisplayValue('2005-06-19'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

    expect(await screen.findByText('La fecha de nacimiento es obligatoria')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /arturo cuevas/i })).toBeInTheDocument();
  });

  it('alterna el estado de los switches de preferencias', async () => {
    render(<PerfilPage />);

    await screen.findByRole('heading', { name: /arturo cuevas/i });

    const notifSwitch = screen.getByRole('switch', { name: /notificaciones diarias/i });
    const darkSwitch = screen.getByRole('switch', { name: /modo oscuro/i });
    
    fireEvent.click(notifSwitch);
    expect(notifSwitch).toHaveClass('bg-slate-300/50'); // Apagado
    expect(notifSwitch).toHaveAttribute('aria-checked', 'false');
    
    fireEvent.click(darkSwitch);
    expect(darkSwitch).toHaveClass('bg-indigo-500'); // Encendido
    expect(darkSwitch).toHaveAttribute('aria-checked', 'true');
  });

  it('tiene enlaces correctos a cambiar contraseña, eliminar cuenta y cerrar sesión', async () => {
    render(<PerfilPage />);

    await screen.findByRole('heading', { name: /arturo cuevas/i });
    
    expect(screen.getByRole('link', { name: /cambiar contraseña/i })).toHaveAttribute('href', '/cambiar-contrasena');
    
    expect(screen.getByRole('link', { name: /eliminar cuenta permanentemente/i })).toHaveAttribute('href', '/eliminar-cuenta');
  });

  it('cierra sesión correctamente y redirige al login', async () => {
    const user = userEvent.setup();
    render(<PerfilPage />);

    await screen.findByRole('heading', { name: /arturo cuevas/i });
    
    const logoutBtn = screen.getByRole('button', { name: /cerrar sesión/i });
    await user.click(logoutBtn);

    expect(logoutUserMock).toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith('/login');
  });

  it('maneja la selección de foto de perfil simulando la subida al backend', async () => {
    const user = userEvent.setup();
    render(<PerfilPage />);

    await screen.findByRole('heading', { name: /arturo cuevas/i });
    
    const file = new File(['(⌐□_□)'], 'avatar.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    await user.upload(input, file);

    await waitFor(() => {
      expect(uploadProfileAvatarMock).toHaveBeenCalledWith(file);
    });
  });
});
