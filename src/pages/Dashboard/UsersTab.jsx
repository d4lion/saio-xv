import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Edit, Trash2, Eye } from 'lucide-react';
import { ROLES } from '../../constants/roles';
import Pagination from '../../components/Pagination';

export default function UsersTab({
  users,
  loadingUsers,
  userSearch,
  setUserSearch,
  handleOpenCreateUser,
  handleOpenEditUser,
  handleOpenUserTraceability,
  handleToggleUserStatus,
  handleDeleteUser
}) {
  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase();
    return (
      (u.nombre || '').toLowerCase().includes(q) ||
      (u.correo || '').toLowerCase().includes(q) ||
      (u.cedula || '').toLowerCase().includes(q) ||
      (u.rol || '').toLowerCase().includes(q)
    );
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [userSearch]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Buscar por nombre, correo, cédula o rol..."
            className="w-full pl-11 pr-5 py-3 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-300 shadow-sm"
          />
        </div>
        <button
          onClick={handleOpenCreateUser}
          className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold font-heading flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 shadow-sm"
        >
          <UserPlus className="w-4.5 h-4.5" />
          <span>Agregar Usuario</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-heading font-bold tracking-wider text-xs">
                <th className="px-6 py-4.5">Usuario</th>
                <th className="px-6 py-4.5">Cédula</th>
                <th className="px-6 py-4.5">Rol</th>
                <th className="px-6 py-4.5">Puntos</th>
                <th className="px-6 py-4.5">Estado</th>
                <th className="px-6 py-4.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans text-sm text-gray-700">
              {loadingUsers ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500 font-medium animate-pulse">Cargando perfiles de usuario...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500 font-medium">No se encontraron usuarios.</td>
                </tr>
              ) : (
                paginatedUsers.map((u) => (
                  <tr key={u.correo} className="hover:bg-gray-50/80 transition-colors duration-150">
                    <td className="px-6 py-4.5">
                      <div className="font-semibold text-gray-900">{u.nombre || 'Sin nombre'}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{u.correo}</div>
                    </td>
                    <td className="px-6 py-4.5 text-gray-500 font-mono text-[13px]">{u.cedula || 'N/A'}</td>
                    <td className="px-6 py-4.5">
                      <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                        u.rol === ROLES.ADMIN ? 'bg-red-50 text-red-700 border border-red-200' :
                        u.rol === ROLES.COORDINADOR ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {u.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 font-bold text-blue-600 font-mono">{u.puntos || 0} PTS</td>
                    <td className="px-6 py-4.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border ${
                        u.activo !== false
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-red-50 border-red-200 text-red-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.activo !== false ? 'bg-emerald-600' : 'bg-red-600'}`} />
                        <span>{u.activo !== false ? 'Activo' : 'Suspendido'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenUserTraceability(u)}
                          className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 cursor-pointer transition-colors border border-blue-200 shadow-sm"
                          title="Ver Trazabilidad"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditUser(u)}
                          className="p-2 rounded-lg bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-900 cursor-pointer transition-colors border border-gray-200 shadow-sm"
                          title="Editar perfil"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 cursor-pointer transition-colors border border-red-200 shadow-sm"
                          title="Eliminar perfil"
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
        {totalPages > 1 && (
          <div className="px-6 py-2">
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
              theme="light" 
            />
          </div>
        )}
      </div>
    </div>
  );
}
