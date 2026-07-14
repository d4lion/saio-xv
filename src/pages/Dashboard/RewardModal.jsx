import React from 'react';
import { Gift, X } from 'lucide-react';

export default function RewardModal({
  isOpen,
  onClose,
  mode,
  form,
  setForm,
  onSave
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
            <Gift className="w-5 h-5 text-blue-600" />
            <span>{mode === 'create' ? 'Crear Nuevo Premio' : 'Editar Premio'}</span>
          </h3>
        </div>

        <form onSubmit={onSave} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-500">ID / Clave única</label>
              <input
                type="text"
                required
                disabled={mode === 'edit'}
                value={form.id}
                onChange={(e) => setForm(prev => ({ ...prev, id: e.target.value }))}
                placeholder="Ej: vaso_termico"
                className="w-full px-3 py-2 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-xs text-gray-900 outline-none transition-all duration-300 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-500">Nombre de Premio</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ej: Mug SAIO-XV"
                className="w-full px-3 py-2 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-xs text-gray-900 outline-none transition-all duration-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-500">Costo en Puntos (Mínimo 0)</label>
              <input
                type="number"
                required
                min="0"
                value={form.cost}
                onChange={(e) => setForm(prev => ({ ...prev, cost: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-xs text-gray-900 outline-none transition-all duration-300 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-500">Stock Disponible (Mínimo 0)</label>
              <input
                type="number"
                required
                min="0"
                value={form.stock}
                onChange={(e) => setForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-xs text-gray-900 outline-none transition-all duration-300 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-500">Descripción</label>
            <textarea
              value={form.desc}
              onChange={(e) => setForm(prev => ({ ...prev, desc: e.target.value }))}
              placeholder="Detalles sobre el premio y cómo se reclama..."
              rows="3"
              className="w-full px-3 py-2 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 rounded-xl text-xs text-gray-900 outline-none transition-all duration-300 resize-none font-sans"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="reward_activo"
              checked={form.activo}
              onChange={(e) => setForm(prev => ({ ...prev, activo: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="reward_activo" className="text-xs font-heading font-semibold text-gray-700 cursor-pointer select-none">
              Premio Activo (Habilitado para Canje)
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
