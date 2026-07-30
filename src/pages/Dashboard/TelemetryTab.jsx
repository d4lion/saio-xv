import React, { useState } from 'react';
import { 
  Cpu, User, Key, Gift, CreditCard, Terminal, Search, 
  Trash2, RefreshCw, Filter, CheckCircle2, AlertTriangle, 
  XCircle, Info, ShieldAlert, Wifi
} from 'lucide-react';

export default function TelemetryTab({
  users = [],
  codes = [],
  rewards = [],
  payments = [],
  telemetryLogs = [],
  loadingTelemetry = false,
  onClearLogs,
  onRefreshLogs,
  onTestFirestore,
  navigate,
  userRole = 'admin'
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [autoScroll, setAutoScroll] = useState(true);

  // Filter logic
  const filteredLogs = telemetryLogs.filter(log => {
    const matchesSearch = !searchTerm.trim() || 
      (log.message && log.message.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.category && log.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.userEmail && log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = selectedType === 'ALL' || log.type === selectedType;
    const matchesCategory = selectedCategory === 'ALL' || log.category === selectedCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  const getTypeBadge = (type) => {
    switch (type) {
      case 'SUCCESS':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          icon: CheckCircle2,
          label: 'SUCCESS'
        };
      case 'ERROR':
        return {
          bg: 'bg-red-500/10 text-red-400 border-red-500/30',
          icon: XCircle,
          label: 'ERROR'
        };
      case 'WARNING':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          icon: AlertTriangle,
          label: 'WARNING'
        };
      default:
        return {
          bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          icon: Info,
          label: 'INFO'
        };
    }
  };

  const categories = [
    'ALL', 'SYSTEM', 'AUTH', 'USER', 'QR_CODE', 'REWARDS', 'PAYMENTS', 'GPS', 'FIREBASE'
  ];

  const formatTimestamp = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('es-CO', { hour12: false }) + '.' + String(d.getMilliseconds()).padStart(3, '0');
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-gray-800">
      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3 hover:border-blue-300 transition-all">
          <span className="text-xs font-heading font-bold text-gray-500 uppercase tracking-wider block">Usuarios del Sistema</span>
          <div className="flex items-baseline justify-between">
            <p className="text-4xl font-heading font-extrabold text-gray-900">{users.length}</p>
            <div className="p-2.5 bg-blue-50 rounded-xl">
              <User className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">Registrados en colección Firestore</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3 hover:border-emerald-300 transition-all">
          <span className="text-xs font-heading font-bold text-gray-500 uppercase tracking-wider block">Códigos QR Activos</span>
          <div className="flex items-baseline justify-between">
            <p className="text-4xl font-heading font-extrabold text-gray-900">
              {codes.filter(c => c.activo).length} <span className="text-lg text-gray-400 font-normal">/ {codes.length}</span>
            </p>
            <div className="p-2.5 bg-emerald-50 rounded-xl">
              <Key className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">Códigos habilitados para canje</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3 hover:border-purple-300 transition-all">
          <span className="text-xs font-heading font-bold text-gray-500 uppercase tracking-wider block">Catálogo de Premios</span>
          <div className="flex items-baseline justify-between">
            <p className="text-4xl font-heading font-extrabold text-gray-900">{rewards.length}</p>
            <div className="p-2.5 bg-purple-50 rounded-xl">
              <Gift className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">Premios vigentes en inventario</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3 hover:border-emerald-300 transition-all">
          <span className="text-xs font-heading font-bold text-gray-500 uppercase tracking-wider block">Transacciones de Pago</span>
          <div className="flex items-baseline justify-between">
            <p className="text-4xl font-heading font-extrabold text-gray-900">{payments.length}</p>
            <div className="p-2.5 bg-emerald-50 rounded-xl">
              <CreditCard className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">Trazabilidad de pagos Firestore</p>
        </div>
      </div>

      {/* Main Console Box */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        {/* Console Header */}
        <div className="p-5 border-b border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-sm">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-lg text-gray-900">Telemetría y Eventos en Tiempo Real</h3>
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Firestore Live
                </span>
              </div>
              <p className="text-xs text-gray-500">Registros y trazabilidad en vivo guardados en la nube</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            {onTestFirestore && (
              <button
                onClick={onTestFirestore}
                className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                title="Enviar evento de prueba directo a Firestore"
              >
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Probar Firestore</span>
              </button>
            )}

            {onRefreshLogs && (
              <button
                onClick={onRefreshLogs}
                className="p-2 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                title="Actualizar eventos"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingTelemetry ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualizar</span>
              </button>
            )}

            {userRole === 'admin' && onClearLogs && (
              <button
                onClick={onClearLogs}
                className="p-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Limpiar telemetría de Firestore"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Limpiar Consola</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 bg-gray-900 border-b border-gray-800 flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por mensaje, usuario o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-800/90 border border-gray-700 rounded-xl text-xs text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500 font-mono transition-all"
            />
          </div>

          {/* Level Filter Buttons */}
          <div className="flex items-center gap-1 bg-gray-800/80 p-1 rounded-xl border border-gray-700 overflow-x-auto">
            {['ALL', 'INFO', 'SUCCESS', 'WARNING', 'ERROR'].map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  selectedType === type
                    ? type === 'ERROR' 
                      ? 'bg-red-600 text-white shadow-sm'
                      : type === 'SUCCESS'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : type === 'WARNING'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Category Filter Select */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-gray-800/90 border border-gray-700 rounded-xl text-xs text-gray-200 font-mono focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">Todas las Categorías</option>
            {categories.filter(c => c !== 'ALL').map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Terminal Screen Output */}
        <div className="bg-gray-950 p-4 font-mono text-xs space-y-2 overflow-y-auto min-h-[350px] max-h-[500px] shadow-inner selection:bg-blue-500 selection:text-white">
          {loadingTelemetry && telemetryLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500 gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
              <span>Cargando eventos de telemetría desde Firestore...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500 gap-2">
              <Info className="w-6 h-6 text-gray-600" />
              <p>No se encontraron eventos de telemetría con los filtros actuales.</p>
              {(searchTerm || selectedType !== 'ALL' || selectedCategory !== 'ALL') && (
                <button
                  onClick={() => { setSearchTerm(''); setSelectedType('ALL'); setSelectedCategory('ALL'); }}
                  className="mt-2 text-xs text-blue-400 hover:underline cursor-pointer"
                >
                  Restablecer Filtros
                </button>
              )}
            </div>
          ) : (
            filteredLogs.map((log, index) => {
              const badge = getTypeBadge(log.type);
              const IconComp = badge.icon;
              return (
                <div 
                  key={log.id || index}
                  className="p-2.5 rounded-lg bg-gray-900/60 border border-gray-800/80 hover:bg-gray-900 transition-colors group flex flex-col sm:flex-row sm:items-start justify-between gap-2"
                >
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <span className="text-gray-500 shrink-0 text-[11px] pt-0.5">
                      [{formatTimestamp(log.fecha)}]
                    </span>

                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0 ${badge.bg}`}>
                      <IconComp className="w-3 h-3" />
                      {badge.label}
                    </span>

                    {log.category && (
                      <span className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700 text-[10px] font-semibold shrink-0">
                        {log.category}
                      </span>
                    )}

                    <span className={`break-all leading-relaxed ${
                      log.type === 'ERROR' 
                        ? 'text-red-300 font-medium' 
                        : log.type === 'SUCCESS' 
                        ? 'text-emerald-300' 
                        : log.type === 'WARNING'
                        ? 'text-amber-300'
                        : 'text-gray-200'
                    }`}>
                      {log.message}
                    </span>
                  </div>

                  {log.userEmail && (
                    <span className="text-[10px] text-gray-500 bg-gray-800/40 px-2 py-0.5 rounded border border-gray-800 shrink-0 self-end sm:self-start">
                      {log.userEmail}
                    </span>
                  )}
                </div>
              );
            })
          )}
          
          <div className="pt-2 flex items-center justify-between text-[11px] text-gray-600 border-t border-gray-900">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-3 bg-emerald-400 inline-block animate-pulse"></span>
              Mostrando {filteredLogs.length} de {telemetryLogs.length} eventos de Firestore
            </span>
            <span className="text-gray-500 font-mono">SAIO-XV System Telemetry Engine v2.0</span>
          </div>
        </div>
      </div>

      {/* Quick Shortcuts */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
        <h3 className="font-heading font-bold text-lg text-gray-900 border-b border-gray-150 pb-3">Accesos Directos del Evento</h3>
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

