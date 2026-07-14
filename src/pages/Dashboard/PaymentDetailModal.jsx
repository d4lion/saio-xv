import React from 'react';
import { CreditCard, X, Copy, ShieldAlert, ExternalLink } from 'lucide-react';

export default function PaymentDetailModal({
  isOpen,
  onClose,
  selectedPayment,
  extractTxFields,
  formatCentsToCop,
  onCopyToClipboard
}) {
  if (!isOpen || !selectedPayment) return null;

  const p = extractTxFields(selectedPayment);
  const asyncUrl = p.payment_method?.extra?.async_payment_url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col text-gray-900">
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="border-b border-gray-150 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0 bg-gray-50">
          <div>
            <h3 className="font-heading font-extrabold text-lg text-gray-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <span>Detalle de Transacción de Pago</span>
            </h3>
            <span className="text-xs text-gray-500 font-mono mt-0.5 block break-all select-all">
              ID: {p.id}
            </span>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider ${
              p.status === 'APPROVED' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' :
              p.status === 'DECLINED' ? 'bg-red-50 border border-red-200 text-red-700' :
              'bg-amber-50 border border-amber-200 text-amber-700'
            }`}>
              {p.status}
            </span>
            <button
              type="button"
              onClick={() => onCopyToClipboard(p.id, "ID de Pago")}
              className="p-1.5 rounded-lg bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-900 cursor-pointer border border-gray-200 shadow-sm"
              title="Copiar ID"
            >
              <Copy className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 font-sans text-sm leading-relaxed scrollbar-thin text-gray-700 bg-white">
          
          {/* Decline message bar */}
          {p.status_message && (
            <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm flex items-start gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Mensaje de Rechazo Pasarela:</span>
                <span>{p.status_message}</span>
              </div>
            </div>
          )}

          {/* Two Column Grid: Client Info & Payment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Column 1: Client Data */}
            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
              <h4 className="font-heading font-bold text-sm text-blue-700 uppercase tracking-wider border-b border-gray-150 pb-2">
                Información del Cliente
              </h4>
              
              <div className="grid grid-cols-2 gap-y-3 text-xs">
                <div>
                  <span className="text-gray-500 block">Nombre Completo</span>
                  <span className="text-gray-900 font-medium">{p.full_name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Documento Legal</span>
                  <span className="text-gray-900 font-medium font-mono">
                    {p.legal_id_type || 'CC'} {p.legal_id || 'N/A'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500 block">Correo Electrónico</span>
                  <span className="text-gray-900 font-medium break-all select-all">{p.customer_email || 'N/A'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500 block">Teléfono Móvil</span>
                  <span className="text-gray-900 font-medium font-mono">{p.phone_number || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Column 2: Payment Data */}
            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
              <h4 className="font-heading font-bold text-sm text-blue-700 uppercase tracking-wider border-b border-gray-150 pb-2">
                Detalles Financieros
              </h4>

              <div className="grid grid-cols-2 gap-y-3 text-xs">
                <div>
                  <span className="text-gray-500 block">Monto en Céntimos</span>
                  <span className="text-gray-900 font-semibold font-mono">{p.amount_in_cents?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Monto Formateado</span>
                  <span className="text-gray-900 font-bold font-mono text-[14px]">
                    {formatCentsToCop(p.amount_in_cents, p.currency)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Método de Pago</span>
                  <span className="text-gray-900 font-medium font-mono bg-white px-2 py-0.5 rounded border border-gray-200 uppercase">
                    {p.payment_method_type || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Moneda</span>
                  <span className="text-gray-900 font-medium">{p.currency || 'COP'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500 block">Referencia de Pago</span>
                  <span className="text-gray-900 font-medium font-mono break-all block select-all">{p.reference || 'N/A'}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Customer References Substructures */}
          {p.customer_references && p.customer_references.length > 0 && (
            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
              <h4 className="font-heading font-bold text-sm text-blue-700 uppercase tracking-wider border-b border-gray-150 pb-2">
                Referencias de Retorno (Customer References)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {p.customer_references.map((ref, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-gray-200 flex flex-col shadow-sm">
                    <span className="text-[10px] text-gray-500 font-heading uppercase">{ref.label || `Referencia ${idx + 1}`}</span>
                    <span className="text-xs text-gray-900 font-mono font-medium mt-0.5 select-all">{ref.value || 'N/A'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Method Details (Tokens & Identifiers) */}
          <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
            <h4 className="font-heading font-bold text-sm text-blue-700 uppercase tracking-wider border-b border-gray-150 pb-2">
              Metadatos de la Pasarela de Pago
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-gray-500 font-sans block text-[10px] uppercase">ID Transacción Pasarela</span>
                <span className="text-gray-900 block select-all mt-0.5">{p.payment_method?.extra?.transaction_id || p.payment_method?.transaction_id || p.id}</span>
              </div>
              <div>
                <span className="text-gray-500 font-sans block text-[10px] uppercase">Identificador Externo</span>
                <span className="text-gray-900 block select-all mt-0.5">{p.payment_method?.extra?.external_identifier || p.payment_method?.external_identifier || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500 font-sans block text-[10px] uppercase">ID Link de Pago (Payment Link ID)</span>
                <span className="text-gray-900 block select-all mt-0.5">{p.payment_link_id || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500 font-sans block text-[10px] uppercase">Teléfono de Pago</span>
                <span className="text-gray-950 block select-all mt-0.5">{p.payment_method?.phone_number || p.phone_number || 'N/A'}</span>
              </div>
              {asyncUrl && (
                <div className="col-span-1 sm:col-span-2">
                  <span className="text-gray-500 font-sans block text-[10px] uppercase">Enlace de Pago Asíncrono</span>
                  <a 
                    href={asyncUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-0.5 underline break-all font-medium text-[11px]"
                  >
                    <span>{asyncUrl}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Browser Info & Device Info */}
          <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
            <h4 className="font-heading font-bold text-sm text-blue-700 uppercase tracking-wider border-b border-gray-150 pb-2">
              Huella Digital del Dispositivo e Información del Navegador
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-gray-500 block">Idioma</span>
                <span className="text-gray-900 font-medium">{p.browser_info?.browser_language || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Zona Horaria (Offset)</span>
                <span className="text-gray-900 font-medium">{p.browser_info?.browser_tz || 'N/A'} min</span>
              </div>
              <div>
                <span className="text-gray-500 block">Resolución de Pantalla</span>
                <span className="text-gray-900 font-medium">
                  {p.browser_info?.browser_screen_width && p.browser_info?.browser_screen_height 
                    ? `${p.browser_info.browser_screen_width} x ${p.browser_info.browser_screen_height}` 
                    : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Profundidad de Color</span>
                <span className="text-gray-900 font-medium">{p.browser_info?.browser_color_depth || 'N/A'} bits</span>
              </div>
              <div className="col-span-2 sm:col-span-4">
                <span className="text-gray-500 block">Identificador del Dispositivo (Device ID)</span>
                <span className="text-gray-900 font-mono text-[11px] select-all break-all block mt-0.5">{p.device_id || 'N/A'}</span>
              </div>
            </div>

            {p.browser_info?.browser_user_agent && (
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 font-heading uppercase">Browser User Agent</span>
                <pre className="bg-white p-3 rounded-xl border border-gray-200 text-[11px] font-mono text-gray-600 leading-normal select-all overflow-x-auto shadow-sm">
                  {p.browser_info.browser_user_agent}
                </pre>
              </div>
            )}

            {p.device_data_token && (
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 font-heading uppercase">Token de Datos de Seguridad del Dispositivo</span>
                <div className="relative">
                  <pre className="bg-white p-3 pr-10 rounded-xl border border-gray-200 text-[10px] font-mono text-gray-500 leading-normal select-all max-h-[80px] overflow-y-auto break-all shadow-sm">
                    {p.device_data_token}
                  </pre>
                  <button 
                    type="button"
                    onClick={() => onCopyToClipboard(p.device_data_token, "Token del Dispositivo")}
                    className="absolute right-3 top-3 p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-800 cursor-pointer border border-gray-200 shadow-sm"
                    title="Copiar token completo"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Audit Timestamps */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center text-xs text-gray-500 font-mono grid grid-cols-2 gap-2">
            <div>Creado el: {p.created_at ? new Date(p.created_at).toLocaleString() : 'N/A'}</div>
            <div>Finalizado el: {p.finalized_at ? new Date(p.finalized_at).toLocaleString() : 'N/A'}</div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-150 p-5 flex justify-end shrink-0 bg-gray-50 -mx-6 -mb-6 p-5">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-heading text-xs font-semibold cursor-pointer transition-all duration-200 shadow-sm"
          >
            Cerrar Detalles
          </button>
        </div>
      </div>
    </div>
  );
}
