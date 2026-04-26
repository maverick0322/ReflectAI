import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StreakWidget } from '@/components/dashboard/StreakWidget';

describe('StreakWidget', () => {
  it('debe renderizar los días de racha en plural correctamente', () => {
    render(<StreakWidget days={5} streakMessage="Mensaje de prueba" />);
    
    expect(screen.getByText('Racha de 5 días')).toBeInTheDocument();
    expect(screen.getByText('Mensaje de prueba')).toBeInTheDocument();
  });

  it('debe renderizar el texto en singular cuando la racha es de 1 día', () => {
    render(<StreakWidget days={1} streakMessage="Inicio de hábito" />);
    
    expect(screen.getByText('Racha de 1 día')).toBeInTheDocument();
  });

  it('debe renderizar correctamente con 0 días', () => {
    render(<StreakWidget days={0} streakMessage="¡Empieza hoy!" />);
    
    expect(screen.getByText('Racha de 0 días')).toBeInTheDocument();
  });
});