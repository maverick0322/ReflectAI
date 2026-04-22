import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PasswordInput from '@/components/ui/PasswordInput';

describe('Componente PasswordInput', () => {
  
  it('debe cambiar de tipo password a text al hacer clic en el botón del ojo', () => {
    render(<PasswordInput placeholder="Escribe tu contraseña" />);

    const inputElement = screen.getByPlaceholderText('Escribe tu contraseña');
    
    expect(inputElement).toHaveAttribute('type', 'password');

    const botonOjo = screen.getByRole('button', { name: /mostrar contraseña/i });

    fireEvent.click(botonOjo);

    expect(inputElement).toHaveAttribute('type', 'text');
    
    expect(botonOjo).toHaveAttribute('aria-label', 'Ocultar contraseña');
  });

});