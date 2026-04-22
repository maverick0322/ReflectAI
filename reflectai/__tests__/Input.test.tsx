import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Input from '@/components/ui/Input';

describe('Componente Input Inteligente', () => {
  
  it('Debe mostrar el contador de caracteres si se le pasa un maxLength', () => {
    render(<Input placeholder="Escribe tu nombre" maxLength={10} />);
    const inputElement = screen.getByPlaceholderText('Escribe tu nombre');
    
    fireEvent.change(inputElement, { target: { value: 'Hola' } });
    
    expect(screen.getByText('4/10')).toBeInTheDocument();
  });

  it('Debe mostrar el mensaje de límite alcanzado al llegar al maxLength', () => {
    render(<Input placeholder="Escribe tu nombre" maxLength={5} />);
    const inputElement = screen.getByPlaceholderText('Escribe tu nombre');
    
    fireEvent.change(inputElement, { target: { value: 'Mundo' } });
    
    expect(screen.getByText('Se alcanzó el límite')).toBeInTheDocument();
    expect(screen.getByText('Se alcanzó el límite')).toHaveClass('text-red-500');
  });

});