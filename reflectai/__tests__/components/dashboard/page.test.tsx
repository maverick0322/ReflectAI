import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DashboardPage from '@/app/(main)/dashboard/page';

// Mockeamos los componentes de iconos para evitar ruido en el DOM de prueba
vi.mock('@/components/icons/ProfileIcon', () => ({ ProfileIcon: () => <svg data-testid="profile-icon" /> }));
vi.mock('@/components/icons/ClockIcon', () => ({ ClockIcon: () => <svg data-testid="clock-icon" /> }));
vi.mock('@/components/icons/LightningIcon', () => ({ LightningIcon: () => <svg data-testid="lightning-icon" /> }));

describe('Dashboard Page Integration', () => {
  it('debe renderizar el saludo al usuario y la fecha actual', () => {
    render(<DashboardPage />);
    
    expect(screen.getByText(/Hola, Arturo/i)).toBeInTheDocument();
    expect(screen.getByText(/Jueves 16 de Abril/i)).toBeInTheDocument();
  });

  it('debe mostrar la alerta de sesión pausada condicional', () => {
    render(<DashboardPage />);
    // En nuestro mock actual, hasPausedSession es true
    expect(screen.getByText(/Tienes una reflexión pendiente/i)).toBeInTheDocument();
  });

  it('debe renderizar la cita del día con el autor correcto', () => {
    render(<DashboardPage />);
    
    expect(screen.getByText(/"La reflexión es el camino hacia la maestría de uno mismo."/i)).toBeInTheDocument();
    expect(screen.getByText(/— Marco Aurelio/i)).toBeInTheDocument();
  });

  it('debe renderizar la última sesión del historial', () => {
    render(<DashboardPage />);
    
    expect(screen.getByText(/Gestión del estrés en mi proyecto actual/i)).toBeInTheDocument();
    expect(screen.getByText(/Ansiedad/i)).toBeInTheDocument();
  });
});