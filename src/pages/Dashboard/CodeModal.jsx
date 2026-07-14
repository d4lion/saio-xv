import React from 'react';
import { Key, X, MapPin, RefreshCw, Calendar } from 'lucide-react';

export default function CodeModal({
  isOpen,
  onClose,
  mode,
  form,
  setForm,
  onSave,
  onCaptureGps,
  gpsLoading
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xl relative text-gray-900">
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-gray-150 p-5 bg-gray-50">
          <h3 className="font-heading font-extrabold text-md text-gray-900 flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-600" />
            <span>{mode === 'create' ? 'Crear Nuevo Código QR' : 'Editar Código QR'}</span>
          </h3>
        </div>

        <form onSubmit={onSave} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-500">Código (ID)</label>
              <input
                type="text"
                required
                disabled={mode === 'edit'}
                value={form.id}
                onChange={(e) => setForm(prev => ({ ...prev, id: e.target.value }))}
                placeholder="Ej: STAND_VIP"
                className="w-full px-3 py-2 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-xs text-gray-900 outline-none transition-all duration-300 font-mono tracking-wider uppercase disabled:opacity-55"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-500">Puntos de Valor (Mínimo 0)</label>
              <input
                type="number"
                required
                min="0"
                value={form.puntos}
                onChange={(e) => setForm(prev => ({ ...prev, puntos: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-xs text-gray-900 outline-none transition-all duration-300 font-mono"
              />
            </div>
          </div>

          {/* Geolocation Section */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                Restricción por Ubicación
              </span>
              <button
                type="button"
                onClick={onCaptureGps}
                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-semibold flex items-center gap-1.5 cursor-pointer transition-all duration-200"
                disabled={gpsLoading}
              >
                <RefreshCw className={`w-3 h-3 ${gpsLoading ? 'animate-spin' : ''}`} />
                <span>Usar Ubicación Actual</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-heading font-semibold uppercase text-gray-500">Latitud (GPS)</label>
                <input
                  type="number"
                  step="0.000001"
                  value={form.latitud}
                  onChange={(e) => setForm(prev => ({ ...prev, latitud: e.target.value }))}
                  placeholder="Ej: 4.609710"
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-300 focus:border-blue-500 rounded-lg text-xs text-gray-900 outline-none font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-heading font-semibold uppercase text-gray-500">Longitud (GPS)</label>
                <input
                  type="number"
                  step="0.000001"
                  value={form.longitud}
                  onChange={(e) => setForm(prev => ({ ...prev, longitud: e.target.value }))}
                  placeholder="Ej: -74.081750"
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-300 focus:border-blue-500 rounded-lg text-xs text-gray-900 outline-none font-mono"
                />
              </div>
            </div>
            <p className="text-[9px] text-gray-500 leading-relaxed">
              * Deja estos campos vacíos si no quieres restringir la reclamación por distancia.
            </p>
          </div>

          {/* Time Restriction Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                Fecha Inicio
              </label>
              <input
                type="datetime-local"
                value={form.inicioDelCodigo}
                onChange={(e) => setForm(prev => ({ ...prev, inicioDelCodigo: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 rounded-xl text-xs text-gray-900 outline-none font-sans cursor-pointer"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                Fecha Expiración
              </label>
              <input
                type="datetime-local"
                value={form.finDelCodigo}
                onChange={(e) => setForm(prev => ({ ...prev, finDelCodigo: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 rounded-xl text-xs text-gray-900 outline-none font-sans cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="code_activo"
              checked={form.activo}
              onChange={(e) => setForm(prev => ({ ...prev, activo: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="code_activo" className="text-xs font-heading font-semibold text-gray-700 cursor-pointer select-none">
              Código Habilitado Inmediatamente
            </label>
          </div>

          <div className="border-t border-gray-150 pt-4 mt-6 flex justify-end gap-2 bg-gray-50 -mx-5 -mb-5 p-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 font-heading text-xs font-semibold cursor-pointer transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-heading text-xs font-semibold cursor-pointer transition-all duration-200"
            >
              {mode === 'create' ? 'Crear' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
