import Link from 'next/link';

export default function BottomNav() {
  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/40 backdrop-blur-lg border border-white/40 shadow-xl rounded-3xl py-4 px-8 flex justify-between items-center z-50">
      <Link href="/" className="text-2xl hover:scale-110 transition-transform">🏠</Link>
      <Link href="/nueva-sesion" className="bg-gradient-to-r from-orange-300 to-orange-400 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-orange-300/50 hover:scale-105 transition-transform">
        +
      </Link>
      <Link href="/estadisticas" className="text-2xl hover:scale-110 transition-transform">📊</Link>
      <Link href="/historial" className="text-2xl hover:scale-110 transition-transform">🕒</Link>
    </nav>
  );
}