import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Search, Shield, DollarSign, Award, ArrowRight, RefreshCw, QrCode, CheckCircle, X, FlipHorizontal, ScanLine } from 'lucide-react';
import { toast } from 'sonner';
import { createPortal } from 'react-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { storeService } from '../../services/storeService';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

export default function AdminPointsTab({ storeRules }) {
  const { user } = useAuth();
  
  // States for search
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundUser, setFoundUser] = useState(null);

  // States for assignment
  const [selectedRuleId, setSelectedRuleId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // QR Scanner States
  const [showScanner, setShowScanner] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [activeCameraIndex, setActiveCameraIndex] = useState(0);
  const [scannerReady, setScannerReady] = useState(false);
  const scannerRef = useRef(null);
  const isScanningRef = useRef(false);

  // Computed selected rule
  const selectedRule = useMemo(() => {
    return storeRules?.find(r => r.id === selectedRuleId) || null;
  }, [storeRules, selectedRuleId]);

  // Set default selection when rules load
  useEffect(() => {
    if (storeRules?.length > 0 && !selectedRuleId) {
      setSelectedRuleId(storeRules[0].id);
    }
  }, [storeRules, selectedRuleId]);

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

    const el = document.getElementById('store-qr-reader');
    if (!el) return;

    scannerRef.current = new Html5Qrcode('store-qr-reader', { verbose: false });
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
        toast.success(`Usuario encontrado: ${attendee.nombre}`);
      } else {
        toast.error('No se encontró ningún usuario con ese dato.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al buscar al usuario.');
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

  // 3. Confirm and Assign Points
  const handleAssignPoints = async () => {
    if (!foundUser) return;
    if (!selectedRule) {
      toast.error('Por favor selecciona una regla válida.');
      return;
    }

    const confirm = await Swal.fire({
      icon: 'question',
      title: '¿Confirmar Asignación?',
      html: `
        Vas a asignar <b>${selectedRule.puntos} PTS</b> a <b>${foundUser.nombre}</b><br/>
        por el motivo: <b>${selectedRule.nombre}</b>.
      `,
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirm.isConfirmed) return;

    try {
      setIsAssigning(true);
      await adminService.assignPointsForPurchase({
        adminUid: user.uid,
        adminName: user.nombre || 'Administrador',
        attendeeUid: foundUser.uid,
        amount: 0, // Placeholder
        pointsCalculated: selectedRule.puntos
      });

      toast.success('¡Puntos asignados exitosamente!');
      
      // Reset form
      setSearchQuery('');
      setFoundUser(null);
    } catch (err) {
      console.error(err);
      toast.error(`Error al asignar puntos: ${err.message}`);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-heading font-black text-gray-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-purple-600" />
            Asignación Manual de Puntos
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Busca a un asistente por Cédula, Correo o Escanea su UID para registrar una asignación y otorgarle puntos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Panel Izquierdo: Búsqueda */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="text-sm font-heading font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Search className="w-4 h-4 text-purple-600" />
            Buscar Asistente
          </h3>

          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                Cédula, Correo o UID
              </label>
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <QrCode className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Escanea o digita..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors"
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

          {/* Información del usuario encontrado */}
          {foundUser && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Asistente Identificado
              </p>
              <div className="space-y-1">
                <p className="text-sm text-gray-900 font-semibold">{foundUser.nombre}</p>
                <p className="text-xs text-gray-600">CC: {foundUser.cedula}</p>
                <p className="text-xs text-gray-600">Correo: {foundUser.correo || foundUser.email}</p>
                <p className="text-xs text-purple-700 font-bold mt-2">Puntos Actuales: {foundUser.puntos || 0} PTS</p>
              </div>
            </div>
          )}
        </div>

        {/* Panel Derecho: Asignación */}
        <div className={`bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col transition-opacity duration-300 ${foundUser ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <h3 className="text-sm font-heading font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-purple-600" />
            Regla de Asignación
          </h3>

          <div className="flex-1 flex flex-col gap-6">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                Selecciona el Motivo/Regla
              </label>
              <div className="relative">
                <select
                  value={selectedRuleId}
                  onChange={(e) => setSelectedRuleId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors appearance-none cursor-pointer"
                  disabled={isAssigning}
                >
                  <option value="" disabled>Selecciona una regla...</option>
                  {storeRules?.filter(r => r.activo).map(r => (
                    <option key={r.id} value={r.id}>
                      {r.nombre} (+{r.puntos} PTS)
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-between mt-auto">
              <div>
                <p className="text-xs text-purple-700 font-semibold uppercase tracking-wider">Puntos a otorgar</p>
                <p className="text-xs text-purple-600/70 mt-0.5">Basado en regla seleccionada</p>
              </div>
              <div className="text-2xl font-heading font-black text-purple-700">
                +{selectedRule ? selectedRule.puntos : 0} <span className="text-sm">PTS</span>
              </div>
            </div>

            <button
              onClick={handleAssignPoints}
              disabled={isAssigning || !selectedRule || selectedRule.puntos <= 0}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-heading font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isAssigning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {isAssigning ? 'Procesando...' : 'Otorgar Puntos'}
            </button>
          </div>
        </div>
      </div>

      {/* Scanner Modal */}
      {showScanner && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="font-heading font-bold text-gray-900 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-600" />
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
                <div id="store-qr-reader" className="w-full h-full [&>video]:object-cover" />
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
            #store-qr-reader video { width: 100% !important; height: 100% !important; object-fit: cover; }
            #store-qr-reader { border: none !important; }
            #store-qr-reader img[alt="Info icon"],
            #store-qr-reader select,
            #store-qr-reader button:not(.qr-custom-btn),
            #store-qr-reader #store-qr-reader__dashboard_section_csr,
            #store-qr-reader #store-qr-reader__status_span { display: none !important; }
          `}</style>
        </div>,
        document.body
      )}

    </div>
  );
}
