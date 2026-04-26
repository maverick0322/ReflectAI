import GlassCard from "@/components/ui/GlassCard";

// Añadimos 'author' a las propiedades
export function DailyQuote({ text, author }: { text: string; author: string }) {
  return (
    <GlassCard className="p-6 flex flex-col gap-3 text-center bg-white/10 dark:bg-black/10 border-white/20">
      <p className="text-lg font-serif italic leading-relaxed text-slate-800 dark:text-slate-100">
        "{text}" {/* Añadidas las comillas */}
      </p>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        — {author}
      </p>
    </GlassCard>
  );
}