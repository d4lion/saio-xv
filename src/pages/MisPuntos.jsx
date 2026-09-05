import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { pointsService } from '../services/pointsService';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Keyboard, MapPin, AlertTriangle, CheckCircle, RefreshCw, History, ShieldAlert, QrCode, FlipHorizontal, X, Store, Receipt, MessageCircleWarning, ScanLine } from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'sonner';
import Pagination from '../components/Pagination';

// Configuración de SweetAlert2 con temática espacial
const themedSwal = Swal.mixin({
  background: '#0e0a34',
  color: '#e2e8f0',
  confirmButtonColor: '#9c3aed',
  cancelButtonColor: '#30227f',
  customClass: {
    popup: 'border border-purple-500/25 rounded-2xl shadow-2xl backdrop-blur-xl',
    title: 'font-heading font-bold text-white text-md tracking-wide',
    htmlContainer: 'text-secondary font-sans text-xs leading-relaxed',
    confirmButton: 'rounded-xl font-heading px-5 py-2.5 font-bold uppercase tracking-wider text-xs cursor-pointer hover:opacity-90 transition-opacity outline-none ring-0',
    cancelButton: 'rounded-xl font-heading px-5 py-2.5 font-bold uppercase tracking-wider text-xs cursor-pointer hover:bg-white/5 transition-colors outline-none ring-0'
  }
});

/** Extracts the raw code from either a plain code string or a full QR URL */
function extractCode(raw) {
  try {
    const url = new URL(raw);
    // Accepts both /mis-puntos and /pasaporte/mis-puntos for backward compat
    if (url.pathname.includes('mis-puntos')) {
      return url.searchParams.get('code') || raw;
    }
  } catch (_) {
    // Not a URL — raw code
  }
  return raw.trim();
}

