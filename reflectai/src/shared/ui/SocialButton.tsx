import React from 'react';

interface SocialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  provider: string;
  icon: React.ReactNode;
}

function getSocialButtonClassName(isDisabled: boolean) {
  return [
    'flex w-full items-center justify-center gap-2 rounded-2xl border',
    'border-white/80 bg-white/50 py-3.5 font-semibold text-[#1E1B4B]',
    'backdrop-blur-sm transition-colors',
    isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-white/70',
  ].join(' ');
}

export default function SocialButton({ provider, icon, ...props }: SocialButtonProps) {
  const isDisabled = Boolean(props.disabled);
  return (
    <button
      {...props}
      type="button"
      className={getSocialButtonClassName(isDisabled)}
    >
      {icon}
      {provider}
    </button>
  );
}
