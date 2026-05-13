import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ReflectAI',
  description: 'Tu espacio seguro para la reflexión personal',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body 
        suppressHydrationWarning 
        className="bg-gradient-to-br from-[#E0F2FE] to-[#F3E8FF] min-h-screen text-[#1E1B4B] antialiased"
      >
        <div className="min-h-screen flex flex-col">
          <div className="flex-1">
            {children}
          </div>
          <footer className="px-6 py-4 text-xs text-[#1E1B4B]/60 text-center">
            ReflectAI no es una herramienta clinica, no diagnostica y no sustituye
            atencion psicologica profesional.
          </footer>
        </div>
      </body>
    </html>
  );
}
