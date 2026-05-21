/* eslint-disable @next/next/no-img-element */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ManualScreenshot from '@/features/help/components/ManualScreenshot';

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    onError,
    className,
  }: {
    src: string;
    alt: string;
    onError?: React.ReactEventHandler<HTMLImageElement>;
    className?: string;
  }) => <img src={src} alt={alt} onError={onError} className={className} data-testid="manual-image" />,
}));

vi.mock('@/shared/icons/CameraIcon', () => ({
  default: ({ className }: { className?: string }) => (
    <svg data-testid="camera-icon" className={className} />
  ),
}));

describe('ManualScreenshot', () => {
  it('renders the image with the provided alt text', () => {
    render(<ManualScreenshot src="/manual/step-1.png" alt="Step 1 screenshot" />);

    expect(screen.getByAltText('Step 1 screenshot')).toBeInTheDocument();
  });

  it('normalizes src values that do not start with a slash', () => {
    render(<ManualScreenshot src="manual/step-1.png" alt="Normalized screenshot" />);

    expect(screen.getByAltText('Normalized screenshot')).toHaveAttribute(
      'src',
      '/manual/step-1.png',
    );
  });

  it('keeps src values that already start with a slash', () => {
    render(<ManualScreenshot src="/manual/step-1.png" alt="Absolute screenshot" />);

    expect(screen.getByAltText('Absolute screenshot')).toHaveAttribute(
      'src',
      '/manual/step-1.png',
    );
  });

  it('shows the default callout text when none is provided', () => {
    render(<ManualScreenshot src="/manual/step-1.png" alt="Default callout screenshot" />);

    expect(screen.getByText(/toca aquí/i)).toBeInTheDocument();
  });

  it('shows a custom callout text', () => {
    render(
      <ManualScreenshot
        src="/manual/step-1.png"
        alt="Custom callout screenshot"
        calloutText="Save now"
      />,
    );

    expect(screen.getByText('Save now')).toBeInTheDocument();
  });

  it('shows the caption when provided', () => {
    render(
      <ManualScreenshot
        src="/manual/step-1.png"
        alt="Caption screenshot"
        caption="Support caption below the image"
      />,
    );

    expect(screen.getByText('Support caption below the image')).toBeInTheDocument();
  });

  it('hides the caption when it is not provided', () => {
    render(<ManualScreenshot src="/manual/step-1.png" alt="Screenshot without caption" />);

    expect(screen.queryByText(/support caption below the image/i)).not.toBeInTheDocument();
  });

  it('shows the fallback state when the image fails', () => {
    render(<ManualScreenshot src="/manual/step-1.png" alt="Error screenshot" />);

    fireEvent.error(screen.getByTestId('manual-image'));

    expect(screen.getByText(/captura pendiente/i)).toBeInTheDocument();
    expect(
      screen.getByText(/esta imagen se agregará cuando la interfaz quede finalizada/i),
    ).toBeInTheDocument();
    expect(screen.getByTestId('camera-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('manual-image')).not.toBeInTheDocument();
  });
});
