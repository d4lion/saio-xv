import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange, theme = 'light' }) {
  if (totalPages <= 1) return null;

  const isDark = theme === 'dark';

  const textClass = isDark ? 'text-gray-300' : 'text-gray-700';
  const borderClass = isDark ? 'border-white/10' : 'border-gray-100';
  const btnClass = isDark 
    ? 'bg-white/5 hover:bg-white/10 text-white ring-1 ring-inset ring-white/10' 
    : 'bg-white hover:bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-200';
  const currentClass = isDark
    ? 'bg-purple-600/20 text-purple-200 ring-1 ring-inset ring-purple-500/50'
    : 'bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-500/30';

  return (
    <div className={`flex items-center justify-between border-t ${borderClass} pt-4 mt-4 w-full`}>
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center rounded-xl px-4 py-2 text-xs font-bold font-heading uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${btnClass}`}
        >
          Anterior
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`relative ml-3 inline-flex items-center rounded-xl px-4 py-2 text-xs font-bold font-heading uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${btnClass}`}
        >
          Siguiente
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between w-full">
        <div>
          <p className={`text-xs font-mono uppercase tracking-widest ${textClass}`}>
            Página <span className="font-bold">{currentPage}</span> de <span className="font-bold">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-xl shadow-sm overflow-hidden" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-3 py-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${btnClass}`}
            >
              <span className="sr-only">Anterior</span>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className={`relative inline-flex items-center px-4 py-2 text-xs font-bold font-mono z-10 ${currentClass}`}>
              {currentPage}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-3 py-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${btnClass}`}
            >
              <span className="sr-only">Siguiente</span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
