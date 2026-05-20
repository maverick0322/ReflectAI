'use client';

import { useRef, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ApiError } from '@/core/api/http';
import { APP_ROUTES } from '@/core/routing/routes';
import { deleteAccount } from '@/features/auth/services/authService';
import WarningIcon from '@/shared/icons/WarningIcon';
import GlassCard from '@/shared/ui/GlassCard';
import Input from '@/shared/ui/Input';

const DELETE_CONFIRMATION_TEXT = 'DELETE';

const successStateClassName = [
  'animate-in zoom-in-95 flex flex-col items-center justify-center',
  'py-8 duration-500',
].join(' ');

const successIconClassName = [
  'mb-6 flex h-20 w-20 items-center justify-center rounded-full',
  'border-2 border-green-200 bg-green-100 text-green-500 shadow-sm',
].join(' ');

const warningIconClassName = [
  'flex h-12 w-12 items-center justify-center rounded-full',
  'bg-red-100 text-red-500',
].join(' ');

const cancelLinkClassName = [
  'flex w-full flex-1 items-center justify-center rounded-2xl',
  'border-2 border-slate-300 py-4 text-lg font-bold text-slate-700',
  'transition-all duration-300 hover:bg-white/50',
].join(' ');

const enabledDeleteButtonClassName = [
  '!bg-black !text-white border border-black shadow-xl',
  'hover:!bg-slate-900 hover:scale-[1.02] active:scale-95',
].join(' ');

function normalizeDeleteConfirmation(value: string) {
  return value.replace(/[^A-Za-z]/g, '').slice(0, 8).toUpperCase();
}

function getDeleteButtonClassName(canDelete: boolean) {
  return [
    'flex-1 rounded-2xl py-4 text-lg font-bold transition-all duration-300',
    canDelete
      ? enabledDeleteButtonClassName
      : 'cursor-not-allowed bg-slate-200 text-slate-400 shadow-none',
  ].join(' ');
}

export function DeleteAccountPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isConfirmed = confirmText === DELETE_CONFIRMATION_TEXT;
  const canDelete = isConfirmed && currentPassword.trim().length > 0;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const normalizedText = normalizeDeleteConfirmation(event.target.value);
    setConfirmText(normalizedText);

    requestAnimationFrame(() => {
      inputRef.current?.setSelectionRange(
        normalizedText.length,
        normalizedText.length,
      );
    });
  };

  const handleDelete = async () => {
    if (!canDelete) {
      return;
    }

    setIsDeleting(true);
    setFormError(null);

    try {
      await deleteAccount(currentPassword);
      setTimeout(() => {
        router.push(APP_ROUTES.login);
      }, 2500);
    } catch (error: unknown) {
      const message =
        error instanceof ApiError && error.payload?.message
          ? error.payload.message
          : 'Unable to delete the account';
      setFormError(message);
      setIsDeleting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 py-12">
      <GlassCard className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-reflect-dark">
            Delete account
          </h1>
        </div>

        {isDeleting ? (
          <div className={successStateClassName}>
            <div className={successIconClassName}>
              <svg
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-reflect-dark">
              Account deleted
            </h2>
            <p className="mt-2 text-center text-sm text-reflect-dark/60">
              Your account was deleted successfully. Redirecting...
            </p>
          </div>
        ) : (
          <>
            <header className="animate-in mb-6 space-y-3 text-center fade-in duration-300">
              <div className="flex justify-center">
                <div className={warningIconClassName}>
                  <WarningIcon className="h-7 w-7" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-reflect-dark">Warning</h2>
              <p className="text-sm text-reflect-dark/70">
                This action is <strong className="text-red-500">irreversible</strong>;
                all of your data will be removed permanently.
              </p>
            </header>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 rounded-xl bg-reflect-dark/5 p-4">
                <label
                  htmlFor="delete-confirm-input"
                  className="text-center text-xs font-medium text-reflect-dark"
                >
                  To confirm, type <strong>{DELETE_CONFIRMATION_TEXT}</strong>{' '}
                  below:
                </label>
                <Input
                  id="delete-confirm-input"
                  value={confirmText}
                  onChange={handleInputChange}
                  ref={inputRef}
                  placeholder={DELETE_CONFIRMATION_TEXT}
                  className="text-center font-bold uppercase tracking-widest text-reflect-dark"
                />
              </div>

              <Input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="Current password"
              />

              {formError && (
                <p className="text-sm font-semibold text-red-500" role="alert">
                  {formError}
                </p>
              )}

              <div className="flex gap-3">
                <Link
                  href={APP_ROUTES.profile}
                  className={cancelLinkClassName}
                >
                  Cancel
                </Link>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={!canDelete}
                  className={getDeleteButtonClassName(canDelete)}
                >
                  Delete
                </button>
              </div>
            </div>
          </>
        )}
      </GlassCard>
    </main>
  );
}
