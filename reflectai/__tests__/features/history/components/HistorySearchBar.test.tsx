import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { HistorySearchBar } from '@/features/history/components/HistorySearchBar';

describe('HistorySearchBar', () => {
  it('renders an uncontrolled search input with the provided default value', () => {
    render(
      <HistorySearchBar
        placeholder="Buscar sesiÓnes"
        defaultValue="work"
      />,
    );

    const input = screen.getByRole('searchbox', { name: /buscar en el historial/i });
    expect(input).toHaveAttribute('placeholder', 'Buscar sesiÓnes');
    expect(input).toHaveValue('work');
  });

  it('calls onChange when used as a controlled input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <HistorySearchBar
        placeholder="Buscar sesiÓnes"
        value=""
        onChange={onChange}
      />,
    );

    await user.type(screen.getByRole('searchbox', { name: /buscar en el historial/i }), 'an');

    expect(onChange).toHaveBeenNthCalledWith(1, 'a');
    expect(onChange).toHaveBeenNthCalledWith(2, 'n');
  });
});
