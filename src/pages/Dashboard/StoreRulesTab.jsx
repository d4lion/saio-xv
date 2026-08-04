import React, { useState } from 'react';
import { ShoppingBag, Plus, Edit2, Trash2, CheckCircle, XCircle, Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

const themedSwal = Swal.mixin({
  background: '#ffffff',
  color: '#111827',
  confirmButtonColor: '#9c3aed',
  cancelButtonColor: '#6b7280',
  customClass: {
    popup: 'rounded-2xl shadow-2xl border border-gray-200 p-6',
    title: 'font-heading font-bold text-gray-900 text-lg',
    htmlContainer: 'text-gray-600 font-sans text-xs leading-relaxed',
    confirmButton: 'rounded-xl font-heading px-5 py-2.5 font-bold uppercase tracking-wider text-xs cursor-pointer bg-purple-600 text-white hover:bg-purple-700 transition-colors outline-none ring-0 mx-1',
    cancelButton: 'rounded-xl font-heading px-5 py-2.5 font-bold uppercase tracking-wider text-xs cursor-pointer bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors outline-none ring-0 mx-1'
  }
});

export default function StoreRulesTab({
  rules,
  loadingRules,
  onSaveRule,
  onDeleteRule,
  onRefresh
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [form, setForm] = useState({
    nombre: '',
    montoMinimo: '',
    montoMaximo: '',
    puntos: '',
    activo: true
  });

  const filteredRules = rules.filter(r => 
    (r.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(r.montoMinimo || '').includes(searchTerm) ||
    String(r.montoMaximo || '').includes(searchTerm)
  );

  const handleOpenCreate = () => {
    setEditingRule(null);
    setForm({
      nombre: '',
      montoMinimo: '',
      montoMaximo: '',
      puntos: '',
      activo: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rule) => {
    setEditingRule(rule);
    setForm({
      nombre: rule.nombre || '',
      montoMinimo: rule.montoMinimo || 0,
      montoMaximo: rule.montoMaximo || 0,
      puntos: rule.puntos || 0,
      activo: rule.activo !== undefined ? rule.activo : true
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      toast.error('Nombre de regla requerido.');
      return;
    }

    const min = Number(form.montoMinimo);
    const max = Number(form.montoMaximo);
    const pts = Number(form.puntos);

    if (isNaN(min) || min < 0) {
      toast.error('El monto mínimo debe ser mayor o igual a 0.');
      return;
    }
    if (isNaN(max) || max < min) {
      toast.error('El monto máximo debe ser mayor al monto mínimo.');
      return;
    }
    if (isNaN(pts) || pts <= 0) {
      toast.error('Los puntos otorgados deben ser mayores a 0.');
      return;
    }

    try {
      toast.loading('Guardando regla de puntos...', { id: 'save-rule' });
      await onSaveRule({
        id: editingRule ? editingRule.id : undefined,
        ...form
      });
      toast.success('Regla guardada con éxito.', { id: 'save-rule' });
      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error(`Error al guardar la regla: ${err.message}`, { id: 'save-rule' });
    }
  };

  const handleDelete = async (rule) => {
    const confirm = await themedSwal.fire({
      title: '¿Eliminar Regla de Puntos?',
      text: `¿Estás seguro de eliminar la regla "${rule.nombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, Eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirm.isConfirmed) return;

    try {
      toast.loading('Eliminando regla...', { id: 'del-rule' });
      await onDeleteRule(rule.id);
      toast.success('Regla eliminada.', { id: 'del-rule' });
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error(`Error: ${err.message}`, { id: 'del-rule' });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar reglas por nombre o montos..."
            className="w-full pl-11 pr-5 py-3 bg-white border border-gray-300 hover:border-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-300 shadow-sm"
          />
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-heading text-xs font-bold uppercase tracking-wider cursor-pointer transition-all duration-200 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Regla de Puntos</span>
        </button>
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-heading font-bold tracking-wider text-xs">
                <th className="px-6 py-4.5">Nombre de la Regla</th>
                <th className="px-6 py-4.5">Rango de Compra (COP)</th>
                <th className="px-6 py-4.5">Puntos Otorgados</th>
                <th className="px-6 py-4.5">Estado</th>
                <th className="px-6 py-4.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans text-sm text-gray-700">
              {loadingRules ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500 font-medium animate-pulse">
                    Cargando reglas de tiendas...
                  </td>
                </tr>
              ) : filteredRules.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500 font-medium">
                    No hay reglas de puntos por compra registradas.
                  </td>
                </tr>
              ) : (
                filteredRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50/80 transition-colors duration-150">
                    <td className="px-6 py-4.5 font-semibold text-gray-900 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>{rule.nombre}</span>
                    </td>
                    <td className="px-6 py-4.5 font-mono text-xs font-medium text-gray-700">
                      ${Number(rule.montoMinimo).toLocaleString()} - ${Number(rule.montoMaximo).toLocaleString()} COP
                    </td>
                    <td className="px-6 py-4.5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        <span>+{Number(rule.puntos).toLocaleString()} PTS</span>
                      </span>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        rule.activo 
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' 
                          : 'bg-gray-100 border border-gray-300 text-gray-500'
                      }`}>
                        {rule.activo ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Activa</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-gray-400" />
                            <span>Inactiva</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(rule)}
                        className="p-2 rounded-lg bg-white hover:bg-gray-100 text-gray-600 hover:text-purple-700 border border-gray-200 shadow-sm cursor-pointer transition-colors"
                        title="Editar regla"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rule)}
                        className="p-2 rounded-lg bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border border-gray-200 shadow-sm cursor-pointer transition-colors"
                        title="Eliminar regla"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xl relative text-gray-900">
            <div className="border-b border-gray-150 p-5 bg-gray-50 flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-md text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-purple-600" />
                <span>{editingRule ? 'Editar Regla de Puntos' : 'Nueva Regla de Puntos'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-500">Nombre de la Regla *</label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={(e) => setForm(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ej: Compra Mediana"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-500">Monto Mínimo ($ COP) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.montoMinimo}
                    onChange={(e) => setForm(prev => ({ ...prev, montoMinimo: e.target.value }))}
                    placeholder="15000"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 outline-none focus:border-purple-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-500">Monto Máximo ($ COP) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.montoMaximo}
                    onChange={(e) => setForm(prev => ({ ...prev, montoMaximo: e.target.value }))}
                    placeholder="30000"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-500">Puntos Otorgados (PTS) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={form.puntos}
                  onChange={(e) => setForm(prev => ({ ...prev, puntos: e.target.value }))}
                  placeholder="150"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 outline-none focus:border-purple-500 font-mono font-bold"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.activo}
                    onChange={(e) => setForm(prev => ({ ...prev, activo: e.target.checked }))}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">Regla Activa</span>
                    <span className="text-[11px] text-gray-500">Las ventas dentro de este rango aplicarán automáticamente esta regla.</span>
                  </div>
                </label>
              </div>

              <div className="border-t border-gray-150 pt-4 mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-700 font-heading text-xs font-semibold hover:bg-gray-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white font-heading text-xs font-semibold hover:bg-purple-700 cursor-pointer"
                >
                  Guardar Regla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
