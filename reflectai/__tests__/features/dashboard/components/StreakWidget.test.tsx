import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StreakWidget } from '@/features/dashboard/components/StreakWidget';

describe('StreakWidget', () => {
  it('renders the streak in plural form', () => {
    render(<StreakWidget days={5} streakMessage="Test message" />);

    expect(screen.getByText(/racha de 5 días/i)).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders the streak with 1 day', () => {
    render(<StreakWidget days={1} streakMessage="Habit started" />);

    expect(screen.getByText(/racha de 1 día/i)).toBeInTheDocument();
  });

  it('renders correctly with 0 days', () => {
    render(<StreakWidget days={0} streakMessage="Start today" />);

    expect(screen.getByText(/racha de 0 días/i)).toBeInTheDocument();
  });
});
