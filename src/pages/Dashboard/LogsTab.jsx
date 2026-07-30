import React from 'react';
import { Search } from 'lucide-react';

export default function LogsTab({
  logs,
  loadingLogs,
  logSearch,
  setLogSearch,
  logTypeFilter,
  setLogTypeFilter
}) {
  const filteredLogs = logs.filter(l => {
    const q = logSearch.toLowerCase();
    const matchesQuery = (
      (l.code || '').toLowerCase().includes(q) ||
      (l.uid || '').toLowerCase().includes(q) ||
      (l.premioCanjeado || '').toLowerCase().includes(q) ||
      (l.id || '').toLowerCase().includes(q)
    );

    if (!matchesQuery) return false;
    if (logTypeFilter === 'all') return true;
    const isRedemption = (l.code || '').startsWith('CANJE_') || l.puntos < 0;
    if (logTypeFilter === 'redeem') return isRedemption;
    if (logTypeFilter === 'claim') return !isRedemption;

    return true;
  });

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            value={logSearch}
            onChange={(e) => setLogSearch(e.target.value)}
            placeholder="Buscar por código, ID de transacción, UID de usuario..."
            className="w-full pl-11 pr-5 py-3 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-300 shadow-sm"
          />
        </div>

        <div className="flex gap-2">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'claim', label: 'Reclamaciones (QR)' },
            { id: 'redeem', label: 'Canjes (Premios)' }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setLogTypeFilter(filter.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all duration-200 cursor-pointer ${
                logTypeFilter === filter.id
                  ? 'bg-[#e8f0fe] border-blue-300 text-blue-700 shadow-sm'
                  : 'bg-white border-gray-300 text-gray-600 hover:text-gray-800'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-heading font-bold tracking-wider text-xs">
                <th className="px-6 py-4.5">Fecha y Hora</th>
                <th className="px-6 py-4.5">UID Usuario</th>
                <th className="px-6 py-4.5">Código / Acción</th>
                <th className="px-6 py-4.5">Puntos</th>
                <th className="px-6 py-4.5">Ubicación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans text-sm text-gray-700">
              {loadingLogs ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500 font-medium animate-pulse">Cargando logs de auditoría...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500 font-medium">No se encontraron registros de transacciones.</td>
                </tr>
              ) : (
                filteredLogs.map((l) => {
                  const isClaim = l.puntos > 0;
                  const hasGeo = l.coordenadas && (l.coordenadas.latitud !== undefined || l.coordenadas.latitude !== undefined);
                  const latVal = l.coordenadas ? (l.coordenadas.latitud !== undefined ? l.coordenadas.latitud : l.coordenadas.latitude) : null;
                  const lngVal = l.coordenadas ? (l.coordenadas.longitud !== undefined ? l.coordenadas.longitud : l.coordenadas.longitude) : null;

                  return (
                    <tr key={l.id} className="hover:bg-gray-50/80 transition-colors duration-150">
                      <td className="px-6 py-4.5 text-gray-500 font-mono text-xs">
                        {new Date(l.fecha || l.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4.5 text-gray-500 font-mono text-xs truncate max-w-[130px]" title={l.uid}>
                        {l.uid}
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="font-bold text-gray-900 font-mono">{l.code}</div>
                        {l.premioCanjeado && (
                          <div className="text-xs text-blue-600 mt-0.5">{l.premioCanjeado}</div>
                        )}
                      </td>
                      <td className="px-6 py-4.5">
                        <span className={`font-bold font-mono text-[14px] ${isClaim ? 'text-emerald-600' : 'text-red-600'}`}>
                          {isClaim ? `+${l.puntos}` : l.puntos} PTS
                        </span>
                      </td>
                      <td className="px-6 py-4.5">
                        {hasGeo ? (
                          <span className="text-xs font-mono text-gray-500">
                            📍 {latVal?.toFixed(4)}, {lngVal?.toFixed(4)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Sin coordenadas</span>
                        )}
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
