import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import PasswordInput from '@/shared/ui/PasswordInput';

describe('PasswordInput', () => {
  it('toggles from password to text when the eye button is pressed', () => {
    render(<PasswordInput placeholder="Ingresa tu contraseña" />);

    const inputElement = screen.getByPlaceholderText('Ingresa tu contraseña');
    expect(inputElement).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button', { name: /mostrar contraseña/i });
    fireEvent.click(toggleButton);

    expect(inputElement).toHaveAttribute('type', 'text');
    expect(toggleButton).toHaveAttribute('aria-label', 'Ocultar contraseña');
  });
});
