import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

const baseClassName = [
  'flex flex-col rounded-[2rem] border border-white/60 bg-white/40',
  'shadow-2xl shadow-purple-200/50 backdrop-blur-xl',
].join(' ');

export default function GlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <div className={`${baseClassName} ${className}`}>
      {children}
    </div>
  );
}
