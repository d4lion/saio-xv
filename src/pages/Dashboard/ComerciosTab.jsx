import React, { useState } from 'react';
import { Store, Plus, Search, Mail, Phone, ShieldCheck, User, Building, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function ComerciosTab({
  comercios,
  loadingComercios,
  onRegisterComercio,
  onRefresh
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    nombreTienda: '',
    nit: '',
    nombreAdmin: '',
    telefono: '',
    email: '',
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const filteredComercios = comercios.filter(c =>
    (c.nombreTienda || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.nit || '').includes(searchTerm) ||
    (c.nombreAdmin || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.correo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenCreate = () => {
    setForm({
      nombreTienda: '',
      nit: '',
      nombreAdmin: '',
      telefono: '',
      email: '',
      password: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombreTienda.trim() || !form.nit.trim() || !form.nombreAdmin.trim() || !form.email.trim() || !form.password) {
      toast.error('Completa todos los campos obligatorios del comercio.');
      return;
    }

    if (form.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setSubmitting(true);
    try {
      toast.loading('Registrando comercio y creando credenciales de acceso...', { id: 'comercio-reg' });
      await onRegisterComercio(form);
      toast.success(`¡Comercio "${form.nombreTienda}" registrado con éxito!`, { id: 'comercio-reg' });
      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error(`Error al registrar comercio: ${err.message}`, { id: 'comercio-reg' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Search and Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar comercios por marca, NIT, dueño o correo..."
            className="w-full pl-11 pr-5 py-3 bg-white border border-gray-300 hover:border-gray-400 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 shadow-sm"
          />
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-heading text-xs font-bold uppercase tracking-wider cursor-pointer transition-all duration-200 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nuevo Comercio</span>
        </button>
      </div>

      {/* Comercios Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-heading font-bold tracking-wider text-xs">
                <th className="px-6 py-4.5">Tienda / Marca</th>
                <th className="px-6 py-4.5">NIT / ID Fiscal</th>
                <th className="px-6 py-4.5">Administrador de Marca</th>
                <th className="px-6 py-4.5">Contacto & Acceso</th>
                <th className="px-6 py-4.5 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans text-sm text-gray-700">
              {loadingComercios ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500 font-medium animate-pulse">
                    Cargando comercios del evento...
                  </td>
                </tr>
              ) : filteredComercios.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500 font-medium">
                    No se han registrado comercios o tiendas aún.
                  </td>
                </tr>
              ) : (
                filteredComercios.map((comercio) => (
                  <tr key={comercio.id || comercio.uid} className="hover:bg-gray-50/80 transition-colors duration-150">
                    <td className="px-6 py-4.5 font-semibold text-gray-900 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
                        <Store className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <span className="block font-bold text-gray-900">{comercio.nombreTienda}</span>
                        <span className="text-[11px] text-gray-500 font-mono">UID: {comercio.uid}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 font-mono text-xs font-bold text-gray-800">
                      {comercio.nit || 'N/A'}
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="font-medium text-gray-900">{comercio.nombreAdmin}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 space-y-0.5">
                      <div className="flex items-center gap-2 text-xs">
                        <Mail className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span className="font-mono text-gray-800">{comercio.correo}</span>
                      </div>
                      {comercio.telefono && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{comercio.telefono}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Activo</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Registrar Comercio */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xl relative text-gray-900">
            <div className="border-b border-gray-150 p-5 bg-gray-50 flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-md text-gray-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-purple-600" />
                <span>Registrar Comercio o Marca del Evento</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
                disabled={submitting}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Nombre Tienda / Razón Social */}
              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-500">
                  Nombre de la Tienda / Razón Social *
                </label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={form.nombreTienda}
                    onChange={(e) => setForm(prev => ({ ...prev, nombreTienda: e.target.value }))}
                    placeholder="Ej: Monsieur Waffle SAIO"
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 outline-none focus:border-purple-600"
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* NIT */}
              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-500">
                  NIT / Identificación Fiscal o de Marca *
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={form.nit}
                    onChange={(e) => setForm(prev => ({ ...prev, nit: e.target.value }))}
                    placeholder="Ej: 900.123.456-7"
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 outline-none focus:border-purple-600 font-mono"
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Nombre Admin Marca & Teléfono */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-500">
                    Dueño / Administrador de Marca *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={form.nombreAdmin}
                      onChange={(e) => setForm(prev => ({ ...prev, nombreAdmin: e.target.value }))}
                      placeholder="Ej: Carlos Gómez"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 outline-none focus:border-purple-600"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-500">
                    Teléfono de Contacto
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={form.telefono}
                      onChange={(e) => setForm(prev => ({ ...prev, telefono: e.target.value }))}
                      placeholder="+57 300 123 4567"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 outline-none focus:border-purple-600"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              {/* Correo y Contraseña de Acceso */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-500">
                    Correo de Acceso (Login) *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="tienda@saio.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 outline-none focus:border-purple-600 font-mono"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-500">
                    Contraseña Inicial *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={form.password}
                      onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 outline-none focus:border-purple-600 font-mono"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-150 pt-4 mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-700 font-heading text-xs font-semibold hover:bg-gray-100 cursor-pointer"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-heading text-xs font-semibold hover:bg-purple-700 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? 'Creando Comercio...' : 'Crear Comercio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
