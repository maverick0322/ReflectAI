import GlassCard from '@/components/ui/GlassCard';

interface DailyQuoteProps {
  text: string;
  author: string;
}

export function DailyQuote({ text, author }: DailyQuoteProps) {
  return (
    <GlassCard className="flex flex-col gap-3 border-white/20 bg-white/10 p-6 text-center dark:bg-black/10">
      <p className="text-lg font-serif italic leading-relaxed text-slate-800 dark:text-slate-100">
        &ldquo;{text}&rdquo;
      </p>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {author}
      </p>
    </GlassCard>
  );
}
