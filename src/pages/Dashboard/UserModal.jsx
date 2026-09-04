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
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-500">Puntos Totales (Ajuste Rápido)</label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="number"
                    required
                    min="0"
                    readOnly
                    value={form.puntos}
                    className="w-full sm:w-1/3 px-3 py-2 bg-gray-100 border border-gray-300 rounded-xl text-md font-bold text-gray-900 outline-none font-mono text-center cursor-not-allowed"
                  />
                  <div className="flex items-center justify-between sm:justify-start gap-1 w-full flex-wrap">
                    <button type="button" onClick={() => setForm(prev => ({ ...prev, puntos: Math.max(0, prev.puntos - 100) }))} className="px-2 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 text-[10px] font-bold hover:bg-red-100 cursor-pointer transition-colors">-100</button>
                    <button type="button" onClick={() => setForm(prev => ({ ...prev, puntos: Math.max(0, prev.puntos - 10) }))} className="px-2 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 text-[10px] font-bold hover:bg-red-100 cursor-pointer transition-colors">-10</button>
                    <button type="button" onClick={() => setForm(prev => ({ ...prev, puntos: Math.max(0, prev.puntos - 1) }))} className="px-2 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 text-[10px] font-bold hover:bg-red-100 cursor-pointer transition-colors">-1</button>
                    <button type="button" onClick={() => setForm(prev => ({ ...prev, puntos: prev.puntos + 1 }))} className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg border border-green-200 bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100 cursor-pointer transition-colors text-center">+1</button>
                    <button type="button" onClick={() => setForm(prev => ({ ...prev, puntos: prev.puntos + 10 }))} className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg border border-green-200 bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100 cursor-pointer transition-colors text-center">+10</button>
                    <button type="button" onClick={() => setForm(prev => ({ ...prev, puntos: prev.puntos + 50 }))} className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg border border-green-200 bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100 cursor-pointer transition-colors text-center">+50</button>
                    <button type="button" onClick={() => setForm(prev => ({ ...prev, puntos: prev.puntos + 100 }))} className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg border border-green-200 bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100 cursor-pointer transition-colors text-center">+100</button>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 font-medium">Usa los botones para calcular rápidamente y generar una transacción automática al guardar.</p>
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
