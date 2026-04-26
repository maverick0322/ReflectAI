import React from 'react';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function Button({ children, className = "", ...props }: ButtonProps) {
  return (
    <button 
      {...props}
      className={`w-full py-4 bg-gradient-to-r from-orange-300 to-orange-400 text-white font-semibold text-lg rounded-2xl shadow-lg shadow-orange-400/30 hover:scale-[1.02] transition-transform active:scale-95 ${className}`}
    >
      {children}
    </button>
  );
}