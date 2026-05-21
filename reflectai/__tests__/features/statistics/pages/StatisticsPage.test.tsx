import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import StatisticsPage from '@/app/(main)/statistics/page';

vi.mock('@/shared/icons/LightningIcon', () => ({
  LightningIcon: () => <svg data-testid="lightning-icon" />,
}));

describe('StatisticsPage', () => {
  it('renders the statistics shell with the placeholder notice', () => {
    const { container } = render(<StatisticsPage />);

    expect(screen.getByRole('heading', { name: /my statistics/i })).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent(/placeholder data/i);
    expect(container.querySelector('main')).toHaveClass('max-w-lg');
  });

  it('shows the main statistics sections and mock values', () => {
    render(<StatisticsPage />);

    expect(screen.getByRole('heading', { name: /emotional evolution/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /frequent emotions/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /frequent topics/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /compare sessions/i })).toBeInTheDocument();
    expect(screen.getByText(/work \(12\)/i)).toBeInTheDocument();
    expect(screen.getByText(/mind reading/i)).toBeInTheDocument();
  });

  it('reveals the comparison result after the compare action', async () => {
    const user = userEvent.setup();
    render(<StatisticsPage />);

    expect(
      screen.getByText(/select two sessions and press compare to view the placeholder result/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /show comparison/i }));

    expect(screen.getByText(/80%/i)).toBeInTheDocument();
    expect(screen.getAllByText(/45%/i)).toHaveLength(2);
    expect(screen.getByText(/higher emotional intensity/i)).toBeInTheDocument();
  });

  it('resets the comparison result when a selected session changes', async () => {
    const user = userEvent.setup();
    render(<StatisticsPage />);

    await user.click(screen.getByRole('button', { name: /show comparison/i }));
    expect(screen.getByText(/higher emotional intensity/i)).toBeInTheDocument();

    await user.selectOptions(
      screen.getByLabelText('Session A'),
      'family-discussion',
    );

    expect(
      screen.getByText(/select two sessions and press compare/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/higher emotional intensity/i))
      .not.toBeInTheDocument();
  });
});
