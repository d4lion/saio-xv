import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { pointsService } from '../services/pointsService';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, Keyboard, MapPin, AlertTriangle, CheckCircle, RefreshCw, History, ShieldAlert } from 'lucide-react';
import UserNav from '../components/UserNav/UserNav';
import Swal from 'sweetalert2';

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
      themedSwal.fire({
        icon: 'error',
        title: 'Código Vacío',
        text: 'Por favor escribe o escanea un código antes de reclamar.'
      });
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
      
      const successText = res.distancia !== undefined
        ? `Se cargaron ${res.puntosReclamados} puntos estelares a tu cuenta.\n\n[Verificación Haversine: Aceptado a ${res.distancia.toFixed(3)} km del stand]`
        : `Se cargaron ${res.puntosReclamados} puntos estelares a tu cuenta.`;

      themedSwal.fire({
        icon: 'success',
        title: '¡Código Registrado!',
        text: successText
      });
      
      setManualCode('');
      loadHistory();
    } catch (err) {
      console.error(err);
      themedSwal.fire({
        icon: 'error',
        title: 'Error de Registro',
        text: err.message || 'El código es inválido o ya ha sido registrado.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040b0f] text-white flex flex-col font-sans relative overflow-hidden select-none">
      {/* Nebulosas */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-primary/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Header */}
      <header className="glass-light border-b border-muted/20 px-6 py-4 sticky top-0 backdrop-blur-md z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center glow-purple">
              <span className="text-white font-heading font-extrabold text-sm">S</span>
            </div>
            <div>
              <span className="font-heading font-bold text-white text-md tracking-tight block">Recolección de Puntos</span>
              <span className="text-[10px] text-accent tracking-widest uppercase">Canjear Códigos</span>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-primary/20 border border-muted/10 text-xs font-semibold">
            Saldo: <span className="text-accent">{(user?.puntos || 0).toLocaleString()} PTS</span>
          </div>
        </div>
      </header>

      <UserNav />

      {/* Contenido */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6 z-20">
        {/* Geolocalización Status Card */}
        <section className="glass rounded-2xl p-5 border border-muted/15">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${geoStatus === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' : geoStatus === 'PENDING' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                <MapPin className="w-5 h-5 shrink-0" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-xs uppercase text-secondary tracking-wider">Estado de Localización</h3>
                <p className="text-sm font-medium mt-0.5">
                  {geoStatus === 'SUCCESS' && 'Ubicación Establecida Satisfactoriamente'}
                  {geoStatus === 'PENDING' && 'Localizando dispositivo...'}
                  {geoStatus === 'ERROR' && 'Acceso a ubicación bloqueado'}
                </p>
              </div>
            </div>
            {geoStatus === 'ERROR' && (
              <button 
                onClick={requestLocation}
                className="py-1.5 px-3 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-200 border border-red-500/30 text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reintentar Permisos</span>
              </button>
            )}
          </div>

          {geoStatus === 'ERROR' && (
            <div className="mt-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-red-300 text-xs leading-relaxed flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{geoError} La ubicación es mandatoria para mitigar fraudes por distancia en el registro de puntos.</span>
            </div>
          )}
        </section>

        {/* Sección de Canjeo */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Lector/Formulario (Col 1 y 2) */}
          <div className="glass rounded-2xl p-6 border border-muted/15 md:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex border-b border-muted/10">
              <button
                onClick={() => { setActiveTab('manual'); setError(''); setSuccess(''); }}
                className={`flex-1 pb-3 text-center font-heading text-sm font-semibold relative cursor-pointer ${activeTab === 'manual' ? 'text-white' : 'text-secondary hover:text-white'}`}
              >
                <Keyboard className="w-4 h-4 inline-block mr-2" />
                Ingreso Manual
                {activeTab === 'manual' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent glow-purple"></div>}
              </button>
              <button
                onClick={() => { setActiveTab('camera'); setError(''); setSuccess(''); }}
                className={`flex-1 pb-3 text-center font-heading text-sm font-semibold relative cursor-pointer ${activeTab === 'camera' ? 'text-white' : 'text-secondary hover:text-white'}`}
                disabled={geoStatus !== 'SUCCESS'}
                title={geoStatus !== 'SUCCESS' ? 'Fija tu ubicación antes de abrir la cámara' : ''}
              >
                <Camera className="w-4 h-4 inline-block mr-2" />
                Cámara QR
                {activeTab === 'camera' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent glow-purple"></div>}
              </button>
            </div>

            {/* Mensajes */}
            {error && (
              <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-200 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4.5 h-4.5 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Vista Formulario Manual */}
            {activeTab === 'manual' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-heading font-semibold text-secondary uppercase tracking-wider block">
                    Ingresar Código de Puntos
                  </label>
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Ej: SAIO100"
                    className="w-full px-4 py-3 bg-primary-light/5 border border-muted/20 hover:border-primary-light/50 focus:border-accent rounded-xl text-sm text-white placeholder-secondary/40 outline-none transition-all duration-300 font-mono tracking-widest uppercase focus:ring-1 focus:ring-accent/30"
                    disabled={isSubmitting || geoStatus !== 'SUCCESS'}
                  />
                </div>
                <button
                  onClick={() => handleClaimCode()}
                  className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-primary-light to-accent hover:opacity-95 text-white text-xs font-semibold font-heading uppercase tracking-wider cursor-pointer disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-accent/15"
                  disabled={isSubmitting || geoStatus !== 'SUCCESS'}
                >
                  {isSubmitting ? 'Registrando...' : 'Reclamar Puntos'}
                </button>
              </div>
            )}

            {/* Vista Cámara QR */}
            {activeTab === 'camera' && (
              <div className="space-y-4">
                <p className="text-xs text-secondary text-center">
                  Apunta tu cámara hacia el código QR de la actividad o stand del evento.
                </p>
                <div 
                  id="qr-reader-container" 
                  className="overflow-hidden rounded-2xl border border-muted/20 bg-black/40 max-w-sm mx-auto shadow-inner"
                  style={{ minHeight: '300px' }}
                ></div>
              </div>
            )}
          </div>

          {/* Historial (Col 3) */}
          <div className="glass rounded-2xl p-6 border border-muted/15 space-y-4">
            <div className="flex items-center justify-between border-b border-muted/10 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-accent" />
                <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-secondary">Tus Reclamaciones</h3>
              </div>
              <button 
                onClick={loadHistory} 
                className="p-1 hover:bg-white/5 rounded hover:text-white cursor-pointer"
                disabled={isHistoryLoading}
              >
                <RefreshCw className={`w-3.5 h-3.5 text-secondary ${isHistoryLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[300px]">
              {isHistoryLoading ? (
                <div className="py-8 text-center text-xs text-secondary">Cargando historial...</div>
              ) : history.length === 0 ? (
                <div className="py-8 text-center text-xs text-secondary leading-relaxed">
                  No has reclamado ningún código espacial aún.
                </div>
              ) : (
                history.map((t) => (
                  <div key={t.id} className="p-3 rounded-xl bg-primary-light/5 border border-muted/5 space-y-1">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="font-mono text-white tracking-wider">{t.code}</span>
                      <span className="text-emerald-400">+{t.puntos} PTS</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-secondary">
                      <span>{t.coordenadas ? '📍 Geolocalizado' : '⚠️ Sin GPS'}</span>
                      <span>{new Date(t.fecha).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-4 px-6 text-center text-xs text-secondary mt-auto border-t border-muted/10 bg-black/20">
        © 2026 SAIO-XV Admin Portal. Lector de Telemetría Georreferenciada.
      </footer>
    </div>
  );
}
