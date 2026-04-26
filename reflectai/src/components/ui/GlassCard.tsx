import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div className={`bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-2xl shadow-purple-200/50 flex flex-col ${className}`}>
      {children}
    </div>
  );
}