import React from 'react';
import { Search, Plus, Award, Edit, Trash2 } from 'lucide-react';

export default function RewardsTab({
  rewards,
  loadingRewards,
  rewardSearch,
  setRewardSearch,
  handleOpenCreateReward,
  handleOpenEditReward,
  handleToggleRewardStatus,
  handleDeleteReward
}) {
  const filteredRewards = rewards.filter(r => {
    const q = rewardSearch.toLowerCase();
    return (
      (r.title || '').toLowerCase().includes(q) ||
      (r.id || '').toLowerCase().includes(q) ||
      (r.desc || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            value={rewardSearch}
            onChange={(e) => setRewardSearch(e.target.value)}
            placeholder="Buscar por título, ID o descripción de premio..."
            className="w-full pl-11 pr-5 py-3 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-300 shadow-sm"
          />
        </div>
        <button
          onClick={handleOpenCreateReward}
          className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold font-heading flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 shadow-sm"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Crear Premio</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-heading font-bold tracking-wider text-xs">
                <th className="px-6 py-4.5">Premio</th>
                <th className="px-6 py-4.5">ID / Clave</th>
                <th className="px-6 py-4.5">Costo</th>
                <th className="px-6 py-4.5">Stock</th>
                <th className="px-6 py-4.5">Estado</th>
                <th className="px-6 py-4.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans text-sm text-gray-700">
              {loadingRewards ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500 font-medium animate-pulse">Cargando catálogo de premios...</td>
                </tr>
              ) : filteredRewards.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500 font-medium">No se encontraron premios definidos.</td>
                </tr>
              ) : (
                filteredRewards.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/80 transition-colors duration-150">
                    <td className="px-6 py-4.5">
                      <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-blue-600" />
                        <span>{r.title}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 max-w-sm truncate" title={r.desc}>
                        {r.desc || 'Sin descripción'}
                      </div>
                    </td>
                    <td className="px-6 py-4.5 font-mono font-semibold text-gray-500">{r.id}</td>
                    <td className="px-6 py-4.5 font-bold text-blue-600 font-mono">{r.cost.toLocaleString()} PTS</td>
                    <td className="px-6 py-4.5 font-mono">
                      <span className={r.stock <= 0 ? 'text-red-600 font-bold' : 'text-gray-900'}>
                        {r.stock} u.
                      </span>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border ${
                        r.activo
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-red-50 border-red-200 text-red-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${r.activo ? 'bg-emerald-600' : 'bg-red-600'}`} />
                        <span>{r.activo ? 'Activo' : 'Desactivado'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditReward(r)}
                          className="p-2 rounded-lg bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-900 cursor-pointer transition-colors border border-gray-200 shadow-sm"
                          title="Editar parámetros"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReward(r)}
                          className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 cursor-pointer transition-colors border border-red-200 shadow-sm"
                          title="Eliminar premio"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
