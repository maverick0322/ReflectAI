import BottomNav from '@/components/ui/BottomNav';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    // Keep the page content scrollable while the bottom navigation stays fixed.
    <div className="flex min-h-screen flex-col">
      {/* Page content keeps the mobile container width inside each route. */}
      <div className="flex-1">{children}</div>

      {/* Fixed navigation shell aligned to the same mobile width as dashboard. */}
      <div className="pointer-events-none fixed bottom-6 left-0 right-0 z-50 flex justify-center">
        {/* Mirror the same width math used by the main mobile screens. */}
        <div className="pointer-events-auto w-full max-w-lg px-4">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
