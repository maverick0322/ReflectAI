import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DashboardPage from '@/app/(main)/dashboard/page';

vi.mock('@/components/icons/ProfileIcon', () => ({ ProfileIcon: () => <svg data-testid="profile-icon" /> }));
vi.mock('@/components/icons/ClockIcon', () => ({ ClockIcon: () => <svg data-testid="clock-icon" /> }));
vi.mock('@/components/icons/LightningIcon', () => ({ LightningIcon: () => <svg data-testid="lightning-icon" /> }));

describe('Dashboard Page Integration (Estado con Datos)', () => {
  it('debe renderizar el saludo al usuario (solo nombre) y la fecha actual', () => {
    render(<DashboardPage />);
    expect(screen.getByText("Arturo")).toBeInTheDocument();
    expect(screen.getByText(/Jueves 16 de Abril/i)).toBeInTheDocument();
  });

  it('debe mostrar la alerta de sesión pausada condicional', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Tienes una reflexión pendiente/i)).toBeInTheDocument();
  });

  it('debe mostrar la racha y su mensaje dinámico para un usuario activo', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Racha de 5 días')).toBeInTheDocument();
    expect(screen.getByText('¡Excelente! Estás construyendo un hábito sólido.')).toBeInTheDocument();
  });

  it('debe renderizar la tarjeta de la última sesión cuando el backend manda datos', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Gestión del estrés en mi proyecto actual/i)).toBeInTheDocument();
    expect(screen.getByText(/Ansiedad/i)).toBeInTheDocument();
    
    expect(screen.queryByText(/Aún no has registrado ninguna reflexión/i)).not.toBeInTheDocument();
  });
});