import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import HistorialPage from '@/app/(main)/historial/page';

vi.mock('@/components/icons/SearchIcon', () => ({
  SearchIcon: () => <svg data-testid="search-icon" />,
}));

describe('History Page', () => {
  it('renders the mobile-first history shell with placeholder notice', () => {
    const { container } = render(<HistorialPage />);

    expect(screen.getByRole('heading', { name: /Mi Historial/i })).toBeInTheDocument();
    expect(
      screen.getByText(/Has completado 42 sesiones de reflexion/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent(/datos dummy/i);
    expect(container.querySelector('main')).toHaveClass('max-w-lg');
  });

  it('shows the search input and grouped timeline cards with dummy sessions', () => {
    render(<HistorialPage />);

    expect(screen.getByLabelText(/Buscar en historial/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Abril 2026/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Ansiedad por entrega de proyecto/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/15 Abr, 10:30 AM/i)).toBeInTheDocument();
    expect(screen.getByText(/^Ansiedad$/i)).toBeInTheDocument();
  });
});
