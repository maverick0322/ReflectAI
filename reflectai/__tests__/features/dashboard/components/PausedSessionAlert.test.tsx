import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PausedSessionAlert } from '@/features/dashboard/components/PausedSessionAlert';

describe('PausedSessionAlert', () => {
  it('shows the elapsed time passed through props', () => {
    const testTime = '3 h';
    render(<PausedSessionAlert timeAgo={testTime} />);

    expect(screen.getByText('Tienes una reflexión en pausa')).toBeInTheDocument();
    expect(screen.getByText(`Guardada hace ${testTime}`)).toBeInTheDocument();
  });

  it('renders the continue button', () => {
    render(<PausedSessionAlert timeAgo="1 h" />);

    expect(screen.getByRole('button', { name: /continuar sesión/i })).toBeInTheDocument();
  });

  it('hides itself when the close button is clicked', () => {
    render(<PausedSessionAlert timeAgo="1 h" />);

    expect(screen.getByText('Tienes una reflexión en pausa')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /cerrar alerta/i }));

    expect(screen.queryByText('Tienes una reflexión en pausa')).not.toBeInTheDocument();
  });
});
