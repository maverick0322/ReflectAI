import React from 'react';

interface SocialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  provider: string;
  icon: React.ReactNode; 
}

export default function SocialButton({ provider, icon, ...props }: SocialButtonProps) {
  const isDisabled = Boolean(props.disabled);
  return (
    <button
      {...props}
      type="button"
      className={`w-full py-3.5 bg-white/50 backdrop-blur-sm border border-white/80 rounded-2xl text-[#1E1B4B] font-semibold flex items-center justify-center gap-2 transition-colors ${
        isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-white/70"
      }`}
    >
      {icon}
      {provider}
    </button>
  );
}