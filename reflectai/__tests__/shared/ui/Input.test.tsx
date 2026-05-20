import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Input from '@/shared/ui/Input';

describe('Input', () => {
  it('shows the character counter when maxLength is provided', () => {
    render(<Input placeholder="Write your name" maxLength={10} />);

    const inputElement = screen.getByPlaceholderText('Write your name');
    fireEvent.change(inputElement, { target: { value: 'Hello' } });

    expect(screen.getByText('5/10')).toBeInTheDocument();
  });

  it('shows the limit reached message at the maximum length', () => {
    render(<Input placeholder="Write your name" maxLength={5} />);

    const inputElement = screen.getByPlaceholderText('Write your name');
    fireEvent.change(inputElement, { target: { value: 'World' } });

    const limitMessage = screen.getByText('Character limit reached');
    expect(limitMessage).toBeInTheDocument();
    expect(limitMessage).toHaveClass('text-red-500');
  });
});
