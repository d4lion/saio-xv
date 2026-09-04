import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { pointsService } from '../services/pointsService';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, Keyboard, MapPin, AlertTriangle, CheckCircle, RefreshCw, History, ShieldAlert, QrCode } from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'sonner';

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

export default function MisPuntos() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' o 'camera'
  
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

  // Cargar Historial
  const loadHistory = async () => {
    if (!user?.uid) return;
    setIsHistoryLoading(true);
    try {
      const data = await pointsService.getTransactionHistory(user.uid);
      setHistory(data);
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

  // Inicializar Escáner QR
  useEffect(() => {
    if (activeTab === 'camera') {
      const scanner = new Html5QrcodeScanner(
        "qr-reader-container",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        /* verbose= */ false
      );

      const onScanSuccess = async (decodedText) => {
        // Detener cámara temporalmente para evitar scans repetidos
        scanner.clear();
        setActiveTab('manual');
        await handleClaimCode(decodedText);
      };

      const onScanFailure = (error) => {
        // Omitir spam de errores de búsqueda del QR en el stream
      };

      scanner.render(onScanSuccess, onScanFailure);

      return () => {
        scanner.clear().catch(err => console.error("Error deteniendo escáner:", err));
      };
    }
  }, [activeTab]);

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
      const res = await pointsService.claimCode(user.uid, targetCode, coords);
      
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

  return (
    <div className="w-full flex flex-col gap-8 animate-in fade-in duration-700">
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <QrCode className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-black text-white">Mis Puntos</h1>
            <p className="text-secondary text-sm">Escanea códigos QR de stands y conferencias para acumular.</p>
          </div>
        </div>
        <div className="px-4 py-2 rounded-xl bg-purple-900/20 border border-purple-500/20 text-sm font-bold text-white shadow-lg shadow-purple-900/20">
          Saldo: <span className="text-accent font-black">{(user?.puntos || 0).toLocaleString()} PTS</span>
        </div>
      </div>

      {/* Geolocalización Status Card */}
      <section className="glass rounded-[1.5rem] p-6 border border-white/10 bg-black/20 shadow-lg relative overflow-hidden">
        {/* Glow effect */}
        {geoStatus === 'SUCCESS' && <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />}
        {geoStatus === 'ERROR' && <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />}
        {geoStatus === 'PENDING' && <div className="absolute inset-0 bg-amber-500/5 pointer-events-none" />}
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl border ${geoStatus === 'SUCCESS' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : geoStatus === 'PENDING' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              <MapPin className="w-5 h-5 shrink-0" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-xs uppercase text-secondary tracking-widest">Estado de Localización</h3>
              <p className="text-sm font-bold mt-1 text-white">
                {geoStatus === 'SUCCESS' && 'Ubicación Establecida Satisfactoriamente'}
                {geoStatus === 'PENDING' && 'Localizando dispositivo...'}
                {geoStatus === 'ERROR' && 'Acceso a ubicación bloqueado'}
              </p>
            </div>
          </div>
          {geoStatus === 'ERROR' && (
            <button 
              onClick={requestLocation}
              className="py-2 px-4 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-200 border border-red-500/30 text-xs font-bold font-heading uppercase tracking-widest transition-all duration-200 cursor-pointer flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reintentar Permisos</span>
            </button>
          )}
        </div>

        {geoStatus === 'ERROR' && (
          <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm leading-relaxed flex items-start gap-3 backdrop-blur-md relative z-10">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <span>{geoError} La ubicación es mandatoria para mitigar fraudes por distancia en el registro de puntos.</span>
          </div>
        )}
      </section>

      {/* Sección de Canjeo */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lector/Formulario (Col 1 y 2) */}
        <div className="glass rounded-[1.5rem] p-6 sm:p-8 border border-white/10 lg:col-span-2 bg-black/20 space-y-8 relative overflow-hidden">
          
          {/* Tabs */}
          <div className="flex border-b border-white/10 relative z-10">
            <button
              onClick={() => { setActiveTab('manual'); setError(''); setSuccess(''); }}
              className={`flex-1 pb-4 text-center font-heading text-sm font-bold uppercase tracking-widest relative cursor-pointer transition-colors ${activeTab === 'manual' ? 'text-white' : 'text-secondary hover:text-white'}`}
            >
              <Keyboard className="w-4 h-4 inline-block mr-2 -mt-1" />
              Ingreso Manual
              {activeTab === 'manual' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent glow-purple"></div>}
            </button>
            <button
              onClick={() => { setActiveTab('camera'); setError(''); setSuccess(''); }}
              className={`flex-1 pb-4 text-center font-heading text-sm font-bold uppercase tracking-widest relative cursor-pointer transition-colors ${activeTab === 'camera' ? 'text-white' : 'text-secondary hover:text-white'}`}
              disabled={geoStatus !== 'SUCCESS'}
              title={geoStatus !== 'SUCCESS' ? 'Fija tu ubicación antes de abrir la cámara' : ''}
            >
              <Camera className="w-4 h-4 inline-block mr-2 -mt-1" />
              Cámara QR
              {activeTab === 'camera' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent glow-purple"></div>}
            </button>
          </div>

          <div className="relative z-10">
            {/* Mensajes */}
            {error && (
              <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 text-sm flex items-center gap-3 backdrop-blur-md">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-sm flex items-center gap-3 backdrop-blur-md">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Vista Formulario Manual */}
            {activeTab === 'manual' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-heading font-bold text-secondary uppercase tracking-widest block mb-3">
                    Ingresar Código de Puntos
                  </label>
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Ej: SAIO100"
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 hover:border-purple-500/50 focus:border-purple-500 rounded-xl text-lg text-white placeholder-secondary/40 outline-none transition-all duration-300 font-mono tracking-widest uppercase focus:ring-1 focus:ring-purple-500/30"
                    disabled={isSubmitting || geoStatus !== 'SUCCESS'}
                  />
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => handleClaimCode()}
                    className="w-full sm:w-auto py-4 px-8 rounded-full bg-white text-black hover:scale-[1.02] active:scale-[0.98] text-xs font-bold font-heading uppercase tracking-[0.2em] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                    disabled={isSubmitting || geoStatus !== 'SUCCESS'}
                  >
                    {isSubmitting ? 'Registrando...' : 'Reclamar Puntos'}
                  </button>
                </div>
              </div>
            )}

            {/* Vista Cámara QR */}
            {activeTab === 'camera' && (
              <div className="space-y-6">
                <p className="text-sm text-secondary text-center max-w-sm mx-auto leading-relaxed">
                  Apunta tu cámara hacia el código QR de la actividad o stand del evento.
                </p>
                <div 
                  id="qr-reader-container" 
                  className="overflow-hidden rounded-3xl border border-white/10 bg-black/40 max-w-sm mx-auto shadow-2xl"
                  style={{ minHeight: '300px' }}
                ></div>
              </div>
            )}
          </div>
        </div>

        {/* Historial (Col 3) */}
        <div className="glass rounded-[1.5rem] p-6 border border-white/10 bg-black/20 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" />
              <h3 className="font-heading font-black text-sm uppercase tracking-widest text-secondary">Historial</h3>
            </div>
            <button 
              onClick={loadHistory} 
              className="p-1.5 hover:bg-white/10 rounded-lg text-secondary hover:text-white transition-colors cursor-pointer"
              disabled={isHistoryLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isHistoryLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {isHistoryLoading ? (
              <div className="py-8 text-center text-xs font-mono uppercase tracking-widest text-secondary/50">Cargando...</div>
            ) : history.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-secondary/50 leading-relaxed px-4">
                No has reclamado ningún código espacial aún.
              </div>
            ) : (
              history.map((t) => (
                <div key={t.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors space-y-2">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="font-mono text-white tracking-widest">{t.code}</span>
                    <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-xs">+{t.puntos} PTS</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-secondary font-mono tracking-wider">
                    <span className="flex items-center gap-1 opacity-70">
                      {t.coordenadas ? <MapPin className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      {t.coordenadas ? 'Validado' : 'Sin GPS'}
                    </span>
                    <span>{new Date(t.fecha).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
