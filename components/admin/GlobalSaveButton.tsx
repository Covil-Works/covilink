'use client';

import React from 'react';
import { Save, RefreshCw, Check } from 'lucide-react';

interface GlobalSaveButtonProps {
  hasUnsavedChanges: boolean;
  onSave: () => void;
  isSaving: boolean;
  saveSuccess: boolean;
}

export default function GlobalSaveButton({
  hasUnsavedChanges,
  onSave,
  isSaving,
  saveSuccess,
}: GlobalSaveButtonProps) {
  return (
    <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 pointer-events-auto">
      <button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        aria-label="Salvar alterações"
        title={hasUnsavedChanges ? 'Salvar alterações pendentes' : 'Nenhuma alteração pendente'}
        className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-2xl ${
          saveSuccess
            ? 'bg-emerald-500 text-white shadow-emerald-500/30 scale-105'
            : hasUnsavedChanges
            ? 'bg-white text-dark-900 hover:bg-gray-100 hover:scale-105 active:scale-95 shadow-xl ring-2 ring-white/20'
            : 'bg-[#0e1017]/90 backdrop-blur-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/25 hover:bg-[#13151f]'
        }`}
      >
        {/* Pending unsaved changes dot */}
        {hasUnsavedChanges && !saveSuccess && !isSaving && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-pink opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-pink border-2 border-[#08090d]"></span>
          </span>
        )}

        {isSaving ? (
          <RefreshCw className="w-5 h-5 animate-spin text-dark-900" />
        ) : saveSuccess ? (
          <Check className="w-5 h-5 stroke-[2.5]" />
        ) : (
          <Save
            className={`w-5 h-5 transition-colors ${
              hasUnsavedChanges ? 'text-dark-900' : 'text-gray-400 group-hover:text-white'
            }`}
          />
        )}
      </button>
    </div>
  );
}
