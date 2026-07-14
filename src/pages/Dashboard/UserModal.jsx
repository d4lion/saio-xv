import React from 'react';
import { User, X } from 'lucide-react';
import { ROLES } from '../../constants/roles';

export default function UserModal({
  isOpen,
  onClose,
  mode,
  form,
  setForm,
  onSave,
  selectedUserUid
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xl relative text-gray-900">
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-gray-150 p-5 bg-gray-50">
          <h3 className="font-heading font-extrabold text-md text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <span>{mode === 'create' ? 'Crear Nuevo Usuario' : 'Editar Perfil de Usuario'}</span>
          </h3>
        </div>

        <form onSubmit={onSave} className="p-5 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-500">Nombre Completo</label>
            <input
              type="text"
              required
              value={form.nombre}
              onChange={(e) => setForm(prev => ({ ...prev, nombre: e.target.value }))}
              placeholder="Ej: Juan Pérez"
              className="w-full px-3 py-2 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-xs text-gray-900 outline-none transition-all duration-300"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-500">Correo Electrónico</label>
            <input
              type="email"
              required
              disabled={mode === 'edit'}
              value={form.correo}
              onChange={(e) => setForm(prev => ({ ...prev, correo: e.target.value }))}
              placeholder="ejemplo@saio.com"
              className="w-full px-3 py-2 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-xs text-gray-900 outline-none transition-all duration-300 disabled:opacity-55"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-500">Cédula</label>
              <input
                type="text"
                required
                value={form.cedula}
                onChange={(e) => setForm(prev => ({ ...prev, cedula: e.target.value }))}
                placeholder="Documento"
                className="w-full px-3 py-2 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-xs text-gray-900 outline-none transition-all duration-300"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-500">Rol asignado</label>
              <select
                value={form.rol}
                onChange={(e) => setForm(prev => ({ ...prev, rol: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-xs text-gray-900 outline-none transition-all duration-300 cursor-pointer"
              >
                <option value={ROLES.ASISTENTE}>Asistente</option>
                <option value={ROLES.COORDINADOR}>Coordinador</option>
                <option value={ROLES.ADMIN}>Admin</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {mode === 'create' ? (
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-500">Contraseña (Mínimo 6 char)</label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-xs text-gray-900 outline-none transition-all duration-300"
                />
              </div>
            ) : (
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-500">Puntos de Saldo (Mínimo 0)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={form.puntos}
                  onChange={(e) => setForm(prev => ({ ...prev, puntos: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-xs text-gray-900 outline-none transition-all duration-300 font-mono"
                />
              </div>
            )}
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
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-heading text-xs font-semibold cursor-pointer transition-all duration-200 shadow-sm"
            >
              {mode === 'create' ? 'Crear' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
