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
      screen.getByRole('heading', { name: /ayuda de reflectai/i }),
    ).toBeInTheDocument();

    const notice = screen.getByText(/aviso importante/i).closest('section');
    expect(notice).not.toBeNull();
    expect(notice).toHaveTextContent(/no es una herramienta cl(?:i|\u00ed)nica/i);
    expect(notice).toHaveTextContent(/atenci(?:o|\u00f3)n psicol(?:o|\u00f3)gica/i);

    expect(screen.getByText('1) Configura tu cuenta')).toBeInTheDocument();
    expect(screen.getByText('2) Inicia una sesión de reflexión')).toBeInTheDocument();
    expect(screen.getByText('3) Revisa tu progreso')).toBeInTheDocument();
    expect(screen.getByText('4) Preguntas frecuentes')).toBeInTheDocument();
  });

  it('keeps the manual steps connected to their visual references', () => {
    render(<HelpPage />);

    expect(
      screen.getByRole('heading', { name: /crea tu cuenta/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /eval(?:u|\u00fa)a la intensidad/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /compara sesiones/i }),
    ).toBeInTheDocument();

    expect(screen.getAllByTestId('manual-screenshot')).toHaveLength(10);
    expect(
      screen.getByLabelText(/control deslizante para intensidad emocional/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/referencia visual: comparaci(?:o|\u00f3)n lado a lado\./i),
    ).toBeInTheDocument();
  });

  it('renders actionable FAQ answers for data deletion and sync recovery', () => {
    render(<HelpPage />);

    const faqSection = screen.getByText('4) Preguntas frecuentes').closest('section');
    expect(faqSection).not.toBeNull();

    const faq = within(faqSection as HTMLElement);
    expect(
      faq.getByText(/puedo eliminar una sesi(?:o|\u00f3)n si me arrepiento de lo que escrib(?:i|\u00ed)\?/i),
    ).toBeInTheDocument();
    expect(faq.getByText(/usa el bot(?:o|\u00f3)n/i)).toHaveTextContent(
      /usa el bot(?:o|\u00f3)n eliminar al final\./i,
    );
    expect(
      faq.getByText(/mant(?:e|\u00e9)n abierta la pesta(?:n|\u00f1)a/i),
    ).toBeInTheDocument();
    expect(
      faq.getByText(/elimina tu perfil y tus reflexiones/i),
    ).toBeInTheDocument();
  });
});
