import type { ComponentType, SVGProps } from 'react';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ArrowLeftIcon from '@/shared/icons/ArrowLeftIcon';
import BellIcon from '@/shared/icons/BellIcon';
import { CalendarIcon } from '@/shared/icons/CalendarIcon';
import CameraIcon from '@/shared/icons/CameraIcon';
import { ChartIcon } from '@/shared/icons/ChartIcon';
import CheckIcon from '@/shared/icons/CheckIcon';
import { ClockIcon } from '@/shared/icons/ClockIcon';
import CloseIcon from '@/shared/icons/CloseIcon';
import { EyeIcon } from '@/shared/icons/EyeIcon';
import { EyeOffIcon } from '@/shared/icons/EyeOffIcon';
import { FacebookIcon } from '@/shared/icons/FacebookIcon';
import { GoogleIcon } from '@/shared/icons/GoogleIcon';
import { HelpIcon } from '@/shared/icons/HelpIcon';
import { HomeIcon } from '@/shared/icons/HomeIcon';
import { LightningIcon } from '@/shared/icons/LightningIcon';
import LockIcon from '@/shared/icons/LockIcon';
import LogOutIcon from '@/shared/icons/LogOutIcon';
import MoonIcon from '@/shared/icons/MoonIcon';
import PencilIcon from '@/shared/icons/PencilIcon';
import { PlusIcon } from '@/shared/icons/PlusIcon';
import { ProfileIcon } from '@/shared/icons/ProfileIcon';
import SaveIcon from '@/shared/icons/SaveIcon';
import { SearchIcon } from '@/shared/icons/SearchIcon';
import { SparklesIcon } from '@/shared/icons/SparklesIcon';
import TrashIcon from '@/shared/icons/TrashIcon';
import WarningIcon from '@/shared/icons/WarningIcon';

const propAwareIcons: Array<{
  label: string;
  Component: ComponentType<SVGProps<SVGSVGElement>>;
}> = [
  { label: 'arrow left', Component: ArrowLeftIcon },
  { label: 'bell', Component: BellIcon },
  { label: 'calendar', Component: CalendarIcon },
  { label: 'camera', Component: CameraIcon },
  { label: 'chart', Component: ChartIcon },
  { label: 'check', Component: CheckIcon },
  { label: 'clock', Component: ClockIcon },
  { label: 'close', Component: CloseIcon },
  { label: 'help', Component: HelpIcon },
  { label: 'home', Component: HomeIcon },
  { label: 'lightning', Component: LightningIcon },
  { label: 'lock', Component: LockIcon },
  { label: 'logout', Component: LogOutIcon },
  { label: 'moon', Component: MoonIcon },
  { label: 'pencil', Component: PencilIcon },
  { label: 'plus', Component: PlusIcon },
  { label: 'profile', Component: ProfileIcon },
  { label: 'save', Component: SaveIcon },
  { label: 'search', Component: SearchIcon },
  { label: 'sparkles', Component: SparklesIcon },
  { label: 'trash', Component: TrashIcon },
  { label: 'warning', Component: WarningIcon },
];

describe('shared icons', () => {
  it('passes accessibility and class props through the shared SVG icons', () => {
    render(
      <>
        {propAwareIcons.map(({ label, Component }) => (
          <Component
            key={label}
            aria-label={`${label} icon`}
            className="h-4 w-4 text-violet-500"
            data-testid={`${label}-icon`}
          />
        ))}
      </>,
    );

    for (const { label } of propAwareIcons) {
      const icon = screen.getByLabelText(`${label} icon`);
      expect(icon.tagName.toLowerCase()).toBe('svg');
      expect(icon).toHaveClass('h-4');
      expect(icon).toHaveAttribute('data-testid', `${label}-icon`);
      expect(icon.querySelector('path')).toBeInTheDocument();
    }
  });

  it('keeps password visibility icons hidden from assistive technology', () => {
    const { container } = render(
      <>
        <EyeIcon />
        <EyeOffIcon />
      </>,
    );

    const icons = container.querySelectorAll('svg[aria-hidden="true"]');
    expect(icons).toHaveLength(2);
    expect(icons[0].querySelector('path')).toBeInTheDocument();
    expect(icons[1].querySelector('path')).toBeInTheDocument();
  });

  it('renders the branded social sign-in icons with their brand colors', () => {
    const { container } = render(
      <>
        <FacebookIcon />
        <GoogleIcon />
      </>,
    );

    const facebookPath = container.querySelector('svg[fill="#1877F2"] path');
    const googlePaths = container.querySelectorAll('svg[fill="currentColor"] path');

    expect(facebookPath).toBeInTheDocument();
    expect(googlePaths).toHaveLength(4);
    expect(googlePaths[0]).toHaveAttribute('fill', '#4285F4');
    expect(googlePaths[1]).toHaveAttribute('fill', '#34A853');
    expect(googlePaths[2]).toHaveAttribute('fill', '#FBBC05');
    expect(googlePaths[3]).toHaveAttribute('fill', '#EA4335');
  });
});
