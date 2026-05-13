import Button from '@/components/ui/Button';

interface WizardStepActionsProps {
  onPrev?: () => void;
  onNext?: () => void;
  nextLabel: string;
  prevLabel?: string;
}

export function WizardStepActions({
  onPrev,
  onNext,
  nextLabel,
  prevLabel = 'Atrás',
}: WizardStepActionsProps) {
  if (!onPrev) {
    return (
      <Button type="button" onClick={onNext}>
        {nextLabel}
      </Button>
    );
  }

  return (
    <div className="flex gap-4 mt-4">
      <Button type="button" variant="ghost" onClick={onPrev} className="w-1/3">
        {prevLabel}
      </Button>
      <Button type="button" onClick={onNext} className="w-2/3">
        {nextLabel}
      </Button>
    </div>
  );
}
