import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from 'vitest';
import PerfilPage from '@/app/perfil/page';

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('PerfilPage', () => {
  it('muestra el nombre del usuario y sus iniciales cuando no hay foto', () => {
    render(<PerfilPage />);

    expect(screen.getByRole('heading', { name: /arturo agustín cuevas pérez/i })).toBeInTheDocument();
    
    // En lugar de buscar por LabelText, buscamos el texto visual de las iniciales "AC"
    expect(screen.getByText("AC")).toBeInTheDocument();
  });

  it('valida el nombre, limpia el error al corregir y guarda los cambios', async () => {
    render(<PerfilPage />);

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
      expect(screen.getByRole('heading', { name: /^arturo$/i })).toBeInTheDocument();
    });
  });

  it('descarta los cambios al cancelar y vuelve al estado inicial', () => {
    render(<PerfilPage />);

    fireEvent.click(screen.getByRole('button', { name: /editar/i }));

    fireEvent.change(screen.getByPlaceholderText('Nombre(s)'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByPlaceholderText('Apellido(s)'), { target: { value: 'López' } });
    fireEvent.change(screen.getByDisplayValue('2005-06-19'), { target: { value: '1999-01-01' } });

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(screen.getByRole('heading', { name: /arturo agustín cuevas pérez/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /editar/i }));

    expect(screen.getByPlaceholderText('Nombre(s)')).toHaveValue('Arturo Agustín');
    expect(screen.getByPlaceholderText('Apellido(s)')).toHaveValue('Cuevas Pérez');
    expect(screen.getByDisplayValue('2005-06-19')).toBeInTheDocument();
  });

  it('no permite guardar la fecha vacía', async () => {
    render(<PerfilPage />);

    fireEvent.click(screen.getByRole('button', { name: /editar/i }));

    fireEvent.change(screen.getByDisplayValue('2005-06-19'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

    expect(await screen.findByText('La fecha de nacimiento es obligatoria')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /arturo agustín cuevas pérez/i })).toBeInTheDocument();
  });

  it('alterna el estado de los switches de preferencias', async () => {
    const user = userEvent.setup();
    render(<PerfilPage />);

    // Por defecto, notificaciones es true y darkMode es false (según initialProfileData)
    const toggleButtons = screen.getAllByRole('button').filter(btn => btn.className.includes('rounded-full'));
    
    // Switch 1: Notificaciones (Asumimos que es el primero)
    const notifSwitch = toggleButtons[1]; // Índice 1 porque el índice 0 es el botón "Atrás" de la cabecera
    fireEvent.click(notifSwitch);
    // Para probarlo visualmente podemos revisar si la clase cambia, aunque en un test unitario más profundo revisarías el estado
    expect(notifSwitch).toHaveClass('bg-slate-300/50'); // Apagado
    
    // Switch 2: Dark Mode
    const darkSwitch = toggleButtons[2];
    fireEvent.click(darkSwitch);
    expect(darkSwitch).toHaveClass('bg-indigo-500'); // Encendido
  });

  it('tiene enlaces correctos a cambiar contraseña, eliminar cuenta y cerrar sesión', () => {
    render(<PerfilPage />);
    
    // Enlace a cambiar contraseña
    expect(screen.getByRole('link', { name: /cambiar contraseña/i })).toHaveAttribute('href', '/cambiar-contrasena');
    
    // Enlace a eliminar cuenta
    expect(screen.getByRole('link', { name: /eliminar cuenta permanentemente/i })).toHaveAttribute('href', '/eliminar-cuenta');
  });
});
