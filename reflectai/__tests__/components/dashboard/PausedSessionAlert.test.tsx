import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PausedSessionAlert } from '@/components/dashboard/PausedSessionAlert';

describe('PausedSessionAlert', () => {
  it('debe mostrar el tiempo transcurrido pasado por props', () => {
    const testTime = "3 horas y media";
    render(<PausedSessionAlert timeAgo={testTime} />);
    
    expect(screen.getByText('Tienes una reflexión pendiente')).toBeInTheDocument();
    expect(screen.getByText(`Guardado hace ${testTime}`)).toBeInTheDocument();
  });

  it('debe renderizar el botón de continuar', () => {
    render(<PausedSessionAlert timeAgo="1 hora" />);
    
    const button = screen.getByRole('button', { name: /continuar sesión/i });
    expect(button).toBeInTheDocument();
  });

  it('debe ocultarse completamente al hacer clic en el botón de cerrar', () => {
    render(<PausedSessionAlert timeAgo="1 hora" />);
    
    expect(screen.getByText('Tienes una reflexión pendiente')).toBeInTheDocument();
    
    const closeButton = screen.getByRole('button', { name: /cerrar alerta/i });
    
    fireEvent.click(closeButton);
    
    expect(screen.queryByText('Tienes una reflexión pendiente')).not.toBeInTheDocument();
  });
});