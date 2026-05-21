'use client';

import { useState } from 'react';

import type {
  StatisticsComparisonSelection,
  StatisticsSessionOption,
} from '@/features/statistics/types/statistics';
import { buildStatisticsComparisonResult } from '@/lib/statistics/summary';
import GlassCard from '@/shared/ui/GlassCard';

interface SessionComparisonCardProps {
  sessionOptions: StatisticsSessionOption[];
  defaultSelection: StatisticsComparisonSelection;
}

const selectClassName = [
  'rounded-2xl border border-white/60 bg-white/60 px-4 py-3',
  'text-sm font-medium text-slate-700 outline-none transition',
  'focus:ring-2 focus:ring-violet-300',
].join(' ');

const compareButtonClassName = [
  'rounded-2xl border border-violet-200 bg-violet-500/10 px-4 py-3',
  'text-sm font-semibold text-violet-700 transition hover:bg-violet-500/20',
].join(' ');

const emptyComparisonClassName = [
  'flex h-24 items-center justify-center rounded-2xl border',
  'border-dashed border-white/60 bg-white/20 px-4',
].join(' ');

const comparisonHeaderClassName = [
  'flex items-center justify-between gap-4 text-xs font-semibold',
  'text-slate-600',
].join(' ');

export function SessionComparisonCard({
  sessionOptions,
  defaultSelection,
}: Readonly<SessionComparisonCardProps>) {
  const [selection, setSelection] = useState(defaultSelection);
  const [isComparing, setIsComparing] = useState(false);
  const canCompare =
    sessionOptions.length >= 2 &&
    Boolean(selection.sessionA) &&
    Boolean(selection.sessionB);
  const comparisonResult = buildStatisticsComparisonResult(
    sessionOptions,
    selection,
  );

  const handleSelectionChange = (
    field: keyof StatisticsComparisonSelection,
    value: string,
  ) => {
    setSelection((currentSelection) => ({
      ...currentSelection,
      [field]: value,
    }));
    setIsComparing(false);
  };

  const handleCompare = () => {
    if (!canCompare) {
      return;
    }

    setIsComparing(true);
  };

  return (
    <GlassCard className="p-5 gap-5 bg-white/25 shadow-xl shadow-violet-200/20">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-slate-900">
          Compare sessions
        </h2>
        <p className="text-sm text-slate-500">
          Compare the intensity of two completed reflections.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
          <span>Session A</span>
          <select
            aria-label="Session A"
            className={selectClassName}
            value={selection.sessionA}
            disabled={sessionOptions.length === 0}
            onChange={(event) =>
              handleSelectionChange('sessionA', event.target.value)
            }
          >
            {sessionOptions.length > 0 ? (
              sessionOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))
            ) : (
              <option value="">No completed sessions yet</option>
            )}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
          <span>Session B</span>
          <select
            aria-label="Session B"
            className={selectClassName}
            value={selection.sessionB}
            disabled={sessionOptions.length === 0}
            onChange={(event) =>
              handleSelectionChange('sessionB', event.target.value)
            }
          >
            {sessionOptions.length > 0 ? (
              sessionOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))
            ) : (
              <option value="">No completed sessions yet</option>
            )}
          </select>
        </label>
      </div>

      <button
        type="button"
        className={[
          compareButtonClassName,
          canCompare ? '' : 'cursor-not-allowed opacity-60',
        ].join(' ')}
        disabled={!canCompare}
        onClick={handleCompare}
      >
        Show comparison
      </button>

      {isComparing ? (
        <div className="space-y-4 rounded-2xl border border-white/60 bg-white/45 p-4">
          <div className="space-y-2">
            <div className={comparisonHeaderClassName}>
              <span>{comparisonResult.sessionALabel}</span>
              <span>{comparisonResult.sessionAIntensity}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/70">
              <div
                className="h-2.5 rounded-full bg-violet-400"
                style={{ width: `${comparisonResult.sessionAIntensity}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className={comparisonHeaderClassName}>
              <span>{comparisonResult.sessionBLabel}</span>
              <span>{comparisonResult.sessionBIntensity}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/70">
              <div
                className="h-2.5 rounded-full bg-indigo-300"
                style={{ width: `${comparisonResult.sessionBIntensity}%` }}
              />
            </div>
          </div>

          <p className="text-sm text-slate-600">{comparisonResult.insight}</p>
        </div>
      ) : (
        <div className={emptyComparisonClassName}>
          <p className="text-center text-sm font-medium text-slate-400">
            {canCompare
              ? 'Select two sessions and press compare to view the result.'
              : 'Complete at least two sessions to unlock the comparison.'}
          </p>
        </div>
      )}
    </GlassCard>
  );
}
