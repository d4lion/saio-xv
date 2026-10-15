import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Search, 
  QrCode, 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Lock, 
  Calendar, 
  User, 
  Mail, 
  CreditCard, 
  RefreshCw, 
  X, 
  FlipHorizontal, 
  ScanLine, 
  Sparkles, 
  Zap, 
  ShieldAlert, 
  RotateCcw, 
  Check, 
  Ticket,
  Users,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { createPortal } from 'react-dom';
import { Html5Qrcode } from 'html5-qrcode';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';
import { 
  accreditationService, 
  evaluateAccreditationStatus 
} from '../../services/accreditationService';
import AccreditationFollowUpTab from './AccreditationFollowUpTab';

export default function AccreditationTab() {
  const { user: currentStaff } = useAuth();

  // Subpanel state: 'scanner' (Acreditación en Puerta) | 'followup' (Análisis y Seguimiento)
  const [activeSubTab, setActiveSubTab] = useState('scanner');

  // Search & Attendee states
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundUser, setFoundUser] = useState(null);
  const [evaluation, setEvaluation] = useState(null);

  // Action states
  const [isProcessing, setIsProcessing] = useState(false);

  // Statistics & History
  const [stats, setStats] = useState({
    totalAsistentes: 0,
    dia1Count: 0,
    dia2Count: 0,
    estrellaFugazTotal: 0,
    estrellaFugazAccredited: 0
  });
  const [recentLogs, setRecentLogs] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);

  // QR Scanner States
  const [showScanner, setShowScanner] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [activeCameraIndex, setActiveCameraIndex] = useState(0);
  const [scannerReady, setScannerReady] = useState(false);
  const scannerRef = useRef(null);
  const isScanningRef = useRef(false);

  // Load stats and recent logs on mount
  const refreshStatsAndLogs = useCallback(async () => {
    try {
      setLoadingStats(true);
      const [newStats, logs] = await Promise.all([
        accreditationService.getStats(),
        accreditationService.getRecentAccreditations(15)
      ]);
      setStats(newStats);
      setRecentLogs(logs);
    } catch (err) {
      console.warn('Error refrescando estadísticas de acreditación:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    refreshStatsAndLogs();
  }, [refreshStatsAndLogs]);

  // Update evaluation whenever foundUser changes
  useEffect(() => {
    if (foundUser) {
      setEvaluation(evaluateAccreditationStatus(foundUser));
    } else {
      setEvaluation(null);
    }
  }, [foundUser]);

  // ── QR Scanner Logic ──
  const stopScanner = useCallback(async () => {
    if (scannerRef.current && isScanningRef.current) {
      try { 
        await scannerRef.current.stop(); 
      } catch (_) {}
      isScanningRef.current = false;
    }
  }, []);

  const startScanner = useCallback(async (cameraId) => {
    if (!scannerRef.current) return;
    await stopScanner();
    try {
      await scannerRef.current.start(
        cameraId,
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        async (decodedText) => {
          await stopScanner();
          setShowScanner(false);
          const rawCode = decodedText.trim();
          setSearchQuery(rawCode);
          handleSearchDirect(rawCode);
        },
        () => {}
      );
      isScanningRef.current = true;
      setScannerReady(true);
    } catch (err) {
      console.error(err);
      toast.error('No se pudo iniciar la cámara para acreditación.');
    }
  }, [stopScanner]);

  useEffect(() => {
    if (!showScanner) {
      stopScanner();
      setScannerReady(false);
      return;
    }

    const el = document.getElementById('accreditation-qr-reader');
    if (!el) return;

    scannerRef.current = new Html5Qrcode('accreditation-qr-reader', { verbose: false });
    Html5Qrcode.getCameras().then((devices) => {
      if (devices && devices.length > 0) {
        setCameras(devices);
        const rearIdx = devices.findIndex(d => /back|rear|trasera|environment/i.test(d.label));
        const defaultIdx = rearIdx >= 0 ? rearIdx : 0;
        setActiveCameraIndex(defaultIdx);
        startScanner(devices[defaultIdx].id);
      } else {
        toast.error('No se detectaron cámaras en este dispositivo.');
        setShowScanner(false);
      }
    }).catch(err => {
      console.error(err);
      toast.error('Error accediendo a los permisos de cámara.');
      setShowScanner(false);
    });

    return () => {
      stopScanner().then(() => { scannerRef.current = null; });
    };
  }, [showScanner, stopScanner, startScanner]);

  const handleSwitchCamera = async () => {
    if (cameras.length < 2) return;
    const nextIdx = (activeCameraIndex + 1) % cameras.length;
    setActiveCameraIndex(nextIdx);
    setScannerReady(false);
    await startScanner(cameras[nextIdx].id);
  };

  // ── Search Logic ──
  const handleSearchDirect = async (query) => {
    if (!query) return;
    try {
      setIsSearching(true);
      setFoundUser(null);
      const attendee = await accreditationService.findAttendee(query);
      if (attendee) {
        setFoundUser(attendee);
        toast.success(`Asistente encontrado: ${attendee.nombre || 'Sin nombre'}`);
      } else {
        toast.error('No se encontró ningún asistente con esa cédula, correo o código.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al consultar los datos del asistente.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error('Ingresa una cédula, correo o UID para buscar.');
      return;
    }
    handleSearchDirect(searchQuery.trim());
  };

  // ── Accreditation Registration Action ──
  const handleAccredit = async (dayKey) => {
    if (!foundUser || !evaluation) return;

    const dayTarget = dayKey === 'dia1' ? evaluation.dia1 : evaluation.dia2;
    const otherDayKey = dayKey === 'dia1' ? 'dia2' : 'dia1';
    const isEstrellaFugaz = evaluation.ticketRules.isEstrellaFugaz;

    // Validación previa
    if (dayTarget.status === 'ACREDITADO') {
      toast.info(`El asistente ya fue acreditado para el ${dayTarget.dateLabel}.`);
      return;
    }

    if (dayTarget.status === 'BLOQUEADO') {
      await Swal.fire({
        icon: 'error',
        title: '⛔ ACCESO DENEGADO',
        text: dayTarget.reason || 'Este día se encuentra bloqueado para el tipo de entrada del asistente.',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    // Modal de confirmación especializado
    let confirmResult;
    if (isEstrellaFugaz) {
      // Advertencia crítica: Estrella Fugaz solo permite 1 día
      confirmResult = await Swal.fire({
        icon: 'warning',
        title: '⚠️ ATENCIÓN: BOLETA ESTRELLA FUGAZ',
        html: `
          <div class="text-left text-sm space-y-3">
            <p class="font-medium text-gray-800">
              Estás a punto de registrar la entrada de <b>${foundUser.nombre}</b> (CC: ${foundUser.cedula || 'N/A'}) para el:
            </p>
            <div class="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 font-bold text-center">
              📅 ${dayTarget.fullTitle} (${dayTarget.dateLabel})
            </div>
            <div class="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs leading-relaxed font-semibold">
              🚨 <b>REGLA ESTRICTA DE ACCESO:</b><br />
              La "Boleta Estrella Fugaz" es válida para <b>1 SOLO DÍA</b>. Al confirmar, el <b>${otherDayKey === 'dia1' ? 'Día 1 (15/10/2025)' : 'Día 2 (16/10/2025)'} QUEDARÁ BLOQUEADO DE FORMA PERMANENTE</b> e irrevocable.
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Sí, Registrar Entrada (1 solo día)',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#d97706',
        cancelButtonColor: '#6b7280',
        focusCancel: true
      });
    } else {
      // Normal: Órbita, Supernova o VIP (pueden ir ambos días)
      confirmResult = await Swal.fire({
        icon: 'question',
        title: '¿Registrar Entrada de Asistente?',
        html: `
          <div class="text-left text-sm space-y-2">
            <p>Registrar acceso para <b>${foundUser.nombre}</b>.</p>
            <p class="text-gray-600 text-xs">Cédula: <span class="font-mono font-bold">${foundUser.cedula || 'N/A'}</span> | Boleta: <b class="text-blue-600">${foundUser.boleta || 'N/A'}</b></p>
            <div class="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 font-bold text-center text-xs mt-2">
              📅 ${dayTarget.fullTitle} (${dayTarget.dateLabel})
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Confirmar Ingreso',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#2563eb'
      });
    }

    if (!confirmResult.isConfirmed) return;

    try {
      setIsProcessing(true);
      const res = await accreditationService.registerAccreditation({
        attendeeUid: foundUser.uid || foundUser.id,
        dayKey,
        staffUser: currentStaff
      });

      setFoundUser(res.updatedUser);
      setEvaluation(res.evaluation);

      await Swal.fire({
        icon: 'success',
        title: '¡Entrada Acreditada!',
        html: `
          <div class="text-center text-sm">
            <p class="font-bold text-gray-900">${foundUser.nombre}</p>
            <p class="text-xs text-gray-500 mt-1">Ingreso autorizado para el <b>${dayTarget.dateLabel}</b></p>
            ${isEstrellaFugaz ? '<p class="mt-3 text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium">⚠️ Se ha consumido el único día disponible de la Boleta Estrella Fugaz. El otro día ha sido bloqueado.</p>' : ''}
          </div>
        `,
        timer: 3500,
        showConfirmButton: true,
        confirmButtonText: 'Aceptar'
      });

      refreshStatsAndLogs();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error al Acreditar',
        text: err.message || 'No se pudo registrar la acreditación.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Cancel/Undo Accreditation Action (Admin only) ──
  const handleCancelAccreditation = async (dayKey) => {
    if (!foundUser) return;
    const dayLabel = dayKey === 'dia1' ? '15/10/2025' : '16/10/2025';

    const confirm = await Swal.fire({
      icon: 'warning',
      title: '¿Anular Registro de Entrada?',
      text: `Esta acción anulará la acreditación del ${dayLabel} para ${foundUser.nombre}. Se requiere justificación de auditoría.`,
      input: 'text',
      inputPlaceholder: 'Motivo de anulación (ej: error en cédula ingresada)',
      inputValidator: (val) => {
        if (!val || val.trim().length < 4) {
          return 'Debes ingresar un motivo de anulación válido.';
        }
      },
      showCancelButton: true,
      confirmButtonText: 'Anular Acreditación',
      cancelButtonText: 'Conservar',
      confirmButtonColor: '#dc2626'
    });

    if (!confirm.isConfirmed) return;

    try {
      setIsProcessing(true);
      const res = await accreditationService.cancelAccreditation({
        attendeeUid: foundUser.uid || foundUser.id,
        dayKey,
        staffUser: currentStaff,
        reason: confirm.value
      });

      setFoundUser(res.updatedUser);
      setEvaluation(res.evaluation);
      toast.success(`Acreditación del ${dayLabel} anulada exitosamente.`);
      refreshStatsAndLogs();
    } catch (err) {
      console.error(err);
      toast.error(`Error al anular: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearAttendee = () => {
    setFoundUser(null);
    setSearchQuery('');
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto pb-12">
      
      {/* ── Top Header & Description ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-black text-gray-900 tracking-tight">
                Módulo de Acreditación de Asistentes
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Logística de ingreso para las jornadas del 15/10/2025 y 16/10/2025.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshStatsAndLogs}
            disabled={loadingStats}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            title="Refrescar estadísticas"
          >
            <RefreshCw className={`w-4 h-4 ${loadingStats ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowScanner(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-heading font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>Escanear QR de Entrada</span>
          </button>
        </div>
      </div>

      {/* ── Subpanel Switcher Bar ── */}
      <div className="flex bg-gray-200/80 p-1.5 rounded-2xl max-w-xl mx-auto shadow-inner">
        <button
          type="button"
          onClick={() => setActiveSubTab('scanner')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-heading font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'scanner'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Acreditación en Puerta</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('followup')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-heading font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'followup'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Análisis & Seguimiento</span>
        </button>
      </div>

      {activeSubTab === 'followup' ? (
        <AccreditationFollowUpTab
          currentStaff={currentStaff}
          onOpenAccreditDirect={(user) => {
            setFoundUser(user);
            setActiveSubTab('scanner');
          }}
        />
      ) : (
        <>
          {/* ── Metrics / Summary Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Total Asistentes</span>
            <Users className="w-4 h-4 text-gray-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-heading font-black text-gray-900 font-mono">
              {stats.totalAsistentes}
            </span>
            <span className="text-[11px] text-gray-400 font-medium">registrados</span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-blue-600 text-xs font-semibold">
            <span>Día 1 (15/10/2025)</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-heading font-black text-blue-700 font-mono">
              {stats.dia1Count}
            </span>
            <span className="text-[11px] text-blue-600/70 font-medium">acreditados</span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-purple-600 text-xs font-semibold">
            <span>Día 2 (16/10/2025)</span>
            <Calendar className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-heading font-black text-purple-700 font-mono">
              {stats.dia2Count}
            </span>
            <span className="text-[11px] text-purple-600/70 font-medium">acreditados</span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 text-xs font-semibold">
            <span>Boletas Estrella Fugaz</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-heading font-black text-amber-800 font-mono">
              {stats.estrellaFugazAccredited} / {stats.estrellaFugazTotal}
            </span>
            <span className="text-[11px] text-amber-700/80 font-medium">acreditadas</span>
          </div>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4.5 h-4.5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por cédula (ej: 102030), correo electrónico o UID del asistente..."
              className="w-full pl-11 pr-4 py-3 bg-gray-50 hover:bg-white focus:bg-white border border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 rounded-xl text-base sm:text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isSearching}
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-heading font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isSearching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Buscando...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Buscar</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowScanner(true)}
              className="px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-heading font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-gray-200"
              title="Abrir lector de código QR"
            >
              <QrCode className="w-4 h-4 text-purple-600" />
              <span className="hidden sm:inline">Escanear</span>
            </button>
          </div>
        </form>
      </div>

      {/* ── Attendee Card & Day Verification ── */}
      {foundUser && evaluation && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden animate-fadeIn">
          
          {/* Card Top Banner */}
          <div className="p-6 bg-gradient-to-r from-gray-50 via-purple-50/40 to-white border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-black font-heading text-xl flex items-center justify-center shadow-md shadow-purple-500/20 shrink-0">
                {foundUser.nombre ? foundUser.nombre.charAt(0).toUpperCase() : <User className="w-7 h-7" />}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-heading font-black text-xl text-gray-900">
                    {foundUser.nombre || 'Asistente'}
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${evaluation.ticketRules.badgeBg}`}>
                    {evaluation.ticketRules.displayName}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-200">
                    {evaluation.ticketRules.categoryLabel}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-1.5 font-medium">
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                    <span>Cédula:</span>
                    <span className="font-mono font-bold text-gray-800">{foundUser.cedula || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span>{foundUser.correo || foundUser.email || 'N/A'}</span>
                  </div>
                  {foundUser.telefono && (
                    <div className="flex items-center gap-1">
                      <span>Tel:</span>
                      <span className="font-mono text-gray-700">{foundUser.telefono}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleClearAttendee}
              className="self-start md:self-center px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Limpiar asistente</span>
            </button>
          </div>

          <div className="p-6 space-y-6">

            {/* ── Specialized Alert Banner for Boleta Estrella Fugaz ── */}
            {evaluation.hasEstrellaFugazAlert ? (
              <div className={`p-4.5 rounded-2xl border flex items-start gap-3.5 ${
                evaluation.alertSeverity === 'error'
                  ? 'bg-red-50 border-red-300 text-red-900'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}>
                <div className={`p-2 rounded-xl shrink-0 ${
                  evaluation.alertSeverity === 'error' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading font-extrabold text-sm uppercase tracking-wider">
                    {evaluation.alertSeverity === 'error' ? 'Acceso 1 Día Superado / Restringido' : 'Control Especial: Boleta Estrella Fugaz (1 Día)'}
                  </h4>
                  <p className="text-xs leading-relaxed font-medium mt-1">
                    {evaluation.alertMessage}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-blue-900 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
                <div className="text-xs font-medium">
                  <span className="font-bold">Acceso autorizado para ambos días (15/10/2025 y 16/10/2025).</span>{' '}
                  El tipo de entrada <span className="font-semibold underline">{evaluation.ticketRules.displayName}</span> autoriza el ingreso en ambas fechas sin restricciones de exclusión.
                </div>
              </div>
            )}

            {/* ── Day 1 & Day 2 Decision Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* ── Card Día 1: 15/10/2025 ── */}
              <div className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                evaluation.dia1.status === 'ACREDITADO'
                  ? 'bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-500/20'
                  : evaluation.dia1.status === 'BLOQUEADO'
                  ? 'bg-gray-100/70 border-gray-300 opacity-80'
                  : 'bg-white border-gray-200 shadow-xs hover:border-purple-300'
              }`}>
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-800 border border-gray-200">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      DÍA 1 — 15/10/2025
                    </span>

                    {/* Status Badge */}
                    {evaluation.dia1.status === 'ACREDITADO' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Acreditado
                      </span>
                    )}
                    {evaluation.dia1.status === 'BLOQUEADO' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
                        <Lock className="w-3.5 h-3.5" />
                        Bloqueado
                      </span>
                    )}
                    {evaluation.dia1.status === 'PENDIENTE' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600">
                        Pendiente
                      </span>
                    )}
                  </div>

                  <h4 className="font-heading font-extrabold text-base text-gray-900">
                    Jueves 15 de Octubre de 2025
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Primera jornada del evento SAIO-XV.
                  </p>

                  {/* Details / Warnings */}
                  <div className="mt-4">
                    {evaluation.dia1.status === 'ACREDITADO' && (
                      <div className="p-3 bg-emerald-100/60 border border-emerald-200 rounded-xl text-emerald-900 text-xs space-y-1">
                        <p className="font-bold flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-700" />
                          Ingreso registrado exitosamente
                        </p>
                        <p className="text-[11px] text-emerald-800 font-mono">
                          Hora: {evaluation.dia1.record?.fechaFormateada || evaluation.dia1.record?.fechaHora || 'Registrado'}
                        </p>
                        <p className="text-[11px] text-emerald-700">
                          Registrado por: <span className="font-semibold">{evaluation.dia1.record?.staffEmail || 'Staff'}</span>
                        </p>
                      </div>
                    )}

                    {evaluation.dia1.status === 'BLOQUEADO' && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs">
                        <div className="flex items-start gap-2">
                          <Lock className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block">Acceso Denegado</span>
                            <span className="text-[11px] text-red-700 leading-tight block mt-0.5">
                              {evaluation.dia1.reason}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {evaluation.dia1.status === 'PENDIENTE' && (
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {evaluation.ticketRules.isEstrellaFugaz
                          ? '⚠️ Si se registra este día, el Día 2 (16/10) quedará automáticamente bloqueado para este asistente.'
                          : 'Listo para registrar la entrada del asistente al Día 1.'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Button Action */}
                <div className="mt-6 pt-4 border-t border-gray-150 flex items-center justify-between gap-3">
                  {evaluation.dia1.status === 'PENDIENTE' && (
                    <button
                      onClick={() => handleAccredit('dia1')}
                      disabled={isProcessing}
                      className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-heading font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Registrar Entrada Día 1 (15/10)</span>
                    </button>
                  )}

                  {evaluation.dia1.status === 'ACREDITADO' && (
                    <div className="w-full flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" />
                        Asistente Acreditado
                      </span>
                      {currentStaff?.rol === ROLES.ADMIN && (
                        <button
                          onClick={() => handleCancelAccreditation('dia1')}
                          disabled={isProcessing}
                          className="px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Anular en caso de error (Solo Administrador)"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Anular</span>
                        </button>
                      )}
                    </div>
                  )}

                  {evaluation.dia1.status === 'BLOQUEADO' && (
                    <button
                      disabled
                      className="w-full py-2.5 px-4 rounded-xl bg-gray-200 text-gray-500 text-xs font-heading font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed opacity-75"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Ingreso Bloqueado</span>
                    </button>
                  )}
                </div>
              </div>

              {/* ── Card Día 2: 16/10/2025 ── */}
              <div className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                evaluation.dia2.status === 'ACREDITADO'
                  ? 'bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-500/20'
                  : evaluation.dia2.status === 'BLOQUEADO'
                  ? 'bg-gray-100/70 border-gray-300 opacity-80'
                  : 'bg-white border-gray-200 shadow-xs hover:border-purple-300'
              }`}>
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-800 border border-gray-200">
                      <Calendar className="w-3.5 h-3.5 text-purple-600" />
                      DÍA 2 — 16/10/2025
                    </span>

                    {/* Status Badge */}
                    {evaluation.dia2.status === 'ACREDITADO' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Acreditado
                      </span>
                    )}
                    {evaluation.dia2.status === 'BLOQUEADO' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
                        <Lock className="w-3.5 h-3.5" />
                        Bloqueado
                      </span>
                    )}
                    {evaluation.dia2.status === 'PENDIENTE' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600">
                        Pendiente
                      </span>
                    )}
                  </div>

                  <h4 className="font-heading font-extrabold text-base text-gray-900">
                    Viernes 16 de Octubre de 2025
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Segunda jornada y cierre del evento SAIO-XV.
                  </p>

                  {/* Details / Warnings */}
                  <div className="mt-4">
                    {evaluation.dia2.status === 'ACREDITADO' && (
                      <div className="p-3 bg-emerald-100/60 border border-emerald-200 rounded-xl text-emerald-900 text-xs space-y-1">
                        <p className="font-bold flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-700" />
                          Ingreso registrado exitosamente
                        </p>
                        <p className="text-[11px] text-emerald-800 font-mono">
                          Hora: {evaluation.dia2.record?.fechaFormateada || evaluation.dia2.record?.fechaHora || 'Registrado'}
                        </p>
                        <p className="text-[11px] text-emerald-700">
                          Registrado por: <span className="font-semibold">{evaluation.dia2.record?.staffEmail || 'Staff'}</span>
                        </p>
                      </div>
                    )}

                    {evaluation.dia2.status === 'BLOQUEADO' && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs">
                        <div className="flex items-start gap-2">
                          <Lock className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block">Acceso Denegado</span>
                            <span className="text-[11px] text-red-700 leading-tight block mt-0.5">
                              {evaluation.dia2.reason}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {evaluation.dia2.status === 'PENDIENTE' && (
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {evaluation.ticketRules.isEstrellaFugaz
                          ? '⚠️ Si se registra este día, el asistente habrá consumido su único día de acceso permitido.'
                          : 'Listo para registrar la entrada del asistente al Día 2.'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Button Action */}
                <div className="mt-6 pt-4 border-t border-gray-150 flex items-center justify-between gap-3">
                  {evaluation.dia2.status === 'PENDIENTE' && (
                    <button
                      onClick={() => handleAccredit('dia2')}
                      disabled={isProcessing}
                      className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-heading font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Registrar Entrada Día 2 (16/10)</span>
                    </button>
                  )}

                  {evaluation.dia2.status === 'ACREDITADO' && (
                    <div className="w-full flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" />
                        Asistente Acreditado
                      </span>
                      {currentStaff?.rol === ROLES.ADMIN && (
                        <button
                          onClick={() => handleCancelAccreditation('dia2')}
                          disabled={isProcessing}
                          className="px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Anular en caso de error (Solo Administrador)"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Anular</span>
                        </button>
                      )}
                    </div>
                  )}

                  {evaluation.dia2.status === 'BLOQUEADO' && (
                    <button
                      disabled
                      className="w-full py-2.5 px-4 rounded-xl bg-gray-200 text-gray-500 text-xs font-heading font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed opacity-75"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Ingreso Bloqueado</span>
                    </button>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ── Recent Accreditations Feed ── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-gray-150 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-4 h-4 text-purple-600" />
            <h3 className="font-heading font-bold text-sm text-gray-900 uppercase tracking-wider">
              Historial Reciente de Acreditaciones
            </h3>
          </div>
          <span className="text-[11px] text-gray-500 font-medium">
            Últimas {recentLogs.length} entradas registradas
          </span>
        </div>

        <div className="overflow-x-auto max-w-full">
          <table className="w-full min-w-[620px] text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-heading font-bold text-[10px] tracking-wider">
                <th className="px-5 py-3">Fecha y Hora</th>
                <th className="px-5 py-3">Asistente</th>
                <th className="px-5 py-3">Cédula</th>
                <th className="px-5 py-3">Boleta</th>
                <th className="px-5 py-3">Jornada</th>
                <th className="px-5 py-3">Registrado Por</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans text-gray-700">
              {recentLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-400 font-medium">
                    No hay acreditaciones recientes registradas en el sistema.
                  </td>
                </tr>
              ) : (
                recentLogs.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-3 text-gray-500 font-mono text-[11px]">
                      {log.fechaFormateada || new Date(log.fechaHora).toLocaleString('es-CO')}
                    </td>
                    <td className="px-5 py-3 font-semibold text-gray-900">
                      {log.attendeeNombre || 'N/A'}
                    </td>
                    <td className="px-5 py-3 font-mono text-gray-600">
                      {log.attendeeCedula || 'N/A'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        (log.boleta || '').toLowerCase().includes('estrella fugaz')
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}>
                        {log.boleta || 'General'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-bold text-gray-800">
                        {log.dayKey === 'dia1' ? '15/10 (Día 1)' : '16/10 (Día 2)'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-[11px]">
                      {log.staffNombre || log.staffEmail || 'Staff'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* ── Modal QR Scanner Overlay ── */}
      {showScanner && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl relative flex flex-col">
            
            <div className="p-4 border-b border-gray-150 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <ScanLine className="w-5 h-5 text-purple-600 animate-pulse" />
                <h3 className="font-heading font-black text-sm text-gray-900">
                  Escanear Credencial del Asistente
                </h3>
              </div>
              <button
                onClick={() => setShowScanner(false)}
                className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative bg-black w-full aspect-square flex items-center justify-center overflow-hidden">
              <div id="accreditation-qr-reader" className="w-full h-full" />
              {!scannerReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/70 bg-black/90">
                  <RefreshCw className="w-7 h-7 animate-spin text-purple-500" />
                  <span className="text-xs font-medium">Iniciando cámara...</span>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-150 flex items-center justify-between gap-2">
              <p className="text-[11px] text-gray-500">
                Apunta la cámara al código QR de la credencial digital (Mi Entrada o Perfil).
              </p>
              {cameras.length > 1 && (
                <button
                  type="button"
                  onClick={handleSwitchCamera}
                  className="px-3 py-1.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  <span>Cambiar</span>
                </button>
              )}
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
