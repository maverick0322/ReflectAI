import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import HelpPage from '@/features/help/pages/HelpPage';

vi.mock('@/features/help/components/ManualScreenshot', () => ({
  default: ({
    alt,
    caption,
  }: {
    src: string;
    alt: string;
    calloutText?: string;
    caption?: string;
  }) => (
    <figure data-testid="manual-screenshot">
      <div role="img" aria-label={alt} />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  ),
}));

describe('HelpPage', () => {
  it('renders the clinical disclaimer and the main guide sections', () => {
    render(<HelpPage />);

    expect(
      screen.getByRole('heading', { name: /reflectai help/i }),
    ).toBeInTheDocument();

    const notice = screen.getByText(/important notice/i).closest('section');
    expect(notice).not.toBeNull();
    expect(notice).toHaveTextContent(/not a clinical tool/i);
    expect(notice).toHaveTextContent(/professional psychological/i);

    expect(screen.getByText('1) Set up your account')).toBeInTheDocument();
    expect(screen.getByText('2) Start a reflection session')).toBeInTheDocument();
    expect(screen.getByText('3) Review your progress')).toBeInTheDocument();
    expect(screen.getByText('4) Frequently asked questions')).toBeInTheDocument();
  });

  it('keeps the manual steps connected to their visual references', () => {
    render(<HelpPage />);

    expect(screen.getByRole('heading', { name: /create your account/i }))
      .toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /rate intensity/i }))
      .toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /compare sessions/i }))
      .toBeInTheDocument();

    expect(screen.getAllByTestId('manual-screenshot').length).toBeGreaterThan(6);
    expect(
      screen.getByLabelText('Emotion intensity slider control.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Visual reference: side-by-side comparison.'),
    ).toBeInTheDocument();
  });

  it('renders actionable FAQ answers for data deletion and sync recovery', () => {
    render(<HelpPage />);

    const faqSection = screen
      .getByText('4) Frequently asked questions')
      .closest('section');
    expect(faqSection).not.toBeNull();

    const faq = within(faqSection as HTMLElement);
    expect(
      faq.getByText('Can I delete a session if I regret what I wrote?'),
    ).toBeInTheDocument();
    expect(faq.getByText(/button at the bottom/i)).toHaveTextContent(
      /Delete button at the bottom\./,
    );
    expect(
      faq.getByText(/connection drops, keep the tab open/i),
    ).toBeInTheDocument();
    expect(faq.getByText(/removes your profile and reflections/i))
      .toBeInTheDocument();
  });
});
