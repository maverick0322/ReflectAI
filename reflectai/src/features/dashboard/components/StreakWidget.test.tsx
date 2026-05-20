import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StreakWidget } from '@/features/dashboard/components/StreakWidget';

describe('StreakWidget', () => {
  it('renders the streak in plural form', () => {
    render(<StreakWidget days={5} streakMessage="Test message" />);

    expect(screen.getByText('5-day streak')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders the streak with 1 day', () => {
    render(<StreakWidget days={1} streakMessage="Habit started" />);

    expect(screen.getByText('1-day streak')).toBeInTheDocument();
  });

  it('renders correctly with 0 days', () => {
    render(<StreakWidget days={0} streakMessage="Start today" />);

    expect(screen.getByText('0-day streak')).toBeInTheDocument();
  });
});
