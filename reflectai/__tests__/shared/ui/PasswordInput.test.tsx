import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import PasswordInput from '@/shared/ui/PasswordInput';

describe('PasswordInput', () => {
  it('toggles from password to text when the eye button is pressed', () => {
    render(<PasswordInput placeholder="Enter your password" />);

    const inputElement = screen.getByPlaceholderText('Enter your password');
    expect(inputElement).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button', { name: /show password/i });
    fireEvent.click(toggleButton);

    expect(inputElement).toHaveAttribute('type', 'text');
    expect(toggleButton).toHaveAttribute('aria-label', 'Hide password');
  });
});
