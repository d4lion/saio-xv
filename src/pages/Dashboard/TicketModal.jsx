import { X, Ticket, ExternalLink } from 'lucide-react';

export default function TicketModal({ isOpen, onClose, mode, form, setForm, onSave }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-gray-900 text-md">
                {mode === 'create' ? 'Crear Nueva Entradas / Boleta' : `Editar Boleta: ${form.name}`}
              </h3>
              <p className="text-xs text-gray-500">
                Configura todos los parámetros, cupos y checkout Wompi para guardar en Firestore
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={onSave} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* ID / Slug */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ID / Identificador Único *
              </label>
              <input
                type="text"
                required
                disabled={mode === 'edit'}
                placeholder="ej: general, vip, estudiante"
                value={form.id}
                onChange={(e) => setForm({ ...form, id: e.target.value.toLowerCase().trim() })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Nombre de la Boleta *
              </label>
              <input
                type="text"
                required
                placeholder="ej: Boleta General"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Subtítulo */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Subtítulo Descriptivo
              </label>
              <input
                type="text"
                placeholder="ej: Acceso completo a la experiencia SAIO XV"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Precio Formateado */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Precio Formateado *
              </label>
              <input
                type="text"
                required
                placeholder="ej: $50.000"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Precio Numérico Raw */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Precio Numérico (COP) *
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="ej: 50000"
                value={form.rawPrice}
                onChange={(e) => setForm({ ...form, rawPrice: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Moneda */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Moneda
              </label>
              <input
                type="text"
                placeholder="ej: COP"
                value={form.currency || 'COP'}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Período */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Etiqueta Período
              </label>
              <input
                type="text"
                placeholder="ej: por persona"
                value={form.period || 'por persona'}
                onChange={(e) => setForm({ ...form, period: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Cupos Totales */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Cupos Totales Disponibles *
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="ej: 200"
                value={form.totalAvailable}
                onChange={(e) => setForm({ ...form, totalAvailable: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Cupos Restantes */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Cupos Restantes *
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="ej: 142"
                value={form.remainingAvailable}
                onChange={(e) => setForm({ ...form, remainingAvailable: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Texto Botón CTA */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Texto del Botón (CTA) *
              </label>
              <input
                type="text"
                required
                placeholder="ej: Comprar boleta General"
                value={form.cta}
                onChange={(e) => setForm({ ...form, cta: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Color Primario */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Color Principal Hex
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.color || '#4c29b6'}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-9 h-9 rounded-lg border border-gray-300 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={form.color || '#4c29b6'}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono text-gray-900 outline-none"
                />
              </div>
            </div>

            {/* Icono */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Icono Representativo
              </label>
              <select
                value={form.iconName || 'Zap'}
                onChange={(e) => setForm({ ...form, iconName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white"
              >
                <option value="Zap">⚡ Zap (Rayo / General)</option>
                <option value="Crown">👑 Crown (Corona / VIP)</option>
                <option value="Ticket">🎫 Ticket (Entrada estándar)</option>
                <option value="Sparkles">✨ Sparkles (Especial)</option>
              </select>
            </div>

            {/* Enlace de Checkout Wompi */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Enlace Oficial Checkout Wompi *
              </label>
              <div className="relative">
                <input
                  type="url"
                  required
                  placeholder="https://checkout.wompi.co/l/..."
                  value={form.checkoutUrl}
                  onChange={(e) => setForm({ ...form, checkoutUrl: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none font-mono"
                />
                <ExternalLink className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Beneficios Incluidos */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Beneficios / Características Incluidas (separadas por coma o salto de línea)
              </label>
              <textarea
                rows={4}
                placeholder="Acceso completo a talleres, Material digital, Coffee break..."
                value={form.featuresInput}
                onChange={(e) => setForm({ ...form, featuresInput: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none font-sans"
              />
            </div>

            {/* Checkboxes: Destacado / Activo */}
            <div className="sm:col-span-2 flex items-center justify-between pt-2 border-t border-gray-100">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={form.popular || false}
                  onChange={(e) => setForm({ ...form, popular: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                />
                <span>Marcar como "Experiencia Recomendada" (Destacado)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={form.activo !== false}
                  onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                />
                <span>Habilitar para Venta Pública</span>
              </label>
            </div>

          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-heading text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-heading text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              {mode === 'create' ? 'Crear Boleta' : 'Guardar Cambios'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
