import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div className={`w-full max-w-md bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2rem] p-8 shadow-2xl shadow-purple-200/50 flex flex-col gap-6 ${className}`}>
      {children}
    </div>
  );
}