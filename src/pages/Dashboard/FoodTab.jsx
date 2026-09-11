import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Search, Utensils, Coffee, QrCode, Shield, CheckCircle, RefreshCw, X, FlipHorizontal, ScanLine } from 'lucide-react';
import { toast } from 'sonner';
import { createPortal } from 'react-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { storeService } from '../../services/storeService';
import { adminService } from '../../services/adminService';
import Swal from 'sweetalert2';

export default function FoodTab() {
  // States for search
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundUser, setFoundUser] = useState(null);

  // States for redemption
  const [isRedeeming, setIsRedeeming] = useState(false);

  // QR Scanner States
  const [showScanner, setShowScanner] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [activeCameraIndex, setActiveCameraIndex] = useState(0);
  const [scannerReady, setScannerReady] = useState(false);
  const scannerRef = useRef(null);
  const isScanningRef = useRef(false);

  // Computed Limits based on ticket
  const ticketType = foundUser?.boleta || 'No determinado';
  const isSupernova = ticketType.toLowerCase().includes('supernova');
  const maxAlmuerzos = isSupernova ? 2 : 1;
  const maxRefrigerios = 4;

  const userComidas = foundUser?.comidas || { almuerzos: [], refrigerios: [] };
  const almuerzosRedeemed = userComidas.almuerzos?.length || 0;
  const refrigeriosRedeemed = userComidas.refrigerios?.length || 0;

  const canRedeemAlmuerzo = almuerzosRedeemed < maxAlmuerzos;
  const canRedeemRefrigerio = refrigeriosRedeemed < maxRefrigerios;

  // ── QR Scanner Logic ──
  const stopScanner = useCallback(async () => {
    if (scannerRef.current && isScanningRef.current) {
      try { await scannerRef.current.stop(); } catch (_) {}
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
          let rawCode = decodedText.trim();
          try {
            const url = new URL(decodedText);
            if (url.pathname.includes('mis-puntos')) {
               rawCode = url.searchParams.get('code') || rawCode;
            }
          } catch (_) {}
          setSearchQuery(rawCode);
          handleSearchDirect(rawCode);
        },
        () => {}
      );
      isScanningRef.current = true;
      setScannerReady(true);
    } catch (err) {
      console.error(err);
      toast.error('No se pudo iniciar la cámara.');
    }
  }, [stopScanner]);

  useEffect(() => {
    if (!showScanner) {
      stopScanner();
      setScannerReady(false);
      return;
    }

    const el = document.getElementById('food-qr-reader');
    if (!el) return;

    scannerRef.current = new Html5Qrcode('food-qr-reader', { verbose: false });
    Html5Qrcode.getCameras().then((devices) => {
      if (devices && devices.length > 0) {
        setCameras(devices);
        const rearIdx = devices.findIndex(d => /back|rear|trasera|environment/i.test(d.label));
        const defaultIdx = rearIdx >= 0 ? rearIdx : 0;
        setActiveCameraIndex(defaultIdx);
        startScanner(devices[defaultIdx].id);
      } else {
        toast.error('No se encontraron cámaras.');
        setShowScanner(false);
      }
    }).catch(err => {
      toast.error('Error accediendo a cámaras.');
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

  // 1. Search for attendee
  const handleSearchDirect = async (query) => {
    if (!query) return;
    try {
      setIsSearching(true);
      setFoundUser(null);
      const attendee = await storeService.findAttendee(query);
      if (attendee) {
        setFoundUser(attendee);
        toast.success(`Asistente encontrado: ${attendee.nombre}`);
      } else {
        toast.error('No se encontró ningún asistente con ese dato.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al buscar al asistente.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error('Por favor, ingresa un correo, cédula o UID.');
      return;
    }
    await handleSearchDirect(searchQuery.trim());
  };

  // 2. Redeem Food
  const handleRedeem = async (type) => {
    if (!foundUser) return;
    
    const isAlmuerzo = type === 'almuerzos';
    const currentRedeemed = isAlmuerzo ? almuerzosRedeemed : refrigeriosRedeemed;
    const maxLimit = isAlmuerzo ? maxAlmuerzos : maxRefrigerios;
    
    if (currentRedeemed >= maxLimit) {
      toast.error(`El usuario ya ha reclamado su límite máximo de ${isAlmuerzo ? 'Almuerzos' : 'Refrigerios'}.`);
      return;
    }

    const typeName = isAlmuerzo ? 'Almuerzo' : 'Refrigerio';

    const confirm = await Swal.fire({
      icon: 'question',
      title: '¿Confirmar Entrega?',
      html: `Vas a registrar la entrega de <b>1 ${typeName}</b> a <b>${foundUser.nombre}</b>.`,
      showCancelButton: true,
      confirmButtonText: 'Registrar Entrega',
      cancelButtonText: 'Cancelar'
    });

    if (!confirm.isConfirmed) return;

    try {
      setIsRedeeming(true);
      const result = await adminService.redeemFood(foundUser.uid, type);
      toast.success(`¡${typeName} registrado con éxito!`);
      
      // Update local state to reflect the change immediately
      setFoundUser(prev => {
        const newComidas = prev.comidas ? { ...prev.comidas } : { almuerzos: [], refrigerios: [] };
        if (!newComidas[type]) newComidas[type] = [];
        newComidas[type] = [...newComidas[type], result.timestamp];
        return { ...prev, comidas: newComidas };
      });

    } catch (err) {
      console.error(err);
      toast.error(`Error al registrar: ${err.message}`);
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-heading font-black text-gray-900 flex items-center gap-2">
            <Utensils className="w-6 h-6 text-orange-600" />
            Control de Alimentación
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Escanea el QR del asistente o busca por cédula para registrar la entrega de almuerzos y refrigerios.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Panel Izquierdo: Búsqueda y Perfil */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col">
            <h3 className="text-sm font-heading font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Search className="w-4 h-4 text-orange-600" />
              Buscar Asistente
            </h3>

            <form onSubmit={handleSearch} className="flex flex-col gap-4">
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <QrCode className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Escanea o digita Cédula..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors"
                    disabled={isSearching}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center shrink-0 shadow-md active:scale-95 cursor-pointer"
                  title="Escanear QR"
                >
                  <QrCode className="w-5 h-5" />
                </button>
              </div>

              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="w-full py-3 bg-gray-900 hover:bg-black text-white text-sm font-heading font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {isSearching ? 'Buscando...' : 'Buscar'}
              </button>
            </form>
          </div>

          {/* Información del usuario */}
          {foundUser && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" /> Asistente Identificado
                  </p>
                  <h3 className="font-heading font-black text-lg text-gray-900">{foundUser.nombre}</h3>
                  <p className="text-sm text-gray-600 font-mono mt-1">CC: {foundUser.cedula}</p>
                </div>
                <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${isSupernova ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                  {ticketType}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Panel Derecho: Redención */}
        <div className={`space-y-6 transition-opacity duration-300 ${foundUser ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          
          {/* Card Almuerzos */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-heading font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <Utensils className="w-4 h-4 text-orange-600" />
                Almuerzos
              </h3>
              <span className="text-xs font-bold px-2.5 py-1 bg-gray-100 rounded-md text-gray-600">
                {almuerzosRedeemed} / {maxAlmuerzos}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {Array.from({ length: maxAlmuerzos }).map((_, i) => (
                <div key={i} className={`flex-1 min-w-[40px] h-2 rounded-full ${i < almuerzosRedeemed ? 'bg-emerald-500' : 'bg-gray-200'}`} />
              ))}
            </div>

            <button
              onClick={() => handleRedeem('almuerzos')}
              disabled={isRedeeming || !canRedeemAlmuerzo}
              className={`w-full py-3.5 text-sm font-heading font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm
                ${canRedeemAlmuerzo 
                  ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/30' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
              {isRedeeming ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {canRedeemAlmuerzo ? 'Registrar Entrega de Almuerzo' : 'Límite Alcanzado'}
            </button>
          </div>

          {/* Card Refrigerios */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-heading font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <Coffee className="w-4 h-4 text-orange-600" />
                Refrigerios
              </h3>
              <span className="text-xs font-bold px-2.5 py-1 bg-gray-100 rounded-md text-gray-600">
                {refrigeriosRedeemed} / {maxRefrigerios}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {Array.from({ length: maxRefrigerios }).map((_, i) => (
                <div key={i} className={`flex-1 min-w-[30px] h-2 rounded-full ${i < refrigeriosRedeemed ? 'bg-emerald-500' : 'bg-gray-200'}`} />
              ))}
            </div>

            <button
              onClick={() => handleRedeem('refrigerios')}
              disabled={isRedeeming || !canRedeemRefrigerio}
              className={`w-full py-3.5 text-sm font-heading font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm
                ${canRedeemRefrigerio 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
              {isRedeeming ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {canRedeemRefrigerio ? 'Registrar Entrega de Refrigerio' : 'Límite Alcanzado'}
            </button>
          </div>

          {/* Mini Historial movido al panel derecho para móvil */}
          {(userComidas.almuerzos?.length > 0 || userComidas.refrigerios?.length > 0) && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mt-6">
              <h4 className="text-sm font-heading font-bold text-gray-900 uppercase tracking-widest mb-4">Historial Reciente</h4>
              <ul className="space-y-2">
                {userComidas.almuerzos?.map((timestamp, i) => (
                  <li key={`almuerzo-${i}`} className="flex items-center justify-between text-xs bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="flex items-center gap-2 font-bold text-gray-700">
                      <Utensils className="w-4 h-4 text-orange-500" />
                      Almuerzo #{i + 1}
                    </span>
                    <span className="text-gray-500 font-mono text-[10px]">
                      {new Date(timestamp).toLocaleDateString()} {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </li>
                ))}
                {userComidas.refrigerios?.map((timestamp, i) => (
                  <li key={`refri-${i}`} className="flex items-center justify-between text-xs bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="flex items-center gap-2 font-bold text-gray-700">
                      <Coffee className="w-4 h-4 text-blue-500" />
                      Refrigerio #{i + 1}
                    </span>
                    <span className="text-gray-500 font-mono text-[10px]">
                      {new Date(timestamp).toLocaleDateString()} {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </div>

      {/* Scanner Modal */}
      {showScanner && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="font-heading font-bold text-gray-900 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-orange-600" />
                Escanear Asistente
              </h3>
              <button 
                onClick={() => setShowScanner(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div className="relative w-full aspect-square max-w-[260px] mx-auto rounded-2xl overflow-hidden bg-black shadow-inner">
                {!scannerReady && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/50 z-10">
                    <ScanLine className="w-8 h-8 animate-pulse" />
                    <span className="text-xs font-mono uppercase tracking-widest">Iniciando...</span>
                  </div>
                )}
                <div id="food-qr-reader" className="w-full h-full [&>video]:object-cover" />
              </div>
              
              {cameras.length > 1 && (
                <button
                  type="button"
                  onClick={handleSwitchCamera}
                  disabled={!scannerReady}
                  className="mt-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 text-xs font-bold font-heading uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-50"
                >
                  <FlipHorizontal className="w-4 h-4" /> Cambiar lente
                </button>
              )}
            </div>
          </div>
          <style>{`
            #food-qr-reader video { width: 100% !important; height: 100% !important; object-fit: cover; }
            #food-qr-reader { border: none !important; }
            #food-qr-reader img[alt="Info icon"],
            #food-qr-reader select,
            #food-qr-reader button:not(.qr-custom-btn),
            #food-qr-reader #food-qr-reader__dashboard_section_csr,
            #food-qr-reader #food-qr-reader__status_span { display: none !important; }
          `}</style>
        </div>,
        document.body
      )}

    </div>
  );
}
