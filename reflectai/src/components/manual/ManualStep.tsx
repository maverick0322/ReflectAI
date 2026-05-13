import ManualScreenshot from '@/components/manual/ManualScreenshot';

type ManualStepProps = Readonly<{
  title: string;
  description: React.ReactNode;
  screenshot: {
    src: string;
    alt: string;
    calloutText?: string;
    caption?: string;
  };
}>;

export default function ManualStep({ title, description, screenshot }: ManualStepProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="space-y-1">
        <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-black">
          {title}
        </h3>
        <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {description}
        </div>
      </div>

      <ManualScreenshot
        src={screenshot.src}
        alt={screenshot.alt}
        calloutText={screenshot.calloutText}
        caption={screenshot.caption}
      />
    </section>
  );
}

