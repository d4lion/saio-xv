import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Phone, 
  Mail, 
  Calendar, 
  UserCheck, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Lock, 
  AlertTriangle, 
  Sparkles, 
  Download, 
  RefreshCw, 
  X, 
  Edit3, 
  Check, 
  MessageCircle, 
  ExternalLink,
  Filter,
  Eye,
  ShieldCheck,
  PhoneCall
} from 'lucide-react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { 
  accreditationService, 
  formatWhatsAppUrl, 
  formatCallUrl 
} from '../../services/accreditationService';
import Pagination from '../../components/Pagination';

export default function AccreditationFollowUpTab({ currentStaff, onOpenAccreditDirect }) {
  const [attendees, setAttendees] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('sin_ingresar'); // default to 'sin_ingresar' for immediate follow-up!
  const [ticketFilter, setTicketFilter] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Selected Attendee Modal for Details & Phone Edit
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [editingPhone, setEditingPhone] = useState('');
  const [isSavingPhone, setIsSavingPhone] = useState(false);
  const [isProcessingAccreditation, setIsProcessingAccreditation] = useState(false);

  // Fetch attendees with full accreditation evaluations
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await accreditationService.getAllAttendeesWithStatus();
      setAttendees(res.attendees);
      setSummary(res.summary);
    } catch (err) {
      console.error('Error cargando asistentes para seguimiento:', err);
      toast.error('No se pudo cargar la lista de asistentes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered attendees
  const filteredAttendees = useMemo(() => {
    return attendees.filter(att => {
      // 1. Search Query
      const q = searchTerm.toLowerCase().trim();
      const matchSearch = !q || (
        (att.nombre || '').toLowerCase().includes(q) ||
        (att.correo || '').toLowerCase().includes(q) ||
        (att.email || '').toLowerCase().includes(q) ||
        (att.cedula || '').toLowerCase().includes(q) ||
        (att.telefono || '').toLowerCase().includes(q) ||
        (att.boleta || '').toLowerCase().includes(q)
      );

      // 2. Ticket Filter
      const matchTicket = ticketFilter === 'all' || (
        ticketFilter === 'orbita' && (att.boleta || '').toLowerCase().includes('orbita')
      ) || (
        ticketFilter === 'supernova' && (att.boleta || '').toLowerCase().includes('supernova')
      ) || (
        ticketFilter === 'estrella_fugaz' && (att.boleta || '').toLowerCase().includes('estrella fugaz')
      ) || (
        ticketFilter === 'cortesia' && (att.boleta || '').toLowerCase().includes('cortes')
      );

      // 3. Status Filter
      let matchStatus = true;
      if (statusFilter === 'sin_ingresar') {
        matchStatus = att.hasNotAttended;
      } else if (statusFilter === 'ingreso_al_menos_uno') {
        matchStatus = att.hasAttendedAny;
      } else if (statusFilter === 'dia1_ingreso') {
        matchStatus = att.hasAttendedDia1;
      } else if (statusFilter === 'dia1_pendiente') {
        matchStatus = !att.hasAttendedDia1;
      } else if (statusFilter === 'dia2_ingreso') {
        matchStatus = att.hasAttendedDia2;
      } else if (statusFilter === 'dia2_pendiente') {
        matchStatus = !att.hasAttendedDia2;
      } else if (statusFilter === 'ambos_dias') {
        matchStatus = att.hasAttendedBoth;
      }

      return matchSearch && matchTicket && matchStatus;
    });
  }, [attendees, searchTerm, statusFilter, ticketFilter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, ticketFilter]);

  // Paginated items
  const totalPages = Math.ceil(filteredAttendees.length / itemsPerPage);
  const paginatedAttendees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAttendees.slice(start, start + itemsPerPage);
  }, [filteredAttendees, currentPage, itemsPerPage]);

  // Open detail modal
  const handleOpenDetail = (att) => {
    setSelectedAttendee(att);
    setEditingPhone(att.telefono || '');
  };

  // Save phone number
  const handleSavePhone = async () => {
    if (!selectedAttendee) return;
    try {
      setIsSavingPhone(true);
      await accreditationService.updateAttendeePhone({
        attendeeUid: selectedAttendee.uid || selectedAttendee.id,
        phone: editingPhone
      });

      // Update state locally
      setAttendees(prev => prev.map(a => {
        if ((a.uid && a.uid === selectedAttendee.uid) || (a.id && a.id === selectedAttendee.id)) {
          return { ...a, telefono: editingPhone };
        }
        return a;
      }));

      setSelectedAttendee(prev => ({ ...prev, telefono: editingPhone }));
      toast.success('Teléfono actualizado correctamente.');
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar el teléfono.');
    } finally {
      setIsSavingPhone(false);
    }
  };

  // Direct accreditation from modal
  const handleAccreditFromModal = async (dayKey) => {
    if (!selectedAttendee) return;
    const isEstrellaFugaz = selectedAttendee.evaluation?.ticketRules?.isEstrellaFugaz;
    const dayLabel = dayKey === 'dia1' ? 'Día 1 (15/10/2025)' : 'Día 2 (16/10/2025)';
    const otherDayLabel = dayKey === 'dia1' ? 'Día 2 (16/10/2025)' : 'Día 1 (15/10/2025)';

    const confirm = await Swal.fire({
      icon: isEstrellaFugaz ? 'warning' : 'question',
      title: isEstrellaFugaz ? '⚠️ Atención: Boleta Estrella Fugaz' : '¿Confirmar Ingreso?',
      html: `
        <div class="text-left text-sm space-y-2">
          <p>Registrar entrada para <b>${selectedAttendee.nombre}</b> al <b>${dayLabel}</b>.</p>
          ${isEstrellaFugaz ? `<p class="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs font-semibold">🚨 Esta boleta es de 1 SOLO DÍA. Confirmar dejará el ${otherDayLabel} BLOQUEADO.</p>` : ''}
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Confirmar Ingreso',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: isEstrellaFugaz ? '#d97706' : '#2563eb'
    });

    if (!confirm.isConfirmed) return;

    try {
      setIsProcessingAccreditation(true);
      const res = await accreditationService.registerAccreditation({
        attendeeUid: selectedAttendee.uid || selectedAttendee.id,
        dayKey,
        staffUser: currentStaff
      });

      // Update in attendee list
      setAttendees(prev => prev.map(a => {
        if ((a.uid && a.uid === res.updatedUser.uid) || (a.id && a.id === res.updatedUser.id)) {
          return {
            ...a,
            ...res.updatedUser,
            evaluation: res.evaluation,
            hasAttendedDia1: Boolean(res.evaluation.dia1.acreditado),
            hasAttendedDia2: Boolean(res.evaluation.dia2.acreditado),
            hasAttendedAny: true,
            hasAttendedBoth: Boolean(res.evaluation.dia1.acreditado && res.evaluation.dia2.acreditado),
            hasNotAttended: false
          };
        }
        return a;
      }));

      setSelectedAttendee(prev => ({
        ...prev,
        ...res.updatedUser,
        evaluation: res.evaluation
      }));

      toast.success(`¡Ingreso registrado para el ${dayLabel}!`);
      loadData();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'No se pudo acreditar',
        text: err.message || 'Error registrando entrada.'
      });
    } finally {
      setIsProcessingAccreditation(false);
    }
  };

  // Export filtered attendees to CSV
  const handleExportCSV = () => {
    if (filteredAttendees.length === 0) {
      toast.info('No hay asistentes en la vista actual para exportar.');
      return;
    }

    const headers = [
      'Nombre',
      'Cedula',
      'Correo',
      'Telefono',
      'Boleta',
      'Estado_Dia1_15_10',
      'Fecha_Ingreso_Dia1',
      'Estado_Dia2_16_10',
      'Fecha_Ingreso_Dia2',
      'Estado_General'
    ];

    const rows = filteredAttendees.map(a => {
      const d1 = a.evaluation?.dia1;
      const d2 = a.evaluation?.dia2;
      return [
        `"${(a.nombre || '').replace(/"/g, '""')}"`,
        `"${a.cedula || ''}"`,
        `"${a.correo || a.email || ''}"`,
        `"${a.telefono || ''}"`,
        `"${(a.boleta || 'No determinado').replace(/"/g, '""')}"`,
        `"${d1?.status || 'PENDIENTE'}"`,
        `"${d1?.record?.fechaFormateada || ''}"`,
        `"${d2?.status || 'PENDIENTE'}"`,
        `"${d2?.record?.fechaFormateada || ''}"`,
        `"${a.generalStatusLabel || ''}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `asistencia_saioxv_${statusFilter}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Reporte CSV descargado con éxito.');
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto">
      
      {/* ── Top Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-black text-gray-900 tracking-tight">
                Análisis y Seguimiento de Asistencia
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Monitorea asistentes ausentes, realiza llamadas o envía mensajes de WhatsApp para coordinar su ingreso.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            title="Recargar datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-heading font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* ── Analytics KPI Cards ── */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Sin Ingresar (Ausentes - Principal objetivo) */}
          <div 
            onClick={() => setStatusFilter('sin_ingresar')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
              statusFilter === 'sin_ingresar'
                ? 'bg-amber-500/10 border-amber-400 ring-2 ring-amber-500/30 shadow-sm'
                : 'bg-white border-amber-200 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between text-amber-800 text-xs font-bold uppercase tracking-wider">
              <span>Sin Ingresar (Ausentes)</span>
              <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-heading font-black text-amber-900 font-mono">
                {summary.notAttendedCount}
              </span>
              <span className="text-xs text-amber-700 font-bold">
                ({summary.notAttendedPct}%)
              </span>
            </div>
            <p className="text-[11px] text-amber-800/80 mt-1 font-medium">
              Asistentes que no han llegado a ninguna jornada. ¡Listos para llamar!
            </p>
          </div>

          {/* Card 2: Asistencia Global */}
          <div 
            onClick={() => setStatusFilter('ingreso_al_menos_uno')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'ingreso_al_menos_uno'
                ? 'bg-emerald-500/10 border-emerald-400 ring-2 ring-emerald-500/30 shadow-sm'
                : 'bg-white border-emerald-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <span>Han Asistido (≥ 1 Día)</span>
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-heading font-black text-emerald-900 font-mono">
                {summary.attendedAnyCount}
              </span>
              <span className="text-xs text-emerald-700 font-bold">
                ({summary.attendedAnyPct}%)
              </span>
            </div>
            <div className="w-full bg-emerald-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${summary.attendedAnyPct}%` }}
              />
            </div>
          </div>

          {/* Card 3: Asistencia Día 1 (15/10/2025) */}
          <div 
            onClick={() => setStatusFilter('dia1_ingreso')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'dia1_ingreso'
                ? 'bg-blue-500/10 border-blue-400 ring-2 ring-blue-500/30 shadow-sm'
                : 'bg-white border-blue-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between text-blue-800 text-xs font-bold uppercase tracking-wider">
              <span>Día 1 (15/10/2025)</span>
              <Calendar className="w-4.5 h-4.5 text-blue-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-heading font-black text-blue-900 font-mono">
                {summary.attendedDia1Count}
              </span>
              <span className="text-xs text-blue-700 font-bold">
                ({summary.dia1Pct}%)
              </span>
            </div>
            <p className="text-[11px] text-blue-800/80 mt-1 font-medium">
              {summary.total - summary.attendedDia1Count} pendientes por ingresar
            </p>
          </div>

          {/* Card 4: Asistencia Día 2 (16/10/2025) */}
          <div 
            onClick={() => setStatusFilter('dia2_ingreso')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'dia2_ingreso'
                ? 'bg-purple-500/10 border-purple-400 ring-2 ring-purple-500/30 shadow-sm'
                : 'bg-white border-purple-200 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center justify-between text-purple-800 text-xs font-bold uppercase tracking-wider">
              <span>Día 2 (16/10/2025)</span>
              <Calendar className="w-4.5 h-4.5 text-purple-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-heading font-black text-purple-900 font-mono">
                {summary.attendedDia2Count}
              </span>
              <span className="text-xs text-purple-700 font-bold">
                ({summary.dia2Pct}%)
              </span>
            </div>
            <p className="text-[11px] text-purple-800/80 mt-1 font-medium">
              {summary.total - summary.attendedDia2Count} pendientes por ingresar
            </p>
          </div>

        </div>
      )}

      {/* ── Filters & Search Toolbar ── */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        
        {/* Search & Ticket Select */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4.5 h-4.5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, cédula, teléfono, correo o boleta..."
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 hover:bg-white focus:bg-white border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 rounded-xl text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400"
            />
          </div>

          <div>
            <select
              value={ticketFilter}
              onChange={(e) => setTicketFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 hover:bg-white focus:bg-white border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-700 outline-none transition-all cursor-pointer"
            >
              <option value="all">Todas las Boletas</option>
              <option value="orbita">Boleta Órbita</option>
              <option value="supernova">Boleta Supernova</option>
              <option value="estrella_fugaz">Boleta Estrella Fugaz (1 Día)</option>
              <option value="cortesia">Boleta Cortesía</option>
            </select>
          </div>
        </div>

        {/* Status Pill Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-150">
          <span className="text-[11px] font-heading font-extrabold uppercase tracking-wider text-gray-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Estado:
          </span>

          {[
            { id: 'sin_ingresar', label: 'Sin Ingresar (Ausentes)', color: 'bg-amber-100 text-amber-900 border-amber-300' },
            { id: 'all', label: 'Todos', color: 'bg-gray-100 text-gray-800 border-gray-300' },
            { id: 'dia1_ingreso', label: 'Ingresaron Día 1 (15/10)', color: 'bg-blue-100 text-blue-900 border-blue-300' },
            { id: 'dia1_pendiente', label: 'Pendientes Día 1', color: 'bg-gray-100 text-gray-700 border-gray-200' },
            { id: 'dia2_ingreso', label: 'Ingresaron Día 2 (16/10)', color: 'bg-purple-100 text-purple-900 border-purple-300' },
            { id: 'dia2_pendiente', label: 'Pendientes Día 2', color: 'bg-gray-100 text-gray-700 border-gray-200' },
            { id: 'ambos_dias', label: 'Asistieron Ambos Días', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer border ${
                statusFilter === f.id
                  ? `${f.color} shadow-xs scale-102`
                  : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

      </div>

      {/* ── Attendees Follow-up Table ── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        
        <div className="p-4 sm:p-5 border-b border-gray-150 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-black text-sm text-gray-900 uppercase tracking-wider">
              Listado de Asistentes y Contacto
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {filteredAttendees.length} resultados
            </span>
          </div>

          <span className="text-xs text-gray-500 font-medium hidden sm:inline">
            Haz clic en los botones de llamada o WhatsApp para seguimiento directo
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-heading font-bold text-[10px] tracking-wider">
                <th className="px-5 py-3.5">Asistente</th>
                <th className="px-5 py-3.5">Cédula</th>
                <th className="px-5 py-3.5">Entrada</th>
                <th className="px-5 py-3.5">Día 1 (15/10)</th>
                <th className="px-5 py-3.5">Día 2 (16/10)</th>
                <th className="px-5 py-3.5 text-center">Acciones de Contacto</th>
                <th className="px-5 py-3.5 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-500 font-medium">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    Cargando análisis de asistencia...
                  </td>
                </tr>
              ) : paginatedAttendees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-400 font-medium">
                    No se encontraron asistentes con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                paginatedAttendees.map((att) => {
                  const d1 = att.evaluation?.dia1;
                  const d2 = att.evaluation?.dia2;
                  const ticketRules = att.evaluation?.ticketRules;
                  const waUrl = formatWhatsAppUrl(att.telefono, att.nombre, att.boleta);
                  const telUrl = formatCallUrl(att.telefono);

                  return (
                    <tr key={att.uid || att.id || att.cedula} className="hover:bg-gray-50/80 transition-colors">
                      
                      {/* Asistente */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-heading font-bold text-xs flex items-center justify-center shrink-0">
                            {att.nombre ? att.nombre.charAt(0).toUpperCase() : 'A'}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-sm">
                              {att.nombre || 'Sin nombre'}
                            </div>
                            <div className="text-[11px] text-gray-500">
                              {att.correo || att.email || 'Sin correo'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Cédula */}
                      <td className="px-5 py-3.5 font-mono text-gray-700 font-medium">
                        {att.cedula || 'N/A'}
                      </td>

                      {/* Boleta */}
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border inline-block ${ticketRules?.badgeBg || 'bg-gray-100 text-gray-800'}`}>
                          {att.boleta || 'No determinado'}
                        </span>
                        {ticketRules?.isEstrellaFugaz && (
                          <span className="block text-[10px] text-amber-700 font-bold mt-0.5">
                            ★ Solo 1 día
                          </span>
                        )}
                      </td>

                      {/* Día 1 */}
                      <td className="px-5 py-3.5">
                        {d1?.status === 'ACREDITADO' ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Ingresó</span>
                          </div>
                        ) : d1?.status === 'BLOQUEADO' ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-red-50 text-red-800 border border-red-200" title={d1.reason}>
                            <Lock className="w-3.5 h-3.5 text-red-600" />
                            <span>Bloqueado</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span>Pendiente</span>
                          </div>
                        )}
                      </td>

                      {/* Día 2 */}
                      <td className="px-5 py-3.5">
                        {d2?.status === 'ACREDITADO' ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Ingresó</span>
                          </div>
                        ) : d2?.status === 'BLOQUEADO' ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-red-50 text-red-800 border border-red-200" title={d2.reason}>
                            <Lock className="w-3.5 h-3.5 text-red-600" />
                            <span>Bloqueado</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span>Pendiente</span>
                          </div>
                        )}
                      </td>

                      {/* Contacto Directo (Llamada + WhatsApp) */}
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          
                          {/* Llamar por teléfono */}
                          {telUrl ? (
                            <a
                              href={telUrl}
                              className="p-2 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white transition-all shadow-xs flex items-center justify-center cursor-pointer"
                              title={`Llamar a ${att.nombre}: ${att.telefono}`}
                            >
                              <PhoneCall className="w-4 h-4" />
                            </a>
                          ) : (
                            <button
                              onClick={() => handleOpenDetail(att)}
                              className="p-2 rounded-xl bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                              title="Sin teléfono registrado. Haz clic para agregar."
                            >
                              <Phone className="w-4 h-4" />
                            </button>
                          )}

                          {/* WhatsApp Directo con mensaje predeterminado */}
                          {waUrl ? (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white transition-all shadow-xs flex items-center justify-center cursor-pointer"
                              title={`Abrir chat de WhatsApp con ${att.nombre}`}
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          ) : (
                            <button
                              onClick={() => handleOpenDetail(att)}
                              className="p-2 rounded-xl bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                              title="Sin número de WhatsApp. Haz clic para agregar."
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Correo Electrónico */}
                          {(att.correo || att.email) && (
                            <a
                              href={`mailto:${att.correo || att.email}?subject=Bienvenido a SAIO-XV - Información de Ingreso`}
                              className="p-2 rounded-xl bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white transition-all shadow-xs flex items-center justify-center cursor-pointer"
                              title={`Enviar correo a ${att.correo || att.email}`}
                            >
                              <Mail className="w-4 h-4" />
                            </a>
                          )}

                        </div>
                      </td>

                      {/* Ver Ficha / Detalle */}
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleOpenDetail(att)}
                          className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-700 font-semibold cursor-pointer transition-all duration-200 text-xs inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ficha</span>
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-150 flex justify-between items-center bg-gray-50/50">
            <span className="text-xs text-gray-500 font-medium">
              Página {currentPage} de {totalPages}
            </span>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

      </div>

      {/* ── Attendee Detail / Quick Call & Accredit Modal ── */}
      {selectedAttendee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50/40 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black font-heading text-lg flex items-center justify-center shadow-md shadow-blue-500/20">
                  {selectedAttendee.nombre ? selectedAttendee.nombre.charAt(0).toUpperCase() : 'A'}
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-gray-900 leading-tight">
                    {selectedAttendee.nombre || 'Asistente'}
                  </h3>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">
                    CC: {selectedAttendee.cedula || 'N/A'} • {selectedAttendee.correo || selectedAttendee.email}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedAttendee(null)}
                className="p-2 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Ticket Info Card */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Tipo de Boleta</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider inline-block mt-1 ${selectedAttendee.evaluation?.ticketRules?.badgeBg}`}>
                    {selectedAttendee.boleta || 'No determinado'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Acceso Permitido</span>
                  <span className="text-xs font-extrabold text-gray-800">
                    {selectedAttendee.evaluation?.ticketRules?.maxDaysAllowed === 1 ? '1 Solo Día' : 'Ambos Días (15 y 16/10)'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Puntos</span>
                  <span className="text-xs font-extrabold text-blue-600 font-mono">
                    {selectedAttendee.puntos || 0} PTS
                  </span>
                </div>
              </div>

              {/* Phone Editing & Direct Contact */}
              <div className="p-4.5 rounded-2xl border border-gray-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-blue-600" />
                    Contacto Telefónico y WhatsApp
                  </h4>
                  <span className="text-[11px] text-gray-400">Canal directo de seguimiento</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={editingPhone}
                    onChange={(e) => setEditingPhone(e.target.value)}
                    placeholder="Ingresa número de celular (ej: 3001234567)..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-xs font-mono font-bold text-gray-900 outline-none"
                  />
                  <button
                    onClick={handleSavePhone}
                    disabled={isSavingPhone}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-heading font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingPhone ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Guardar</span>
                  </button>
                </div>

                {/* Direct Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {formatCallUrl(editingPhone) ? (
                    <a
                      href={formatCallUrl(editingPhone)}
                      className="py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-blue-200 shadow-xs cursor-pointer"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>Llamar Ahora</span>
                    </a>
                  ) : (
                    <button
                      disabled
                      className="py-2.5 px-4 rounded-xl bg-gray-100 text-gray-400 font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed opacity-60"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Sin Teléfono</span>
                    </button>
                  )}

                  {formatWhatsAppUrl(editingPhone, selectedAttendee.nombre, selectedAttendee.boleta) ? (
                    <a
                      href={formatWhatsAppUrl(editingPhone, selectedAttendee.nombre, selectedAttendee.boleta)}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp Directo</span>
                    </a>
                  ) : (
                    <button
                      disabled
                      className="py-2.5 px-4 rounded-xl bg-gray-100 text-gray-400 font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed opacity-60"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Sin WhatsApp</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Day 1 & Day 2 Status & On-the-spot Accreditation */}
              <div className="space-y-3">
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  Estado y Registro de Entrada
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Día 1 */}
                  <div className={`p-4 rounded-2xl border ${
                    selectedAttendee.evaluation?.dia1?.status === 'ACREDITADO'
                      ? 'bg-emerald-50/70 border-emerald-300'
                      : selectedAttendee.evaluation?.dia1?.status === 'BLOQUEADO'
                      ? 'bg-gray-100 border-gray-300 opacity-70'
                      : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-gray-900">Día 1 (15/10/2025)</span>
                      {selectedAttendee.evaluation?.dia1?.status === 'ACREDITADO' ? (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Acreditado
                        </span>
                      ) : selectedAttendee.evaluation?.dia1?.status === 'BLOQUEADO' ? (
                        <span className="text-[10px] font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded-full">
                          Bloqueado
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          Pendiente
                        </span>
                      )}
                    </div>

                    {selectedAttendee.evaluation?.dia1?.status === 'ACREDITADO' ? (
                      <p className="text-[11px] text-emerald-700 font-mono mt-1">
                        Hora: {selectedAttendee.evaluation?.dia1?.record?.fechaFormateada || 'Registrado'}
                      </p>
                    ) : selectedAttendee.evaluation?.dia1?.status === 'BLOQUEADO' ? (
                      <p className="text-[11px] text-red-700 mt-1">
                        Bloqueado por restricción de Boleta Estrella Fugaz.
                      </p>
                    ) : (
                      <button
                        onClick={() => handleAccreditFromModal('dia1')}
                        disabled={isProcessingAccreditation}
                        className="w-full mt-3 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-colors"
                      >
                        Acreditar Día 1 Ahora
                      </button>
                    )}
                  </div>

                  {/* Día 2 */}
                  <div className={`p-4 rounded-2xl border ${
                    selectedAttendee.evaluation?.dia2?.status === 'ACREDITADO'
                      ? 'bg-emerald-50/70 border-emerald-300'
                      : selectedAttendee.evaluation?.dia2?.status === 'BLOQUEADO'
                      ? 'bg-gray-100 border-gray-300 opacity-70'
                      : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-gray-900">Día 2 (16/10/2025)</span>
                      {selectedAttendee.evaluation?.dia2?.status === 'ACREDITADO' ? (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Acreditado
                        </span>
                      ) : selectedAttendee.evaluation?.dia2?.status === 'BLOQUEADO' ? (
                        <span className="text-[10px] font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded-full">
                          Bloqueado
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          Pendiente
                        </span>
                      )}
                    </div>

                    {selectedAttendee.evaluation?.dia2?.status === 'ACREDITADO' ? (
                      <p className="text-[11px] text-emerald-700 font-mono mt-1">
                        Hora: {selectedAttendee.evaluation?.dia2?.record?.fechaFormateada || 'Registrado'}
                      </p>
                    ) : selectedAttendee.evaluation?.dia2?.status === 'BLOQUEADO' ? (
                      <p className="text-[11px] text-red-700 mt-1">
                        Bloqueado por restricción de Boleta Estrella Fugaz.
                      </p>
                    ) : (
                      <button
                        onClick={() => handleAccreditFromModal('dia2')}
                        disabled={isProcessingAccreditation}
                        className="w-full mt-3 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer transition-colors"
                      >
                        Acreditar Día 2 Ahora
                      </button>
                    )}
                  </div>

                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedAttendee(null)}
                className="px-5 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-heading font-bold uppercase tracking-wider cursor-pointer transition-colors"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
