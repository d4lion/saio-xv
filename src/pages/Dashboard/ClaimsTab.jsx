import { useState } from 'react';
import { Search, CheckCircle2, Clock, Check } from 'lucide-react';

export default function ClaimsTab({
  claims,
  loadingClaims,
  claimSearch,
  setClaimSearch,
  handleDeliverClaim
}) {
  const [deliveringId, setDeliveringId] = useState(null);

  // Filter claims based on search input
  const filteredClaims = claims.filter(c => {
    const searchLower = claimSearch.toLowerCase();
    return (
      c.id.toLowerCase().includes(searchLower) ||
      (c.nombre && c.nombre.toLowerCase().includes(searchLower)) ||
      (c.correo && c.correo.toLowerCase().includes(searchLower)) ||
      (c.premio && c.premio.toLowerCase().includes(searchLower)) ||
      (c.cedula && c.cedula.toLowerCase().includes(searchLower)) ||
      (c.telefono && c.telefono.toLowerCase().includes(searchLower))
    );
  });

  const onDeliver = async (claimId) => {
    try {
      setDeliveringId(claimId);
      await handleDeliverClaim(claimId);
    } finally {
      setDeliveringId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 animate-fade-in">
      {/* Controls */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por ID, asistente, cédula, teléfono o premio..."
            value={claimSearch}
            onChange={(e) => setClaimSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-gray-50 hover:bg-gray-100/50 focus:bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <div className="text-[11px] text-gray-500 font-medium">
          Mostrando {filteredClaims.length} de {claims.length} canjes registrados
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-200 text-gray-500 font-heading text-[10px] font-bold uppercase tracking-wider">
                <th className="px-6 py-4">ID de Canje</th>
                <th className="px-6 py-4">Premio Canjeado</th>
                <th className="px-6 py-4">Asistente / Beneficiario</th>
                <th className="px-6 py-4">Fecha de Solicitud</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {loadingClaims ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    Cargando historial de canjes...
                  </td>
                </tr>
              ) : filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                    No se encontraron tickets de canje registrados.
                  </td>
                </tr>
              ) : (
                filteredClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Unique Claim ID */}
                    <td className="px-6 py-4 font-mono font-bold text-gray-900 uppercase">
                      {claim.id}
                    </td>

                    {/* Reward Title & Cost */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{claim.premio}</div>
                      <div className="text-[10px] text-blue-600 font-mono font-semibold mt-0.5">
                        {claim.costo?.toLocaleString()} PTS
                      </div>
                    </td>

                    {/* Assistant Profile Data */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="font-semibold text-gray-900">{claim.nombre}</div>
                        <div className="text-[10px] text-gray-500 font-mono">UID: {claim.uid}</div>
                        <div className="text-[11px] text-gray-500">{claim.correo}</div>
                        <div className="text-[11px] text-gray-600 font-medium bg-gray-100 rounded px-1.5 py-0.5 inline-block mt-1">
                          Cédula: {claim.cedula} | Tel: {claim.telefono}
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(claim.fecha).toLocaleString()}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      {claim.estado === 'pendiente' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pendiente</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Entregado</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      {claim.estado === 'pendiente' ? (
                        <button
                          onClick={() => onDeliver(claim.id)}
                          disabled={deliveringId === claim.id}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all duration-200 cursor-pointer text-[11px] ml-auto"
                        >
                          {deliveringId === claim.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Entregar</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-400 font-medium italic block pr-2">
                          Entregado
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