export default function MisPuntos() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' o 'camera'
  
  // Transaction Modal States
  const [selectedTx, setSelectedTx] = useState(null);
  const [showTxModal, setShowTxModal] = useState(false);

  // Geolocation States
  const [coords, setCoords] = useState(null);
  const [geoError, setGeoError] = useState('');
  const [geoStatus, setGeoStatus] = useState('PENDING'); // 'PENDING', 'SUCCESS', 'ERROR'
  
  // Form and Scan States
  const [manualCode, setManualCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [history, setHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Camera States
  const [cameras, setCameras] = useState([]); // [{id, label}]
  const [activeCameraIndex, setActiveCameraIndex] = useState(0);
  const [scannerReady, setScannerReady] = useState(false);
  const scannerRef = useRef(null); // Html5Qrcode instance
  const isScanningRef = useRef(false);

  // Solicitar Ubicación
  const requestLocation = () => {
    setGeoStatus('PENDING');
    setGeoError('');
    
    if (!navigator.geolocation) {
      setGeoStatus('ERROR');
      setGeoError('La API de Geolocalización no está soportada en este navegador.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setGeoStatus('SUCCESS');
      },
      (error) => {
        setGeoStatus('ERROR');
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError('Permiso de ubicación denegado. Es necesario habilitarla para reclamar puntos.');
        } else {
          setGeoError('No se pudo obtener la ubicación del dispositivo.');
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  /**
   * Returns coords from state if already available,
   * otherwise fires a fresh getCurrentPosition and awaits it.
   * This avoids the race where the user claims a code before
   * the initial geolocation request has resolved.
   */
  const getCoords = () => {
    if (coords) return Promise.resolve(coords);
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no disponible en este navegador.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const c = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          setCoords(c);
          setGeoStatus('SUCCESS');
          resolve(c);
        },
        (err) => {
          setGeoStatus('ERROR');
          reject(new Error('No se pudo obtener la ubicación. Verifica que el GPS esté habilitado.'));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
    });
  };


  // Cargar Historial
  const loadHistory = async () => {
    if (!user?.uid) return;
    setIsHistoryLoading(true);
    try {
      const data = await pointsService.getTransactionHistory(user.uid);
      setHistory(data);
      setCurrentPage(1); // Reset to page 1 on reload
    } catch (err) {
      console.error(err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    requestLocation();
    loadHistory();
  }, [user]);

  // Reportar Novedades por WhatsApp
  const reportIssue = () => {
    const text = encodeURIComponent(`Hola, necesito ayuda con mis puntos en SAIO-XV.\n\nUsuario: ${user?.correo || user?.email || user?.uid}\n\nDetalle del problema:\n`);
    window.open(`https://wa.me/${import.meta.env.VITE_WHATSAPP_PHONE}?text=${text}`, '_blank');
  };

  // Reclamar automáticamente si hay un código pendiente en sessionStorage
  useEffect(() => {
    if (user && geoStatus === 'SUCCESS') {
      const pendingCode = sessionStorage.getItem('pendingClaimCode');
      if (pendingCode) {
        sessionStorage.removeItem('pendingClaimCode');
        handleClaimCode(pendingCode);
      }
    }
  }, [user, geoStatus]);

  useEffect(() => {
    if (user && geoStatus === 'ERROR') {
      const pendingCode = sessionStorage.getItem('pendingClaimCode');
      if (pendingCode) {
        sessionStorage.removeItem('pendingClaimCode');
        toast.error(`Ubicación Requerida: Se detectó un intento de registro automático para el código "${pendingCode.toUpperCase()}", pero es necesario habilitar el GPS para validar la distancia.`);
      }
    }
  }, [user, geoStatus]);

  // ── QR Scanner (Html5Qrcode low-level API) ──────────────────────────
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
        { fps: 12, qrbox: { width: 240, height: 240 }, aspectRatio: 1.0 },
        async (decodedText) => {
          await stopScanner();
          setActiveTab('manual');
          const rawCode = extractCode(decodedText);
          await handleClaimCode(rawCode);
        },
        () => { /* frame scan failure — silence */ }
      );
      isScanningRef.current = true;
      setScannerReady(true);
    } catch (err) {
      console.error('Error iniciando cámara:', err);
      toast.error('No se pudo acceder a la cámara. Verifica los permisos del navegador.');
    }
  }, [stopScanner]);

  useEffect(() => {
    if (activeTab !== 'camera') {
      stopScanner();
      setScannerReady(false);
      return;
    }

    // Create instance when the container is rendered
    const el = document.getElementById('qr-reader-container');
    if (!el) return;

    const html5Qrcode = new Html5Qrcode('qr-reader-container', { verbose: false });
    scannerRef.current = html5Qrcode;

    // Enumerate cameras — prefer rear
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (!devices || devices.length === 0) {
          toast.error('No se encontró ninguna cámara en este dispositivo.');
          return;
        }
        setCameras(devices);
        // Pick rear camera by default (label usually contains 'back' or 'trasera' or 'rear' or 'environment')
        const rearIdx = devices.findIndex(d =>
          /back|rear|trasera|environment/i.test(d.label)
        );
        const defaultIdx = rearIdx >= 0 ? rearIdx : 0;
        setActiveCameraIndex(defaultIdx);
        startScanner(devices[defaultIdx].id);
      })
      .catch((err) => {
        console.error('Error enumerando cámaras:', err);
        toast.error('No se pudo acceder a las cámaras del dispositivo.');
      });

    return () => {
      stopScanner().then(() => {
        if (scannerRef.current) {
          scannerRef.current = null;
        }
      });
    };
  }, [activeTab]);

  // Switch camera
  const handleSwitchCamera = async () => {
    if (cameras.length < 2) return;
    const nextIdx = (activeCameraIndex + 1) % cameras.length;
    setActiveCameraIndex(nextIdx);
    setScannerReady(false);
    await startScanner(cameras[nextIdx].id);
  };


  // Canjear Código
  const handleClaimCode = async (code) => {
    const targetCode = code || manualCode;
    if (!targetCode.trim()) {
      toast.error('Código Vacío: Por favor escribe o escanea un código antes de reclamar.');
      return;
    }

    // Pedir confirmación si es ingreso manual
    if (!code) {
      const confirmResult = await themedSwal.fire({
        title: '¿Registrar Código?',
        text: `¿Deseas registrar el código "${targetCode.toUpperCase()}" para obtener puntos?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, Registrar',
        cancelButtonText: 'Cancelar'
      });
      if (!confirmResult.isConfirmed) return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const currentCoords = await getCoords();
      const res = await pointsService.claimCode(user.uid, targetCode, currentCoords);
      
      const successText = !(res.distancia !== undefined && import.meta.env.VITE_PRODUCTION_MODE === 'true')
        ? `Se cargaron ${res.puntosReclamados} puntos estelares a tu cuenta.`
        : `Se cargaron ${res.puntosReclamados} puntos estelares a tu cuenta [DEBUG: ${res.distancia.toFixed(3)} km]`
      
      toast.success(`¡Código Registrado! ${successText}`);
      
      setManualCode('');
      loadHistory();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'El código es inválido o ya ha sido registrado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const itemsPerPage = 5;
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const paginatedHistory = history.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="w-full flex flex-col gap-8 animate-in fade-in duration-700">
      
      {/* HEADER PREMIUM */}
      <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 relative z-10">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-purple-900/40 border border-accent/30 flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(156,58,237,0.3)] glow-purple">
            <QrCode className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200">
              Mis Puntos
            </h1>
            <p className="text-secondary text-sm mt-1 tracking-wide">
              Escanea códigos QR de stands y charlas para acumular.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <button 
            onClick={reportIssue}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-secondary hover:text-white transition-all text-xs font-bold font-heading uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <MessageCircleWarning className="w-4 h-4" />
            Novedades
          </button>
          
          <div className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-black/40 border border-accent/40 shadow-[0_0_40px_rgba(156,58,237,0.15)] flex flex-col items-center sm:items-end justify-center backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <span className="text-[10px] text-accent font-heading uppercase tracking-[0.2em] font-bold mb-0.5">Saldo Disponible</span>
            <span className="text-2xl font-black text-white font-mono tracking-tighter shadow-black drop-shadow-md">
              {(user?.puntos || 0).toLocaleString()} <span className="text-accent/70 text-lg">PTS</span>
            </span>
          </div>
        </div>
      </div>

      {/* Geolocation Status - Sleek Banner */}
      <div className={`w-full rounded-2xl border p-3 flex flex-col sm:flex-row items-center justify-between gap-3 backdrop-blur-md shadow-lg transition-all duration-500
        ${geoStatus === 'SUCCESS' ? 'bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5' : 
          geoStatus === 'PENDING' ? 'bg-amber-500/10 border-amber-500/20 shadow-amber-500/5' : 
          'bg-red-500/10 border-red-500/20 shadow-red-500/5'}
      `}>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full animate-pulse ${geoStatus === 'SUCCESS' ? 'bg-emerald-400' : geoStatus === 'PENDING' ? 'bg-amber-400' : 'bg-red-400'}`} />
          <span className={`text-xs font-mono uppercase tracking-widest font-bold ${geoStatus === 'SUCCESS' ? 'text-emerald-400' : geoStatus === 'PENDING' ? 'text-amber-400' : 'text-red-400'}`}>
            {geoStatus === 'SUCCESS' ? 'GPS Conectado y Verificado' : geoStatus === 'PENDING' ? 'Localizando satélites...' : 'GPS Bloqueado o Denegado'}
          </span>
        </div>
        {geoStatus === 'ERROR' && (
          <button 
            onClick={requestLocation}
            className="px-4 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 text-[10px] font-bold font-heading uppercase tracking-widest transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3 h-3" /> Reintentar
          </button>
        )}
      </div>

      {/* Main Content Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Lector/Formulario (Col 7) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          
          {/* Segmented Control */}
          <div className="w-full p-1 bg-black/40 border border-white/10 rounded-xl flex relative backdrop-blur-md">
            <div className={`absolute top-1 bottom-1 w-[calc(50%-0.25rem)] bg-white/10 border border-white/10 rounded-lg transition-transform duration-500 ease-out shadow-lg ${activeTab === 'camera' ? 'translate-x-[calc(100%+0.25rem)]' : 'translate-x-0'}`} />
            
            <button
              onClick={() => { setActiveTab('manual'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 text-center text-xs font-heading font-bold uppercase tracking-widest transition-colors relative z-10 flex items-center justify-center gap-2 ${activeTab === 'manual' ? 'text-white' : 'text-secondary/60 hover:text-white'}`}
            >
              <Keyboard className="w-3.5 h-3.5" /> Manual
            </button>
            <button
              onClick={() => { setActiveTab('camera'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 text-center text-xs font-heading font-bold uppercase tracking-widest transition-colors relative z-10 flex items-center justify-center gap-2 ${activeTab === 'camera' ? 'text-white' : 'text-secondary/60 hover:text-white'}`}
            >
              <Camera className="w-3.5 h-3.5" /> Escáner QR
            </button>
          </div>

          {/* Área de Acción */}
          <div className="glass rounded-[1.5rem] p-4 sm:p-5 border border-white/10 bg-black/20 shadow-2xl relative overflow-hidden flex flex-col justify-center items-center min-h-[300px] w-full">
            
            {error && (
              <div className="mb-8 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 text-sm flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top-4">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-8 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-sm flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top-4">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Manual Entry */}
            {activeTab === 'manual' && (
              <div className="w-full max-w-xs mx-auto space-y-5 animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center">
                  <h3 className="font-heading font-black text-base text-white">Ingresa el Código</h3>
                  <p className="text-secondary text-[10px] mt-1">Escribe el código secreto proporcionado.</p>
                </div>
                
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-accent to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="SAIO-XXXX"
                    className="relative w-full px-4 py-3 bg-black/80 border border-white/20 rounded-xl text-lg text-center text-white placeholder-secondary/30 outline-none transition-all duration-300 font-mono tracking-[0.2em] uppercase focus:border-accent shadow-inner"
                    disabled={isSubmitting}
                  />
                </div>
                
                <button
                  onClick={() => handleClaimCode()}
                  disabled={isSubmitting || !manualCode.trim()}
                  className="w-full py-3 rounded-xl bg-white text-black text-[11px] font-bold font-heading uppercase tracking-[0.2em] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.15)] flex justify-center items-center gap-2 group"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Reclamar Puntos <MapPin className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" /></>
                  )}
                </button>
              </div>
            )}

            {/* Camera View */}
            {activeTab === 'camera' && (
              <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center mb-3">
                  <h3 className="font-heading font-black text-base text-white">Escáner Biométrico</h3>
                </div>

                <div className="relative w-full max-w-[240px]" style={{ aspectRatio: '16/11' }}>
                  {/* Viewfinder Corners overlay */}
                  <div className="absolute inset-0 z-20 pointer-events-none">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-accent rounded-tl-2xl" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-accent rounded-tr-2xl" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-accent rounded-bl-2xl" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-accent rounded-br-2xl" />
                    {scannerReady && (
                      <div className="absolute top-0 left-0 w-full h-0.5 bg-accent/80 shadow-[0_0_15px_rgba(156,58,237,1)] animate-[scan_2s_ease-in-out_infinite]" />
                    )}
                  </div>

                  {!scannerReady && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-3xl bg-black/80 border border-white/5 backdrop-blur-sm">
                      <ScanLine className="w-10 h-10 text-accent/50 animate-pulse" />
                      <span className="text-[10px] text-secondary font-mono uppercase tracking-[0.3em]">Calibrando Óptica...</span>
                    </div>
                  )}

                  <div
                    id="qr-reader-container"
                    className="w-full h-full overflow-hidden rounded-3xl bg-black shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                  />
                </div>

                {cameras.length > 1 && (
                  <button
                    type="button"
                    onClick={handleSwitchCamera}
                    disabled={!scannerReady}
                    className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white text-[10px] font-bold font-heading uppercase tracking-widest transition-all duration-300 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <FlipHorizontal className="w-3 h-3" /> Cambiar lente
                  </button>
                )}
              </div>
            )}
            
          </div>
        </div>

        {/* Historial (Col 5) */}
        <div className="lg:col-span-5 flex flex-col h-[600px] lg:h-auto lg:min-h-[600px]">
          <div className="glass rounded-[2rem] p-6 sm:p-8 border border-white/10 bg-black/30 flex-1 flex flex-col relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <History className="w-5 h-5 text-purple-300" />
                </div>
                <h3 className="font-heading font-black text-lg text-white">Actividad Reciente</h3>
              </div>
              <button 
                onClick={loadHistory} 
                className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center text-secondary hover:text-white transition-all cursor-pointer border border-transparent hover:border-white/10"
                disabled={isHistoryLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isHistoryLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent space-y-4 relative z-10">
              {isHistoryLoading ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 opacity-50">
                  <RefreshCw className="w-8 h-8 animate-spin text-secondary" />
                  <span className="text-xs font-mono uppercase tracking-widest text-secondary">Sincronizando...</span>
                </div>
              ) : history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-center px-6">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <History className="w-8 h-8 text-secondary/40" />
                  </div>
                  <p className="text-sm font-mono text-secondary/60 leading-relaxed uppercase tracking-wider">
                    Bitácora vacía.<br/>Comienza a escanear.
                  </p>
                </div>
              ) : (
                paginatedHistory.map((t, index) => (
                  <div 
                    key={t.id} 
                    onClick={() => { setSelectedTx(t); setShowTxModal(true); }}
                    className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-accent/40 hover:bg-black/40 transition-all duration-300 cursor-pointer relative group overflow-hidden shadow-lg animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/5 to-accent/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    
                    <div className="flex justify-between items-start gap-4 relative z-10 mb-3">
                      <span className="font-heading font-bold uppercase tracking-wide text-white line-clamp-2">
                        {t.transactionName || t.code}
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono shrink-0 shadow-inner border ${t.puntos >= 0 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
                        {t.puntos > 0 ? '+' : ''}{t.puntos}
                      </span>
                    </div>
                    <div className="flex justify-between items-end text-[10px] text-secondary font-mono tracking-wider relative z-10">
                      <div className="flex flex-col gap-1.5 opacity-70">
                        {t.tienda ? (
                          <span className="flex items-center gap-1.5"><Store className="w-3 h-3" /> {t.tienda}</span>
                        ) : t.coordenadas ? (
                          <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> GPS Verificado</span>
                        ) : (
                          <span className="flex items-center gap-1.5"><AlertTriangle className="w-3 h-3" /> Sin GPS</span>
                        )}
                        <span>{new Date(t.fecha).toLocaleDateString()}</span>
                      </div>
                      <span className="text-white/40">{new Date(t.fecha).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))
              )}
              
              {totalPages > 1 && (
                <div className="mt-6 mb-2 relative z-10 w-full">
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    theme="dark"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CSS Animación Scanner */}
      <style>{`
        @keyframes scan {
          0%, 100% { top: 5%; }
          50% { top: 95%; }
        }
        #qr-reader-container video { width: 100% !important; border-radius: 1.5rem; object-fit: cover; }
        #qr-reader-container { border: none !important; }
      `}</style>

      {/* Modal Detalles de Transacción */}
      {showTxModal && selectedTx && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
          <div className="relative w-full max-w-sm max-h-[90dvh] flex flex-col border border-white/10 rounded-[2.5rem] bg-black/90 text-white shadow-2xl overflow-hidden">
            {/* Cabecera */}
            <div className="w-full flex justify-between items-center p-6 sm:p-8 pb-4 border-b border-white/10 shrink-0 bg-black/90 z-20">
              <span className="font-heading font-black text-xs uppercase tracking-widest text-accent flex items-center gap-2">
                <Receipt className="w-4 h-4" /> Detalle de Movimiento
              </span>
              <button 
                onClick={() => {
                  setShowTxModal(false);
                  setSelectedTx(null);
                }}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-secondary hover:text-white hover:bg-white/20 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 pt-6 flex flex-col items-center scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent space-y-6">
              
              <div className="text-center w-full">
                <div className={`inline-flex items-center justify-center p-4 rounded-full mb-4 border shadow-xl
                  ${selectedTx.puntos >= 0 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10' : 'bg-red-500/10 border-red-500/30 text-red-400 shadow-red-500/10'}
                `}>
                  <History className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-heading font-black text-white">
                  {selectedTx.transactionName || 'Transacción'}
                </h3>
                <p className={`text-2xl font-black mt-2 ${selectedTx.puntos >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {selectedTx.puntos > 0 ? '+' : ''}{selectedTx.puntos} PTS
                </p>
              </div>

              <div className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                <p className="text-sm text-secondary leading-relaxed">
                  {selectedTx.transactionDescription || `Movimiento por código: ${selectedTx.code}`}
                </p>
              </div>

              <div className="w-full space-y-3 border-t border-white/10 pt-6 text-[10px] font-mono tracking-wider">
                {selectedTx.tienda && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-secondary/70 flex items-center gap-1"><Store className="w-3 h-3" /> TIENDA</span>
                    <span className="text-white font-bold">{selectedTx.tienda}</span>
                  </div>
                )}
                {selectedTx.montoCop !== undefined && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-secondary/70">MONTO COP</span>
                    <span className="text-white font-bold">${selectedTx.montoCop.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-1">
                  <span className="text-secondary/70">CÓDIGO REF</span>
                  <span className="text-white font-bold truncate max-w-[150px] text-right" title={selectedTx.code}>{selectedTx.code}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-secondary/70">FECHA</span>
                  <span className="text-white">{new Date(selectedTx.fecha).toLocaleString()}</span>
                </div>
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
