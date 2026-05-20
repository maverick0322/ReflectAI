interface WizardStatusMessagesProps {
  formError: string | null;
  draftMessage: string | null;
  isSaving: boolean;
}

export function WizardStatusMessages({
  formError,
  draftMessage,
  isSaving,
}: WizardStatusMessagesProps) {
  return (
    <>
      {formError && (
        <p className="text-sm font-semibold text-red-500" role="alert">
          {formError}
        </p>
      )}
      {draftMessage && (
        <p className="text-sm font-semibold text-green-600" role="status">
          {draftMessage}
        </p>
      )}
      {isSaving && (
        <p className="text-sm font-semibold text-slate-500" role="status">
          Saving...
        </p>
      )}
    </>
  );
}
