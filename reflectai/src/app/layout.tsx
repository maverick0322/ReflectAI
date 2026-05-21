import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'ReflectAI',
  description: 'Tu espacio seguro para la reflexion personal',
};

const bodyClassName = [
  'min-h-screen bg-gradient-to-br from-[#E0F2FE] to-[#F3E8FF]',
  'text-[#1E1B4B] antialiased',
].join(' ');

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        suppressHydrationWarning
        className={bodyClassName}
      >
        <div className="flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
          <footer className="px-6 py-4 text-center text-xs text-[#1E1B4B]/60">
            ReflectAI no es una herramienta clinica, no diagnostica y no sustituye
            la atención psicologica profesional
          </footer>
        </div>
      </body>
    </html>
  );
}
