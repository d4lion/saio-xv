import React from 'react';
import { Search, Eye, CreditCard } from 'lucide-react';

export default function PaymentsTab({
  payments,
  loadingPayments,
  paymentSearch,
  setPaymentSearch,
  formatCentsToCop,
  extractTxFields,
  setSelectedPayment,
  setShowPaymentDetailModal
}) {
  const filteredPayments = payments.filter(rawP => {
    const p = extractTxFields(rawP);
    const q = paymentSearch.toLowerCase();
    return (
      (p.id || '').toLowerCase().includes(q) ||
      (p.full_name || '').toLowerCase().includes(q) ||
      (p.customer_email || '').toLowerCase().includes(q) ||
      (p.reference || '').toLowerCase().includes(q) ||
      (p.legal_id || '').toLowerCase().includes(q) ||
      (p.payment_method_type || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            value={paymentSearch}
            onChange={(e) => setPaymentSearch(e.target.value)}
            placeholder="Buscar pagos por ID, cliente, correo, documento o referencia..."
            className="w-full pl-11 pr-5 py-3 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-300 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-heading font-bold tracking-wider text-xs">
                <th className="px-6 py-4.5">ID Transacción</th>
                <th className="px-6 py-4.5">Fecha</th>
                <th className="px-6 py-4.5">Cliente</th>
                <th className="px-6 py-4.5">Monto</th>
                <th className="px-6 py-4.5">Método</th>
                <th className="px-6 py-4.5">Estado</th>
                <th className="px-6 py-4.5 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans text-sm text-gray-700">
              {loadingPayments ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500 font-medium animate-pulse">Cargando transacciones de pago...</td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500 font-medium">No se encontraron pagos registrados.</td>
                </tr>
              ) : (
                filteredPayments.map((rawP) => {
                  const p = extractTxFields(rawP);
                  const isApproved = p.status === 'APPROVED';
                  const isDeclined = p.status === 'DECLINED';
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition-colors duration-150">
                      <td className="px-6 py-4.5 font-mono text-xs text-gray-950 max-w-[130px] truncate" title={p.id}>{p.id}</td>
                      <td className="px-6 py-4.5 text-gray-500 text-xs">
                        {p.created_at ? new Date(p.created_at).toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="font-semibold text-gray-900">{p.full_name || 'Sin nombre'}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{p.customer_email}</div>
                      </td>
                      <td className="px-6 py-4.5 font-mono font-bold text-gray-900">
                        {formatCentsToCop(p.amount_in_cents, p.currency)}
                      </td>
                      <td className="px-6 py-4.5 font-mono text-xs text-gray-600">
                        {p.payment_method_type || 'N/A'}
                      </td>
                      <td className="px-6 py-4.5">
                        <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                          isApproved ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' :
                          isDeclined ? 'bg-red-50 border border-red-200 text-red-700' :
                          'bg-amber-50 border border-amber-200 text-amber-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <button
                          onClick={() => { setSelectedPayment(rawP); setShowPaymentDetailModal(true); }}
                          className="p-2 rounded-lg bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-900 cursor-pointer transition-colors border border-gray-200 shadow-sm"
                          title="Ver detalle de trazabilidad"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
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
