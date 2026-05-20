import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { HistorySearchBar } from '@/features/history/components/HistorySearchBar';

describe('HistorySearchBar', () => {
  it('renders an uncontrolled search input with the provided default value', () => {
    render(
      <HistorySearchBar
        placeholder="Search sessions"
        defaultValue="work"
      />,
    );

    const input = screen.getByRole('searchbox', { name: /search history/i });
    expect(input).toHaveAttribute('placeholder', 'Search sessions');
    expect(input).toHaveValue('work');
  });

  it('calls onChange when used as a controlled input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <HistorySearchBar
        placeholder="Search sessions"
        value=""
        onChange={onChange}
      />,
    );

    await user.type(screen.getByRole('searchbox', { name: /search history/i }), 'an');

    expect(onChange).toHaveBeenNthCalledWith(1, 'a');
    expect(onChange).toHaveBeenNthCalledWith(2, 'n');
  });
});
