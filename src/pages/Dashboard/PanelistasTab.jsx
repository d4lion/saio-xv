import React from 'react';
import { Search, Plus, Sparkles, Edit, Trash2, Mic } from 'lucide-react';

export default function PanelistasTab({
  panelistas,
  loadingPanelistas,
  panelistaSearch,
  setPanelistaSearch,
  handleOpenCreatePanelista,
  handleOpenEditPanelista,
  handleDeletePanelista
}) {
  const filteredPanelistas = panelistas.filter(p => {
    const q = panelistaSearch.toLowerCase();
    const topicsStr = Array.isArray(p.topics) ? p.topics.join(' ') : (p.topics || '');
    return (
      (p.name || '').toLowerCase().includes(q) ||
      (p.role || '').toLowerCase().includes(q) ||
      (p.company || '').toLowerCase().includes(q) ||
      (p.bio || '').toLowerCase().includes(q) ||
      topicsStr.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Search bar & Create button */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            value={panelistaSearch}
            onChange={(e) => setPanelistaSearch(e.target.value)}
            placeholder="Buscar por nombre, cargo, empresa o temas..."
            className="w-full pl-11 pr-5 py-3 bg-white border border-gray-300 hover:border-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-300 shadow-sm"
          />
        </div>
        <button
          onClick={handleOpenCreatePanelista}
          className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold font-heading flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 shadow-sm"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Registrar Panelista</span>
        </button>
      </div>

      {/* Panelists Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-heading font-bold tracking-wider text-xs">
                <th className="px-6 py-4.5">Ponente</th>
                <th className="px-6 py-4.5">Cargo / Empresa</th>
                <th className="px-6 py-4.5">Especialidades (Topics)</th>
                <th className="px-6 py-4.5">Destacado</th>
                <th className="px-6 py-4.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans text-sm text-gray-700">
              {loadingPanelistas ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500 font-medium animate-pulse">
                    Cargando catálogo de panelistas...
                  </td>
                </tr>
              ) : filteredPanelistas.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500 font-medium">
                    No se encontraron panelistas registrados.
                  </td>
                </tr>
              ) : (
                filteredPanelistas.map((p) => {
                  const topicsList = Array.isArray(p.topics) ? p.topics : [];
                  const colorHex = p.color || '#9c3aed';

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition-colors duration-150">
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3">
                          {p.photo ? (
                            <img
                              src={p.photo}
                              alt={p.name}
                              className="w-10 h-10 rounded-full object-cover border-2 shadow-sm flex-shrink-0"
                              style={{ borderColor: colorHex }}
                            />
                          ) : (
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-xs font-heading flex-shrink-0 shadow-sm"
                              style={{ backgroundColor: colorHex }}
                            >
                              {p.initials || 'PN'}
                            </div>
                          )}

                          <div>
                            <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                              <span>{p.name}</span>
                            </div>
                            <div className="text-xs text-gray-500 max-w-xs truncate" title={p.bio}>
                              {p.bio || 'Sin biografía'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4.5">
                        <div className="font-medium text-gray-900">{p.role}</div>
                        <div className="text-xs font-semibold text-purple-600">{p.company}</div>
                      </td>

                      <td className="px-6 py-4.5">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {topicsList.length > 0 ? (
                            topicsList.map((t, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide uppercase border"
                                style={{
                                  backgroundColor: `${colorHex}15`,
                                  borderColor: `${colorHex}40`,
                                  color: colorHex
                                }}
                              >
                                {t}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">Sin temas</span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4.5">
                        {p.isFeatured ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 border border-amber-200 text-amber-700">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>Keynote</span>
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">Estándar</span>
                        )}
                      </td>

                      <td className="px-6 py-4.5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditPanelista(p)}
                            className="p-2 rounded-lg bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-900 cursor-pointer transition-colors border border-gray-200 shadow-sm"
                            title="Editar panelista"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePanelista(p)}
                            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 cursor-pointer transition-colors border border-red-200 shadow-sm"
                            title="Eliminar panelista"
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
