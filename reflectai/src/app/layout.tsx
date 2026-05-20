import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'ReflectAI',
  description: 'Your safe space for personal reflection',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className="min-h-screen bg-gradient-to-br from-[#E0F2FE] to-[#F3E8FF] text-[#1E1B4B] antialiased"
      >
        <div className="flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
          <footer className="px-6 py-4 text-center text-xs text-[#1E1B4B]/60">
            ReflectAI is not a clinical tool, does not diagnose, and does not replace
            professional psychological care.
          </footer>
        </div>
      </body>
    </html>
  );
}
