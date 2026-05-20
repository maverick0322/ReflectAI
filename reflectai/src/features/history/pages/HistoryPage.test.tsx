import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import HistoryPage from '@/app/(main)/history/page';

vi.mock('@/shared/icons/SearchIcon', () => ({
  SearchIcon: () => <svg data-testid="search-icon" />,
}));

describe('HistoryPage', () => {
  it('renders the history shell with the placeholder notice', () => {
    const { container } = render(<HistoryPage />);

    expect(screen.getByRole('heading', { name: /my history/i })).toBeInTheDocument();
    expect(
      screen.getByText(/you have completed 42 reflection sessions/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent(/frontend placeholder/i);
    expect(container.querySelector('main')).toHaveClass('max-w-lg');
  });

  it('shows the search input and grouped timeline cards', () => {
    render(<HistoryPage />);

    expect(screen.getByLabelText(/search history/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /april 2026/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /anxiety before a project deadline/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/apr 15, 10:30 am/i)).toBeInTheDocument();
    expect(screen.getByText(/^anxiety$/i)).toBeInTheDocument();
  });
});
