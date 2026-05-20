import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ManualStep from '@/features/help/components/ManualStep';

const manualScreenshotMock = vi.fn(
  ({
    src,
    alt,
    calloutText,
    caption,
  }: {
    src: string;
    alt: string;
    calloutText?: string;
    caption?: string;
  }) => (
    <div data-testid="manual-screenshot">
      <span>{src}</span>
      <span>{alt}</span>
      {calloutText ? <span>{calloutText}</span> : null}
      {caption ? <span>{caption}</span> : null}
    </div>
  ),
);

vi.mock('@/features/help/components/ManualScreenshot', () => ({
  default: (props: {
    src: string;
    alt: string;
    calloutText?: string;
    caption?: string;
  }) => manualScreenshotMock(props),
}));

describe('ManualStep', () => {
  it('renders the step title and description', () => {
    render(
      <ManualStep
        title="Create your account"
        description={<p>Use your email to get started.</p>}
        screenshot={{
          src: '/manual/step-1.png',
          alt: 'Register screen',
        }}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
    expect(screen.getByText('Use your email to get started.')).toBeInTheDocument();
  });

  it('renders ManualScreenshot with the correct props', () => {
    render(
      <ManualStep
        title="Save session"
        description="Confirm changes before leaving."
        screenshot={{
          src: '/manual/step-2.png',
          alt: 'Save button',
          calloutText: 'Save now',
          caption: 'Visual reference for the main button.',
        }}
      />,
    );

    expect(screen.getByTestId('manual-screenshot')).toBeInTheDocument();
    expect(manualScreenshotMock).toHaveBeenCalledWith({
      src: '/manual/step-2.png',
      alt: 'Save button',
      calloutText: 'Save now',
      caption: 'Visual reference for the main button.',
    });
    expect(screen.getByText('/manual/step-2.png')).toBeInTheDocument();
    expect(screen.getByText('Save button')).toBeInTheDocument();
    expect(screen.getByText('Save now')).toBeInTheDocument();
    expect(screen.getByText('Visual reference for the main button.')).toBeInTheDocument();
  });

  it('works when optional calloutText and caption are omitted', () => {
    render(
      <ManualStep
        title="Step without extras"
        description="This step does not need optional text."
        screenshot={{
          src: '/manual/step-3.png',
          alt: 'Simple screenshot',
        }}
      />,
    );

    expect(screen.getByTestId('manual-screenshot')).toBeInTheDocument();
    expect(manualScreenshotMock).toHaveBeenLastCalledWith({
      src: '/manual/step-3.png',
      alt: 'Simple screenshot',
      calloutText: undefined,
      caption: undefined,
    });
  });
});
