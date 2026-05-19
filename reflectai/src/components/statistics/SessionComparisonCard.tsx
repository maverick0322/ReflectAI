'use client';

import { useEffect, useMemo, useState } from 'react';

import GlassCard from '@/components/ui/GlassCard';
import type {
  StatisticsComparisonSelection,
  StatisticsSessionOption,
} from '@/types/statistics';

interface SessionComparisonCardProps {
  sessionOptions: StatisticsSessionOption[];
  defaultSelection: StatisticsComparisonSelection;
}

export function SessionComparisonCard({
  sessionOptions,
  defaultSelection,
}: Readonly<SessionComparisonCardProps>) {
  const [selection, setSelection] = useState(defaultSelection);
  const [isComparing, setIsComparing] = useState(false);
  const selectedSessions = useMemo(() => {
    const sessionA = sessionOptions.find((option) => option.id === selection.sessionA);
    const sessionB = sessionOptions.find((option) => option.id === selection.sessionB);
    return { sessionA, sessionB };
  }, [selection, sessionOptions]);

  useEffect(() => {
    setSelection(defaultSelection);
    setIsComparing(false);
  }, [defaultSelection]);

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
    setIsComparing(true);
  };

  const canCompare = sessionOptions.length >= 2;
  const comparisonInsight = buildComparisonInsight(
    selectedSessions.sessionA,
    selectedSessions.sessionB,
  );

  return (
    <GlassCard className="p-5 gap-5 bg-white/25 shadow-xl shadow-violet-200/20">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-slate-900">Comparar sesiones</h2>
        <p className="text-sm text-slate-500">
          Contrasta la intensidad emocional entre dos sesiones completadas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
          <span>Sesion A</span> 
          <select
            aria-label="Sesion A"
            className="rounded-2xl border border-white/60 bg-white/60 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:ring-2 focus:ring-violet-300"
            value={selection.sessionA}
            onChange={(event) => handleSelectionChange('sessionA', event.target.value)}
          >
            {sessionOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
          <span>Sesion B</span>
          <select
            aria-label="Sesion B"
            className="rounded-2xl border border-white/60 bg-white/60 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:ring-2 focus:ring-violet-300"
            value={selection.sessionB}
            onChange={(event) => handleSelectionChange('sessionB', event.target.value)}
          >
            {sessionOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="button"
        className="rounded-2xl border border-violet-200 bg-violet-500/10 px-4 py-3 text-sm font-semibold text-violet-700 transition hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={handleCompare}
        disabled={!canCompare}
      >
        Ver comparacion
      </button>

      {isComparing && selectedSessions.sessionA && selectedSessions.sessionB ? (
        <div className="space-y-4 rounded-2xl border border-white/60 bg-white/45 p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4 text-xs font-semibold text-slate-600">
              <span>{selectedSessions.sessionA.label}</span>
              <span>{selectedSessions.sessionA.intensity}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/70">
              <div
                className="h-2.5 rounded-full bg-violet-400"
                style={{ width: `${selectedSessions.sessionA.intensity}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4 text-xs font-semibold text-slate-600">
              <span>{selectedSessions.sessionB.label}</span>
              <span>{selectedSessions.sessionB.intensity}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/70">
              <div
                className="h-2.5 rounded-full bg-indigo-300"
                style={{ width: `${selectedSessions.sessionB.intensity}%` }}
              />
            </div>
          </div>

          <p className="text-sm text-slate-600">{comparisonInsight}</p>
        </div>
      ) : (
        <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-white/60 bg-white/20 px-4">
          <p className="text-center text-sm font-medium text-slate-400">
            {canCompare
              ? 'Selecciona dos sesiones y presiona comparar para ver el contraste.'
              : 'Completa al menos dos sesiones para comparar resultados.'}
          </p>
        </div>
      )}
    </GlassCard>
  );
}

function buildComparisonInsight(
  sessionA: StatisticsSessionOption | undefined,
  sessionB: StatisticsSessionOption | undefined,
) {
  if (!sessionA || !sessionB) {
    return 'Selecciona dos sesiones para comparar sus resultados.';
  }

  if (sessionA.id === sessionB.id) {
    return 'Seleccionaste la misma sesion en ambos campos.';
  }

  const difference = Math.abs(sessionA.intensity - sessionB.intensity);
  if (difference === 0) {
    return 'Ambas sesiones registran la misma intensidad emocional.';
  }

  const higherSession = sessionA.intensity > sessionB.intensity ? sessionA : sessionB;
  return `${higherSession.label} muestra ${difference}% mas intensidad emocional, con ${higherSession.emotion} como emocion principal.`;
}
