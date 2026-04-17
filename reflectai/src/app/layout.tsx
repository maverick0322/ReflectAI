import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ReflectAI",
  description: "Tu espacio seguro para la reflexión personal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      {}
      <body className={`${inter.className} bg-gradient-to-br from-[#E0F2FE] to-[#F3E8FF] min-h-screen text-[#1E1B4B] antialiased`}>
        {children}
      </body>
    </html>
  );
}