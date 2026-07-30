import React, { useState, useCallback } from 'react';
import { Key, X, MapPin, RefreshCw, Calendar, ChevronDown, Navigation } from 'lucide-react';
import { PRESET_LOCATIONS } from '../../constants/locations';

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
  const [locationMode, setLocationMode] = useState('none');

  // Detect current location mode from form values when modal opens
  const detectLocationMode = useCallback(() => {
    if (!form.latitud && !form.longitud) return 'none';
    const match = PRESET_LOCATIONS.find(
      loc => loc.lat === String(form.latitud) && loc.lng === String(form.longitud)
    );
    return match ? match.id : 'custom';
  }, [form.latitud, form.longitud]);

  // Sync locationMode with form on first meaningful render
  React.useEffect(() => {
    setLocationMode(detectLocationMode());
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLocationSelect = (value) => {
    setLocationMode(value);
    if (value === 'none') {
      setForm(prev => ({ ...prev, latitud: '', longitud: '' }));
    } else if (value === 'custom' || value === 'gps') {
      if (value === 'gps') {
        onCaptureGps();
      }
      // Keep current values for custom, GPS will fill via onCaptureGps
    } else {
      const preset = PRESET_LOCATIONS.find(loc => loc.id === value);
      if (preset) {
        setForm(prev => ({ ...prev, latitud: preset.lat, longitud: preset.lng }));
      }
    }
  };

  if (!isOpen) return null;

  const isPreset = PRESET_LOCATIONS.some(loc => loc.id === locationMode);
  const showCoordinates = locationMode !== 'none';

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
            <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              Restricción por Ubicación
            </span>

            {/* Location Selector Dropdown */}
            <div className="space-y-1">
              <label className="text-[9px] font-heading font-semibold uppercase text-gray-500">Ubicación Predefinida</label>
              <div className="relative">
                <select
                  value={locationMode}
                  onChange={(e) => handleLocationSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-xs text-gray-900 outline-none transition-all duration-200 appearance-none cursor-pointer pr-8"
                >
                  <option value="none">Sin restricción de ubicación</option>
                  {PRESET_LOCATIONS.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      📍 {loc.name}
                    </option>
                  ))}
                  <option value="gps">📡 Usar mi ubicación actual (GPS)</option>
                  <option value="custom">✏️ Ingresar coordenadas manualmente</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Show selected preset info badge */}
            {isPreset && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg animate-fadeIn">
                <Navigation className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="text-[10px] text-blue-700 font-medium">
                  Coordenadas cargadas: <span className="font-mono font-semibold">{form.latitud}, {form.longitud}</span>
                </span>
              </div>
            )}

            {/* GPS loading indicator */}
            {locationMode === 'gps' && gpsLoading && (
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin shrink-0" />
                <span className="text-[10px] text-amber-700 font-medium">Obteniendo ubicación GPS...</span>
              </div>
            )}

            {/* Manual coordinate inputs - shown for custom, gps, and presets (read-only for presets) */}
            {showCoordinates && (
              <div className="grid grid-cols-2 gap-3 animate-fadeIn">
                <div className="space-y-1">
                  <label className="text-[9px] font-heading font-semibold uppercase text-gray-500">Latitud (GPS)</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={form.latitud}
                    onChange={(e) => {
                      setForm(prev => ({ ...prev, latitud: e.target.value }));
                      if (isPreset) setLocationMode('custom');
                    }}
                    placeholder="Ej: 6.261630"
                    readOnly={isPreset}
                    className={`w-full px-2.5 py-1.5 border rounded-lg text-xs text-gray-900 outline-none font-mono transition-all duration-200 ${
                      isPreset
                        ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-default'
                        : 'bg-white border-gray-300 focus:border-blue-500'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-heading font-semibold uppercase text-gray-500">Longitud (GPS)</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={form.longitud}
                    onChange={(e) => {
                      setForm(prev => ({ ...prev, longitud: e.target.value }));
                      if (isPreset) setLocationMode('custom');
                    }}
                    placeholder="Ej: -75.577697"
                    readOnly={isPreset}
                    className={`w-full px-2.5 py-1.5 border rounded-lg text-xs text-gray-900 outline-none font-mono transition-all duration-200 ${
                      isPreset
                        ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-default'
                        : 'bg-white border-gray-300 focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>
            )}

            <p className="text-[9px] text-gray-500 leading-relaxed">
              {locationMode === 'none'
                ? '* Selecciona una ubicación si quieres restringir la reclamación por distancia.'
                : '* El usuario deberá estar cerca de esta ubicación para reclamar el código.'}
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

          <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="space-y-0.5">
              <span className="text-xs font-heading font-bold text-gray-800">Estado del Código</span>
              <p className="text-[10px] text-gray-500 font-sans">
                El código se encuentra: {' '}
                <span className={`font-semibold ${form.activo ? 'text-emerald-600' : 'text-red-500'}`}>
                  {form.activo ? 'Activo (Habilitado)' : 'Inactivo (Desactivado)'}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, activo: !prev.activo }))}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                form.activo ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  form.activo ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
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
