import BottomNav from "@/components/ui/BottomNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    // 1. Un contenedor flex normal que ocupa toda la pantalla.
    <div className="flex flex-col min-h-screen">
      
      {/* 2. Tu contenido. Aquí adentro vive el 'mx-auto max-w-lg px-4' de tu Dashboard */}
      <div className="flex-1"> 
        {children}
      </div>
      
      {/* 3. El contenedor del NAV. Usaremos flex-fixed. */}
      <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
        {/* 4. Aquí forzamos exactamente la misma matemática que tu Dashboard */}
        <div className="w-full max-w-lg px-4 pointer-events-auto">
          <BottomNav />
        </div>
      </div>
      
    </div>
  );
}