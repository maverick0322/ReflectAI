import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PausedSessionAlert } from '@/features/dashboard/components/PausedSessionAlert';

describe('PausedSessionAlert', () => {
  it('shows the elapsed time passed through props', () => {
    const testTime = '3 h';
    render(<PausedSessionAlert timeAgo={testTime} />);

    expect(screen.getByText('You have a paused reflection')).toBeInTheDocument();
    expect(screen.getByText(`Saved ${testTime} ago`)).toBeInTheDocument();
  });

  it('renders the continue button', () => {
    render(<PausedSessionAlert timeAgo="1 h" />);

    expect(screen.getByRole('button', { name: /continue session/i })).toBeInTheDocument();
  });

  it('hides itself when the close button is clicked', () => {
    render(<PausedSessionAlert timeAgo="1 h" />);

    expect(screen.getByText('You have a paused reflection')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /close alert/i }));

    expect(screen.queryByText('You have a paused reflection')).not.toBeInTheDocument();
  });
});
