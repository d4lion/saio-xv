import React from 'react';
import { Search, Plus, MapPin, QrCode, Edit, Trash2 } from 'lucide-react';

export default function CodesTab({
  codes,
  loadingCodes,
  codeSearch,
  codeSearchSet,
  handleOpenCreateCode,
  handleOpenEditCode,
  handleToggleCodeStatus,
  handleDeleteCode,
  setPreviewCode,
  setShowQrPreviewModal
}) {
  const filteredCodes = codes.filter(c => {
    const q = codeSearch.toLowerCase();
    return (
      (c.id || '').toLowerCase().includes(q) ||
      String(c.puntos).includes(q)
    );
  });

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            value={codeSearch}
            onChange={(e) => codeSearchSet(e.target.value)}
            placeholder="Buscar por ID de código o valor de puntos..."
            className="w-full pl-11 pr-5 py-3 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-300 shadow-sm"
          />
        </div>
        <button
          onClick={handleOpenCreateCode}
          className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold font-heading flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 shadow-sm"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Crear Código QR</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-heading font-bold tracking-wider text-xs">
                <th className="px-6 py-4.5">ID Código</th>
                <th className="px-6 py-4.5">Puntos</th>
                <th className="px-6 py-4.5">Geolocalización</th>
                <th className="px-6 py-4.5">Rango Vigencia</th>
                <th className="px-6 py-4.5">Estado</th>
                <th className="px-6 py-4.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans text-sm text-gray-700">
              {loadingCodes ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500 font-medium animate-pulse">Cargando códigos de base de datos...</td>
                </tr>
              ) : filteredCodes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500 font-medium">No se encontraron códigos QR.</td>
                </tr>
              ) : (
                filteredCodes.map((c) => {
                  const hasGeo = c.coordenadas && (c.coordenadas.latitud !== undefined || c.coordenadas.latitude !== undefined);
                  const latVal = c.coordenadas ? (c.coordenadas.latitud !== undefined ? c.coordenadas.latitud : c.coordenadas.latitude) : null;
                  const lngVal = c.coordenadas ? (c.coordenadas.longitud !== undefined ? c.coordenadas.longitud : c.coordenadas.longitude) : null;

                  return (
                    <tr key={c.id} className="hover:bg-gray-50/80 transition-colors duration-150">
                      <td className="px-6 py-4.5 font-mono font-bold text-gray-900 tracking-widest uppercase text-[15px]">{c.id}</td>
                      <td className="px-6 py-4.5 font-bold text-blue-600 font-mono">+{c.puntos} PTS</td>
                      <td className="px-6 py-4.5">
                        {hasGeo ? (
                          <div className="flex items-center gap-1.5 text-gray-500 text-xs font-mono">
                            <MapPin className="w-3.5 h-3.5 text-blue-600" />
                            <span>{latVal?.toFixed(4)}, {lngVal?.toFixed(4)}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500 italic">Sin restricción</span>
                        )}
                      </td>
                      <td className="px-6 py-4.5 text-gray-500 leading-relaxed">
                        {c.inicioDelCodigo || c.finDelCodigo ? (
                          <div className="space-y-1 text-xs">
                            {c.inicioDelCodigo && <div>Inicia: {new Date(c.inicioDelCodigo).toLocaleString()}</div>}
                            {c.finDelCodigo && <div>Expira: {new Date(c.finDelCodigo).toLocaleString()}</div>}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500 italic">Siempre activo</span>
                        )}
                      </td>
                      <td className="px-6 py-4.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border ${
                          c.activo
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-red-50 border-red-200 text-red-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${c.activo ? 'bg-emerald-600' : 'bg-red-600'}`} />
                          <span>{c.activo ? 'Activo' : 'Desactivado'}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => { setPreviewCode(c); setShowQrPreviewModal(true); }}
                            className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 cursor-pointer transition-colors border border-blue-200 shadow-sm"
                            title="Proyectar / Descargar QR"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditCode(c)}
                            className="p-2 rounded-lg bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-900 cursor-pointer transition-colors border border-gray-200 shadow-sm"
                            title="Editar parámetros"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCode(c)}
                            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 cursor-pointer transition-colors border border-red-200 shadow-sm"
                            title="Eliminar código"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
