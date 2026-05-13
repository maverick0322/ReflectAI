import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { StepGrounding } from '@/components/wizard/steps/StepGrounding';

describe('StepGrounding', () => {
  it('calls onContinue when user clicks', async () => {
    const user = userEvent.setup();
    const onContinue = vi.fn();
    const onPrev = vi.fn();

    render(<StepGrounding onContinue={onContinue} onPrev={onPrev} />);

    await user.click(screen.getByRole('button', { name: /estoy listo/i }));

    expect(onContinue).toHaveBeenCalled();
  });
});
