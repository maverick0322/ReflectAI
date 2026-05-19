import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { SessionComparisonCard } from '@/components/statistics/SessionComparisonCard';

const options = [
  {
    id: 'session-a',
    label: 'Sesion A',
    intensity: 60,
    emotion: 'Ansiedad',
  },
  {
    id: 'session-b',
    label: 'Sesion B',
    intensity: 60,
    emotion: 'Calma',
  },
  {
    id: 'session-c',
    label: 'Sesion C',
    intensity: 20,
    emotion: 'Tristeza',
  },
];

describe('SessionComparisonCard', () => {
  it('disables comparison when there are not enough sessions', () => {
    render(
      <SessionComparisonCard
        sessionOptions={[options[0]]}
        defaultSelection={{ sessionA: 'session-a', sessionB: 'session-a' }}
      />,
    );

    expect(screen.getByRole('button', { name: /Ver comparacion/i })).toBeDisabled();
    expect(screen.getByText(/Completa al menos dos sesiones/i)).toBeInTheDocument();
  });

  it('shows same-session and equal-intensity insights', async () => {
    const user = userEvent.setup();

    render(
      <SessionComparisonCard
        sessionOptions={options}
        defaultSelection={{ sessionA: 'session-a', sessionB: 'session-a' }}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Ver comparacion/i }));
    expect(screen.getByText(/misma sesion/i)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/Sesion B/i), 'session-b');
    await user.click(screen.getByRole('button', { name: /Ver comparacion/i }));

    expect(screen.getByText(/misma intensidad emocional/i)).toBeInTheDocument();
  });

  it('updates the insight when selecting a lower intensity session', async () => {
    const user = userEvent.setup();

    render(
      <SessionComparisonCard
        sessionOptions={options}
        defaultSelection={{ sessionA: 'session-a', sessionB: 'session-b' }}
      />,
    );

    await user.selectOptions(screen.getByLabelText(/Sesion B/i), 'session-c');
    await user.click(screen.getByRole('button', { name: /Ver comparacion/i }));

    expect(screen.getByText(/40% mas intensidad emocional/i)).toBeInTheDocument();
  });
});
