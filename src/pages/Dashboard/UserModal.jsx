import  { useState, useEffect } from 'react';
import { User, X, Loader2, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { ROLES } from '../../constants/roles';

export default function UserModal({
  isOpen,
  onClose,
  mode,
  form,
  setForm,
  onSave,
  isSubmitting = false
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Reiniciar estados de contraseña al abrir o cambiar de modo
  useEffect(() => {
    if (isOpen) {
      setShowPassword(false);
      setShowConfirmPassword(false);
      setConfirmPassword(form.password || '');
      setPasswordError('');
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isSubmitting) return; // Bloquear cierre durante la creación
    onClose();
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (mode === 'create') {
      if (!form.password || form.password.length < 6) {
        setPasswordError('La contraseña es obligatoria y debe tener al menos 6 caracteres.');
        return;
      }
      if (!confirmPassword) {
        setPasswordError('Debes confirmar la contraseña.');
        return;
      }
      if (form.password !== confirmPassword) {
        setPasswordError('Las contraseñas no coinciden.');
        return;
      }
    }
    setPasswordError('');
    onSave(e);
  };

  const isPasswordMismatch = mode === 'create' && Boolean(confirmPassword) && form.password !== confirmPassword;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-2xl relative text-gray-900 transition-all max-h-[90vh] flex flex-col">
        
        {/* Modal Overlay / Lock when Submitting */}
        {isSubmitting && (
          <div className="absolute inset-0 z-30 bg-white/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mb-4 shadow-inner">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h4 className="font-heading font-extrabold text-lg text-gray-900 mb-1">
              Creando usuario y enviando ticket...
            </h4>
            <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
              Por favor espera unos segundos. Estamos registrando la información y despachando la entrada por correo electrónico.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
              <Lock className="w-3.5 h-3.5" />
              <span>Modal bloqueado hasta finalizar el proceso</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="border-b border-gray-100 p-6 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-gray-900 leading-tight">
                {mode === 'create' ? 'Crear Nuevo Usuario' : 'Editar Perfil de Usuario'}
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                {mode === 'create' ? 'Todos los campos son obligatorios para registrar al asistente y enviar la entrada por correo.' : 'Modifica los campos del perfil seleccionado.'}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-all flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Nombre Completo */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
              Nombre Completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              value={form.nombre}
              onChange={(e) => setForm(prev => ({ ...prev, nombre: e.target.value }))}
              placeholder="Ej: Juan Pérez"
              className="w-full px-4 py-3 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 rounded-xl text-sm font-medium text-gray-900 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:opacity-60"
            />
          </div>

          {/* Correo Electrónico */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
              Correo Electrónico <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              disabled={mode === 'edit' || isSubmitting}
              value={form.correo}
              onChange={(e) => setForm(prev => ({ ...prev, correo: e.target.value }))}
              placeholder="ejemplo@saio.com"
              className="w-full px-4 py-3 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 rounded-xl text-sm font-medium text-gray-900 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:opacity-60"
            />
          </div>

          {/* Cédula y Teléfono */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                Cédula / Documento <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isSubmitting}
                value={form.cedula}
                onChange={(e) => setForm(prev => ({ ...prev, cedula: e.target.value }))}
                placeholder="Ej: 1020304050"
                className="w-full px-4 py-3 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 rounded-xl text-sm font-medium text-gray-900 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:opacity-60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                Teléfono <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isSubmitting}
                value={form.telefono || ''}
                onChange={(e) => setForm(prev => ({ ...prev, telefono: e.target.value }))}
                placeholder="Ej: 3001234567"
                className="w-full px-4 py-3 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 rounded-xl text-sm font-medium text-gray-900 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Boleta y Monto Pagado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                Boleta Asignada <span className="text-red-500">*</span>
              </label>
              <select
                required
                disabled={isSubmitting}
                value={form.boleta}
                onChange={(e) => {
                  const val = e.target.value;
                  let suggestedMonto = form.monto;
                  if (val === 'Boleta Supernova') suggestedMonto = '70000';
                  else if (val === 'Boleta Orbita') suggestedMonto = '50000';
                  else if (val === 'Boleta Cortesía' || val === 'No determinado') suggestedMonto = '0';
                  setForm(prev => ({ ...prev, boleta: val, monto: suggestedMonto }));
                }}
                className="w-full px-4 py-3 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 rounded-xl text-sm font-medium text-gray-900 outline-none transition-all duration-200 cursor-pointer disabled:bg-gray-50 disabled:opacity-60"
              >
                <option value="No determinado">No determinado</option>
                <option value="Boleta Cortesía">Boleta Cortesía</option>
                <option value="Boleta Orbita">Boleta Órbita</option>
                <option value="Boleta Supernova">Boleta Supernova</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                Monto Pagado ($ COP) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                disabled={isSubmitting}
                value={form.monto !== undefined && form.monto !== null ? form.monto : ''}
                onChange={(e) => setForm(prev => ({ ...prev, monto: e.target.value }))}
                placeholder="Ej: 70000"
                className="w-full px-4 py-3 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 rounded-xl text-sm font-medium text-gray-900 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Rol Asignado */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
              Rol Asignado <span className="text-red-500">*</span>
            </label>
            <select
              required
              disabled={isSubmitting}
              value={form.rol}
              onChange={(e) => setForm(prev => ({ ...prev, rol: e.target.value }))}
              className="w-full px-4 py-3 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 rounded-xl text-sm font-medium text-gray-900 outline-none transition-all duration-200 cursor-pointer disabled:bg-gray-50 disabled:opacity-60"
            >
              <option value={ROLES.ASISTENTE}>Asistente</option>
              <option value={ROLES.COORDINADOR}>Coordinador</option>
              <option value={ROLES.ADMIN}>Admin</option>
            </select>
          </div>

          {/* Contraseña / Confirmación de Contraseña con Ojo Toggle (en modo creación) */}
          {mode === 'create' ? (
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Campo Contraseña */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      disabled={isSubmitting}
                      value={form.password || ''}
                      onChange={(e) => {
                        setForm(prev => ({ ...prev, password: e.target.value }));
                        setPasswordError('');
                      }}
                      placeholder="Mínimo 6 caracteres"
                      className={`w-full px-4 py-3 pr-11 bg-white border ${isPasswordMismatch ? 'border-red-400 focus:ring-red-400/20' : 'border-gray-300 hover:border-gray-400 focus:border-blue-600 focus:ring-blue-600/20'} focus:ring-2 rounded-xl text-sm font-medium text-gray-900 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:opacity-60`}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(prev => !prev)}
                      disabled={isSubmitting}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 transition-colors cursor-pointer"
                      title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Campo Confirmar Contraseña */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                    Confirmar Contraseña <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      disabled={isSubmitting}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setPasswordError('');
                      }}
                      placeholder="Repite la contraseña"
                      className={`w-full px-4 py-3 pr-11 bg-white border ${isPasswordMismatch ? 'border-red-400 focus:ring-red-400/20 bg-red-50/20' : 'border-gray-300 hover:border-gray-400 focus:border-blue-600 focus:ring-blue-600/20'} focus:ring-2 rounded-xl text-sm font-medium text-gray-900 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:opacity-60`}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirmPassword(prev => !prev)}
                      disabled={isSubmitting}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 transition-colors cursor-pointer disabled:opacity-40"
                      title={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Mensaje de Error de Validación */}
              {(isPasswordMismatch || passwordError) && (
                <div className="flex items-center gap-2 text-xs font-semibold text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordError || 'Las contraseñas no coinciden.'}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                Puntos Totales
              </label>
              <input
                type="number"
                readOnly
                disabled={isSubmitting}
                value={form.puntos}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-sm font-bold text-gray-900 font-mono text-center cursor-not-allowed"
              />
            </div>
          )}

          {/* Footer Buttons - Google Style */}
          <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3 -mx-6 -mb-6 p-6 bg-gray-50/80 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 font-heading text-sm font-semibold cursor-pointer transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isPasswordMismatch}
              className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-heading text-sm font-bold shadow-md hover:shadow-lg shadow-blue-500/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Procesando...</span>
                </>
              ) : (
                <span>{mode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
