import React from 'react';

interface SocialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  provider: string;
  icon: React.ReactNode; 
}

export default function SocialButton({ provider, icon, ...props }: SocialButtonProps) {
  return (
    <button
      {...props}
      type="button"
      className="w-full py-3.5 bg-white/50 backdrop-blur-sm border border-white/80 rounded-2xl text-[#1E1B4B] font-semibold flex items-center justify-center gap-2 hover:bg-white/70 transition-colors"
    >
      {icon}
      {provider}
    </button>
  );
}