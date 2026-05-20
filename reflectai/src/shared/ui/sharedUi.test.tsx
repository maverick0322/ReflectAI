import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SessionCard } from '@/features/dashboard/components/SessionCard';
import BottomNav from '@/shared/ui/BottomNav';
import SocialButton from '@/shared/ui/SocialButton';

const usePathnameMock = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
}));

vi.mock('@/shared/icons/HomeIcon', () => ({
  HomeIcon: () => <svg data-testid="home-icon" />,
}));
vi.mock('@/shared/icons/PlusIcon', () => ({
  PlusIcon: () => <svg data-testid="plus-icon" />,
}));
vi.mock('@/shared/icons/CalendarIcon', () => ({
  CalendarIcon: () => <svg data-testid="calendar-icon" />,
}));
vi.mock('@/shared/icons/ChartIcon', () => ({
  ChartIcon: () => <svg data-testid="chart-icon" />,
}));
vi.mock('@/shared/icons/ProfileIcon', () => ({
  ProfileIcon: () => <svg data-testid="profile-icon" />,
}));

describe('shared UI components', () => {
  it('exposes the main BottomNav links', () => {
    usePathnameMock.mockReturnValue('/dashboard');

    render(<BottomNav />);

    expect(screen.getByLabelText('Home')).toHaveAttribute('href', '/dashboard');
    expect(screen.getByLabelText('History')).toHaveAttribute('href', '/history');
    expect(screen.getByLabelText('Statistics')).toHaveAttribute('href', '/statistics');
    expect(screen.getByLabelText('New session')).toHaveAttribute('href', '/new-session');
    expect(screen.getByLabelText('Profile')).toHaveAttribute('href', '/profile');
  });

  it('marks the active BottomNav route', () => {
    usePathnameMock.mockReturnValue('/history');

    render(<BottomNav />);

    expect(screen.getByLabelText('History')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByLabelText('Profile')).not.toHaveAttribute('aria-current');
  });

  it('renders SocialButton with the provider and disabled state', () => {
    render(<SocialButton provider="Google" icon={<span data-testid="icon" />} disabled />);

    expect(screen.getByRole('button', { name: /google/i })).toBeDisabled();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders a session summary card', () => {
    render(
      <SessionCard
        session={{
          id: 'session-1',
          title: 'Short reflection',
          date: '2026-05-07',
          mood: 'Calm',
        }}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Short reflection' })).toBeInTheDocument();
    expect(screen.getByText('Calm')).toBeInTheDocument();
    expect(screen.getByText('2026-05-07')).toHaveAttribute('dateTime', '2026-05-07');
  });
});
