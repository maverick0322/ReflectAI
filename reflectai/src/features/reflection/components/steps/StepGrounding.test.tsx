import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { StepGrounding } from '@/features/reflection/components/steps/StepGrounding';

describe('StepGrounding', () => {
  it('calls onContinue when the user clicks the continue button', async () => {
    const user = userEvent.setup();
    const onContinue = vi.fn();
    const onPrev = vi.fn();

    render(<StepGrounding onContinue={onContinue} onPrev={onPrev} />);

    await user.click(screen.getByRole('button', { name: /i am ready to continue/i }));

    expect(onContinue).toHaveBeenCalled();
  });
});
