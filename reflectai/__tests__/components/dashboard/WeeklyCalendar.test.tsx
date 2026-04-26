import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WeeklyCalendar } from '@/components/dashboard/WeeklyCalendar';

describe('WeeklyCalendar (Static Version)', () => {
  it('debe renderizar los 7 días de la semana', () => {
    render(<WeeklyCalendar currentDay={16} />);
    
    // Verificamos que se rendericen las etiquetas de los días
    const labelsL = screen.getAllByText('L');
    expect(labelsL.length).toBeGreaterThan(0); // Lunes
    expect(screen.getByText('D')).toBeInTheDocument(); // Domingo
  });

  it('debe resaltar visualmente el día actual', () => {
    render(<WeeklyCalendar currentDay={16} />);
    
    // Buscamos el contenedor del día 16
    const currentDayElement = screen.getByText('16').closest('div');
    
    // Verificamos que tenga las clases de resaltado (violet-500)
    expect(currentDayElement).toHaveClass('bg-violet-500');
    expect(currentDayElement).toHaveClass('text-white');
  });

  it('no debe resaltar un día diferente al actual', () => {
    render(<WeeklyCalendar currentDay={16} />);
    
    // Buscamos el contenedor de un día diferente (ej. 14)
    const otherDayElement = screen.getByText('14').closest('div');
    
    // Verificamos que tenga las clases de inactivo
    expect(otherDayElement).toHaveClass('text-slate-600');
    expect(otherDayElement).not.toHaveClass('bg-violet-500');
  });
});