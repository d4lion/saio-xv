import { useState } from 'react';
import { 
  Ticket, Plus, Edit2, Trash2, Power, Zap, Crown, Sparkles, ExternalLink, 
  MousePointer, TrendingUp, AlertTriangle, Monitor, Smartphone, Tablet, Database
} from 'lucide-react';
import { toast } from 'sonner';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function TicketsTab({
  tickets,
  loadingTickets,
  telemetryLogs,
  payments,
  handleOpenCreateTicket,
  handleOpenEditTicket,
  handleToggleTicketStatus,
  handleDeleteTicket
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [chartTimeFilter, setChartTimeFilter] = useState('all'); // '10m', '1h', '24h', 'all'

  // 1. Calculate Click Traceability Metrics from telemetry logs
  const checkoutClickLogs = (telemetryLogs || []).filter(
    log => log.category === 'TICKET_CHECKOUT_CLICK'
  );
  
  const totalClicks = checkoutClickLogs.length;

  // Device Breakdown
  const deviceCounts = checkoutClickLogs.reduce((acc, log) => {
    const dev = log.metadata?.deviceType || 'Desktop';
    acc[dev] = (acc[dev] || 0) + 1;
    return acc;
  }, {});

  // Chart data calculation: Using time filter as the grouping granularity (X-axis)
  const groupedByTime = checkoutClickLogs.reduce((acc, log) => {
    const d = new Date(log.fecha);
    let key = '';
    const day = d.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' });
    
    if (chartTimeFilter === '30s') {
      const seconds = d.getSeconds();
      const roundedSeconds = seconds < 30 ? '00' : '30';
      const time = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });
      key = `${day}, ${time}:${roundedSeconds}`;
    } else if (chartTimeFilter === '60s') {
      const time = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });
      key = `${day}, ${time}`;
    } else if (chartTimeFilter === '10m') {
      const min = d.getMinutes();
      const roundedMin = Math.floor(min / 10) * 10;
      const hour = d.getHours().toString().padStart(2, '0');
      key = `${day}, ${hour}:${roundedMin.toString().padStart(2, '0')}`;
    } else if (chartTimeFilter === '1h') {
      const hour = d.getHours().toString().padStart(2, '0');
      key = `${day}, ${hour}:00`;
    } else { // '24h' or 'all'
      key = day;
    }

    if (!acc[key]) {
      acc[key] = { name: key };
    }
    
    const tId = log.metadata?.ticketId || 'Desconocido';
    acc[key][tId] = (acc[key][tId] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.values(groupedByTime).reverse();
  const uniqueChartTicketIds = [...new Set(checkoutClickLogs.map(l => l.metadata?.ticketId || 'Desconocido'))];

  const getTicketColor = (tId, index) => {
    const t = tickets?.find(t => t.id === tId);
    if (t && t.color) return t.color;
    const colors = ['#9c3aed', '#10b981', '#f59e0b', '#3b82f6'];
    return colors[index % colors.length];
  };

  const getTicketName = (tId) => {
    const t = tickets?.find(t => t.id === tId);
    return t ? t.name : (tId === 'Desconocido' ? 'Otros' : tId);
  };

  const filteredTickets = (tickets || []).filter(t => 
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIconComponent = (iconName, color) => {
    if (iconName === 'Crown') return <Crown className="w-5 h-5" style={{ color }} />;
    if (iconName === 'Sparkles') return <Sparkles className="w-5 h-5" style={{ color }} />;
    return <Zap className="w-5 h-5" style={{ color }} />;
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <Ticket className="w-4 h-4 text-purple-600" />
            </div>
            <h2 className="text-lg font-heading font-extrabold text-gray-900 tracking-tight">
              Gestión de Entradas & Trazabilidad de Ventas
            </h2>
          </div>
          <p className="text-xs text-gray-500 max-w-2xl">
            Administra los tipos de boletas del evento, modifica precios, cupos en Firestore y monitorea en tiempo real los clics e intentos de compra inconclusos.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">

          <button
            onClick={handleOpenCreateTicket}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-heading text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Boleta</span>
          </button>
        </div>
      </div>

      {/* Analytics & Traceability Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Card 1: Total Intentions / Clicks */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <MousePointer className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Intenciones (Clics)</span>
            <span className="text-2xl font-heading font-black text-gray-900">{totalClicks}</span>
            <span className="text-[10px] text-gray-400 block">Presionaron "Comprar"</span>
          </div>
        </div>

        {/* Card 2: Device Breakdown */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
            <Monitor className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Dispositivos</span>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 mt-1">
              <span className="flex items-center gap-1 text-[11px]"><Smartphone className="w-3 h-3 text-purple-500" /> {deviceCounts['Móvil'] || 0}</span>
              <span className="flex items-center gap-1 text-[11px]"><Monitor className="w-3 h-3 text-blue-500" /> {deviceCounts['Desktop'] || 0}</span>
              <span className="flex items-center gap-1 text-[11px]"><Tablet className="w-3 h-3 text-emerald-500" /> {deviceCounts['Tablet'] || 0}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Tendency Chart */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <h3 className="font-heading font-bold text-gray-900 text-sm">
              Comparativa de Intenciones de Compra
            </h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-1 bg-gray-100 p-1 rounded-xl">
            {[
              { id: '30s', label: '30 Seg' },
              { id: '60s', label: '1 Min' },
              { id: '10m', label: '10 Min' },
              { id: '1h', label: '1 Hora' },
              { id: '24h', label: '24 Horas' },
              { id: 'all', label: 'Histórico' }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setChartTimeFilter(filter.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  chartTimeFilter === filter.id 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {chartData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <CartesianGrid stroke="#f3f4f6" strokeDasharray="4 4" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#6b7280' }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#6b7280' }} 
                  allowDecimals={false} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '8px 12px' }}
                  itemStyle={{ fontWeight: 'bold', fontSize: '13px' }}
                  labelStyle={{ color: '#6b7280', marginBottom: '4px', fontSize: '12px' }}
                />
                {uniqueChartTicketIds.map((tId, index) => (
                  <Line 
                    key={tId}
                    type="monotone" 
                    dataKey={tId} 
                    name={getTicketName(tId)}
                    stroke={getTicketColor(tId, index)} 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: getTicketColor(tId, index), strokeWidth: 0 }} 
                    activeDot={{ r: 6, strokeWidth: 0 }} 
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 w-full flex items-center justify-center flex-col gap-2">
            <Database className="w-8 h-8 text-gray-300" />
            <p className="text-sm text-gray-500 font-medium">No hay datos en este rango de tiempo</p>
          </div>
        )}
      </div>

      {/* Search & Actions Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <input
          type="text"
          placeholder="Buscar boleta por nombre, ID o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-80 px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
        />
        <span className="text-xs text-gray-500 font-medium">
          {filteredTickets.length} de {tickets.length} entradas registradas
        </span>
      </div>

      {/* Tickets Grid */}
      {loadingTickets ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-gray-500 font-medium">Cargando boletas desde Firestore...</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
          <Ticket className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-sm font-bold text-gray-800">No se encontraron boletas en Firestore</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Puedes hacer clic en "Crear Boleta" para comenzar a configurar las entradas del evento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTickets.map((ticket) => {
            const pctRemaining = Math.round((ticket.remainingAvailable / ticket.totalAvailable) * 100);
            return (
              <div 
                key={ticket.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-xs ${
                  ticket.activo !== false ? 'border-gray-200 hover:border-purple-300' : 'border-gray-200 opacity-60 bg-gray-50/80'
                }`}
              >
                {/* Header info */}
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                        style={{ backgroundColor: `${ticket.color || '#4c29b6'}15`, borderColor: `${ticket.color || '#4c29b6'}30` }}
                      >
                        {getIconComponent(ticket.iconName, ticket.color || '#4c29b6')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-heading font-bold text-gray-900 text-base">{ticket.name}</h3>
                          {ticket.popular && (
                            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-extrabold uppercase tracking-wider">
                              Recomendada
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 font-mono">ID: {ticket.id}</span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      ticket.activo !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {ticket.activo !== false ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600">{ticket.subtitle}</p>

                  {/* Pricing & Availability */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-heading font-black text-gray-900">
                        {ticket.price}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">{ticket.currency} {ticket.period}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-500 font-medium">Disponibilidad</span>
                        <span className="font-bold text-gray-800">
                          {ticket.remainingAvailable} de {ticket.totalAvailable} cupos
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${100 - pctRemaining}%`,
                            backgroundColor: ticket.color || '#4c29b6'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Features sample */}
                  {Array.isArray(ticket.features) && ticket.features.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Incluye:</span>
                      <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                        {ticket.features.slice(0, 3).map((f, i) => (
                          <li key={i} className="truncate">{f}</li>
                        ))}
                        {ticket.features.length > 3 && (
                          <li className="text-purple-600 font-semibold list-none">+ {ticket.features.length - 3} beneficios más</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Wompi link preview */}
                  <div className="flex items-center gap-1.5 text-xs text-blue-600 truncate font-mono pt-1">
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    <a href={ticket.checkoutUrl} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                      {ticket.checkoutUrl || 'Sin enlace de checkout'}
                    </a>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleTicketStatus(ticket)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      ticket.activo !== false
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{ticket.activo !== false ? 'Desactivar' : 'Activar'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditTicket(ticket)}
                      className="p-2 rounded-xl bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 transition-colors cursor-pointer"
                      title="Editar Boleta"
                    >
                      <Edit2 className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteTicket(ticket)}
                      className="p-2 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-gray-200 hover:border-red-200 transition-colors cursor-pointer"
                      title="Eliminar Boleta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Telemetry Traceability Log Recent Clicks Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MousePointer className="w-4 h-4 text-purple-600" />
            <h3 className="font-heading font-bold text-gray-900 text-sm">
              Últimos Clics e Intenciones de Compra Registrados
            </h3>
          </div>
          <span className="text-xs text-gray-500 font-mono">
            {checkoutClickLogs.length} registros capturados
          </span>
        </div>

        {checkoutClickLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">
            No se han registrado intenciones de compra aún. Los clics en "Comprar boleta" aparecerán aquí en tiempo real.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[11px] font-heading font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                  <th className="py-3 px-4">Fecha / Hora</th>
                  <th className="py-3 px-4">Boleta</th>
                  <th className="py-3 px-4">Usuario / Correo</th>
                  <th className="py-3 px-4">Dispositivo / SO</th>
                  <th className="py-3 px-4">Pantalla</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {checkoutClickLogs.slice(0, 10).map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                      {new Date(log.fecha).toLocaleString('es-CO')}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {log.metadata?.ticketName || log.message}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {log.userEmail || 'Visitante Anónimo'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold">
                        {log.metadata?.deviceType || 'Desktop'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                      {log.metadata?.screenWidth ? `${log.metadata.screenWidth}x${log.metadata.screenHeight}` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
