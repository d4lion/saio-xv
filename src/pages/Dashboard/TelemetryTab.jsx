import React from 'react';
import { Cpu, User, Key, Gift, CreditCard, Terminal } from 'lucide-react';

export default function TelemetryTab({
  users,
  codes,
  rewards,
  payments,
  terminalEvents,
  navigate
}) {
  return (
    <div className="space-y-6 animate-fadeIn text-gray-800">
      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
          <span className="text-xs font-heading font-bold text-gray-500 uppercase tracking-wider block">Usuarios del Sistema</span>
          <div className="flex items-baseline justify-between">
            <p className="text-4xl font-heading font-extrabold text-gray-900">{users.length}</p>
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-xs text-gray-500">Registrados en colección Firestore</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
          <span className="text-xs font-heading font-bold text-gray-500 uppercase tracking-wider block">Códigos QR Activos</span>
          <div className="flex items-baseline justify-between">
            <p className="text-4xl font-heading font-extrabold text-gray-900">
              {codes.filter(c => c.activo).length} / {codes.length}
            </p>
            <Key className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-xs text-gray-500">Códigos habilitados para canje</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
          <span className="text-xs font-heading font-bold text-gray-500 uppercase tracking-wider block">Catálogo de Premios</span>
          <div className="flex items-baseline justify-between">
            <p className="text-4xl font-heading font-extrabold text-gray-900">{rewards.length}</p>
            <Gift className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-xs text-gray-500">Premios vigentes en inventario</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
          <span className="text-xs font-heading font-bold text-gray-500 uppercase tracking-wider block">Transacciones de Pago</span>
          <div className="flex items-baseline justify-between">
            <p className="text-4xl font-heading font-extrabold text-gray-900">{payments.length}</p>
            <CreditCard className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-xs text-gray-500">Trazabilidad de pagos Firestore</p>
        </div>
      </div>

      {/* Console log */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-150 pb-3">
          <Terminal className="w-5 h-5 text-blue-600" />
          <h3 className="font-heading font-bold text-lg text-gray-900">Terminal de Eventos y Registro de Telemetría</h3>
        </div>
        <div className="bg-gray-900 p-4 rounded-xl font-mono text-sm text-emerald-400 space-y-2 overflow-y-auto max-h-[300px] shadow-inner">
          {terminalEvents.map((ev, index) => (
            <p key={index} className={ev.includes('[ERROR]') ? 'text-red-400' : ev.includes('[SUCCESS]') ? 'text-emerald-400' : 'text-gray-300'}>
              {ev}
            </p>
          ))}
          <div className="w-1.5 h-3 bg-emerald-400 inline-block animate-pulse"></div>
        </div>
      </div>

      {/* General Actions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
        <h3 className="font-heading font-bold text-lg text-gray-900 border-b border-gray-150 pb-3">Accesos Directos</h3>
        <div className="flex flex-wrap gap-4">
          <button onClick={() => navigate('/mis-puntos')} className="py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold transition-all duration-200 cursor-pointer">
            Ir a Reclamar Puntos (Vista Evento)
          </button>
          <button onClick={() => navigate('/')} className="py-2.5 px-4 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 hover:text-gray-900 text-xs font-semibold transition-all duration-200 cursor-pointer">
            Volver a Página Principal (Vista Evento)
          </button>
        </div>
      </div>
    </div>
  );
}
