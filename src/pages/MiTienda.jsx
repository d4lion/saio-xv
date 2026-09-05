import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { storeService } from '../services/storeService';
import { createPortal } from 'react-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  Store, 
  Search, 
  UserCheck, 
  Sparkles, 
  CheckCircle2, 
  LogOut, 
  ShoppingBag, 
  RotateCcw, 
  Clock, 
  LayoutDashboard,
  Building,
  User,
  CreditCard,
  QrCode,
  X,
  Camera,
  FlipHorizontal,
  ScanLine,
  Banknote,
  Smartphone,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { ROLES } from '../constants/roles';
import Pagination from '../components/Pagination';

export default function MiTienda() {
  const { user, logout } = useAuth();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [attendee, setAttendee] = useState(null);
  
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [rules, setRules] = useState([]);
  const [loadingRules, setLoadingRules] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Completed Sale Modal State
  const [lastSaleResult, setLastSaleResult] = useState(null);
  const [salesHistory, setSalesHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Scanner States
  const [showScanner, setShowScanner] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [activeCameraIndex, setActiveCameraIndex] = useState(0);
  const [scannerReady, setScannerReady] = useState(false);
  const scannerRef = React.useRef(null);
  const isScanningRef = React.useRef(false);

  const storeName = user?.tiendaNombre || user?.nombre || 'Tienda SAIO-XV';

  // Load rules & history on mount
  useEffect(() => {
    loadRulesAndHistory();
  }, [user]);

  // ── QR Scanner Logic ──
  const stopScanner = React.useCallback(async () => {
    if (scannerRef.current && isScanningRef.current) {
      try { await scannerRef.current.stop(); } catch (_) {}
      isScanningRef.current = false;
    }
  }, []);

  const startScanner = React.useCallback(async (cameraId) => {
    if (!scannerRef.current) return;
    await stopScanner();
    try {
      await scannerRef.current.start(
        cameraId,
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        async (decodedText) => {
          await stopScanner();
          setShowScanner(false);
          // Parse potential URL or raw code
          let rawCode = decodedText.trim();
          try {
            const url = new URL(decodedText);
            if (url.pathname.includes('mis-puntos')) {
               rawCode = url.searchParams.get('code') || rawCode;
            }
          } catch (_) {}
          setSearchQuery(rawCode);
          handleSearchAttendeeDirect(rawCode);
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

  const handleSearchAttendeeDirect = async (query) => {
    if (!query) return;
    setSearching(true);
    try {
      const found = await storeService.findAttendee(query);
      if (found) {
        setAttendee(found);
        toast.success(`Asistente encontrado: ${found.nombre || 'Asistente'}`);
      } else {
        setAttendee(null);
        toast.error('No se encontró ningún asistente registrado.');
      }
    } catch (err) {
      toast.error('Error al buscar asistente.');
    } finally {
      setSearching(false);
    }
  };

  const loadRulesAndHistory = async () => {
    setLoadingRules(true);
    try {
      const activeRules = await storeService.getStoreRules();
      setRules(activeRules);
      if (user?.uid) {
        setLoadingHistory(true);
        const history = await storeService.getVendorSalesHistory(user.uid);
        setSalesHistory(history);
        setLoadingHistory(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRules(false);
    }
  };

  const handleSearchAttendee = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error('Ingresa la Cédula, Correo o UID del asistente.');
      return;
    }

    setSearching(true);
    try {
      const found = await storeService.findAttendee(searchQuery);
      if (found) {
        setAttendee(found);
        toast.success(`Asistente encontrado: ${found.nombre || 'Asistente'}`);
      } else {
        setAttendee(null);
        toast.error('No se encontró ningún asistente registrado.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al buscar asistente.');
    } finally {
      setSearching(false);
    }
  };

  const handleClearAttendee = () => {
    setAttendee(null);
    setSearchQuery('');
  };

  // Calculate live points preview
  const numAmount = Number(amount) || 0;
  const pointsCalculated = storeService.calculatePointsForAmount(numAmount, rules);

  const handleQuickAddAmount = (addVal) => {
    setAmount(prev => String((Number(prev) || 0) + addVal));
  };

  const handleProcessSale = async (e) => {
    e.preventDefault();
    if (!attendee) {
      toast.error('Debes buscar e identificar a un asistente primero.');
      return;
    }

    if (numAmount <= 0) {
      toast.error('El monto de la venta debe ser mayor a $0 COP.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await storeService.processStoreSale({
        vendorUid: user?.uid || 'vendedor',
        storeName,
        attendee,
        amount: numAmount,
        pointsCalculated,
        paymentMethod
      });

      setLastSaleResult({
        saleId: res.saleId,
        attendeeNombre: attendee.nombre || 'Asistente',
        attendeeCedula: attendee.cedula || 'N/A',
        montoCop: numAmount,
        puntosOtorgados: pointsCalculated,
        nuevoSaldoPuntos: (attendee.puntos || 0) + pointsCalculated
      });

      toast.success(`¡Venta procesada! +${pointsCalculated} PTS para ${attendee.nombre}`);

      // Refresh sales history
      if (user?.uid) {
        const history = await storeService.getVendorSalesHistory(user.uid);
        setSalesHistory(history);
        setCurrentPage(1); // Reset to page 1 on new sale
      }
    } catch (err) {
      console.error(err);
      toast.error(`Error al procesar la venta: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetFormForNewSale = () => {
    setLastSaleResult(null);
    setAttendee(null);
    setSearchQuery('');
    setAmount('');
    setPaymentMethod('Efectivo');
  };

  const handleCopyId = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    toast.success('ID de transacción copiado');
  };

  const itemsPerPage = 5;
  const totalPages = Math.ceil(salesHistory.length / itemsPerPage);
  const paginatedSales = salesHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-gray-900 flex flex-col font-sans select-none antialiased relative pb-32 sm:pb-8">
      {/* Neo-Banking Top Bar */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 px-4 sm:px-6 py-3 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[1rem] bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
              <Store className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="font-heading font-extrabold text-gray-900 text-sm sm:text-base tracking-tight truncate max-w-[140px] sm:max-w-[200px]">{storeName}</h1>
                <span className="px-2 py-0.5 rounded-full bg-blue-100/50 text-blue-700 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                  POS
                </span>
              </div>
              <span className="text-[10px] sm:text-xs text-gray-500 font-medium">Comercio Oficial</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {((user?.rol ? String(user.rol).toLowerCase() : '') === ROLES.ADMIN || (user?.rol ? String(user.rol).toLowerCase() : '') === ROLES.COORDINADOR) && (
              <Link
                to="/dashboard"
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-heading font-semibold border border-gray-200 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-gray-600" />
                <span>Dashboard</span>
              </Link>
            )}

            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 text-xs font-heading font-semibold border border-gray-200 cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-lg lg:max-w-3xl w-full mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        
        {/* Sales Card (Neo-Banking Style) */}
        <section className="bg-white rounded-[2rem] border border-gray-100 p-5 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 relative z-10">
            <div>
              <h2 className="text-xl sm:text-2xl font-heading font-black text-gray-900 tracking-tight">Nueva Venta</h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-1 font-medium">Identifica al comprador para otorgar puntos.</p>
            </div>

            {attendee && (
              <button
                onClick={handleClearAttendee}
                className="w-full sm:w-auto flex justify-center items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-bold text-gray-600 transition-colors cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Cambiar Cliente</span>
              </button>
            )}
          </div>

          {/* Step 1: Search Attendee */}
          <div className="space-y-3 mb-8 relative z-10">
            {!attendee ? (
              <div className="space-y-4">
                <label className="text-[11px] sm:text-xs font-heading font-black text-gray-400 uppercase tracking-widest block pl-1">
                  Paso 1: Identificación
                </label>
                <form onSubmit={handleSearchAttendee} className="flex flex-col gap-3">
                  <div className="relative w-full flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cédula, Correo o UID..."
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl text-base text-gray-900 placeholder-gray-400 outline-none transition-all duration-300 font-mono font-medium shadow-inner"
                        disabled={searching}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowScanner(true)}
                      className="px-4 rounded-2xl bg-black text-white hover:bg-gray-800 transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-lg active:scale-95"
                      title="Escanear QR de Pasaporte"
                    >
                      <QrCode className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={searching || !searchQuery.trim()}
                    className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-heading text-[13px] font-extrabold uppercase tracking-widest cursor-pointer disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 active:scale-95"
                  >
                    {searching ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>Buscar Cliente</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* Selected Attendee Smart Card */
              <div className="space-y-3">
                <label className="text-[11px] sm:text-xs font-heading font-black text-emerald-500 uppercase tracking-widest block pl-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Cliente Identificado
                </label>
                <div className="p-4 sm:p-5 rounded-[1.5rem] bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-100 flex flex-col gap-4 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/10 blur-[40px] rounded-full pointer-events-none" />
                  
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0 ring-4 ring-white">
                      {attendee.nombre ? attendee.nombre.charAt(0).toUpperCase() : <UserCheck className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-black text-base text-gray-900 truncate">
                        {attendee.nombre || 'Asistente'}
                      </h3>
                      <p className="text-xs text-gray-500 font-mono mt-0.5 truncate">
                        ID: <span className="font-bold text-gray-800">{attendee.cedula || 'N/A'}</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[9px] text-gray-500 uppercase font-black block tracking-wider">Saldo</span>
                      <span className="font-mono text-lg font-black text-emerald-700">
                        {(attendee.puntos || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Sale Amount */}
          <div className={`space-y-4 transition-all duration-500 ${attendee ? 'opacity-100 scale-100' : 'opacity-40 scale-[0.98] pointer-events-none'}`}>
            <label className="text-[11px] sm:text-xs font-heading font-black text-gray-400 uppercase tracking-widest block pl-1">
              Paso 2: Valor de la Compra
            </label>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-6 pointer-events-none">
                <span className="text-gray-400 font-heading font-bold text-3xl sm:text-4xl">$</span>
              </div>
              <input
                type="number"
                min="0"
                step="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-14 pr-6 py-5 sm:py-6 bg-gray-50/50 border border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-3xl text-4xl sm:text-5xl font-mono font-black text-gray-900 placeholder-gray-300 outline-none transition-all duration-300 shadow-inner"
              />
            </div>

            {/* Quick Add Buttons (Horizontal Scroll/Wrap on Mobile) */}
            <div className="flex flex-wrap gap-2 sm:gap-3 pt-2">
              {[5000, 10000, 20000, 50000].map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleQuickAddAmount(preset)}
                  className="flex-1 min-w-[70px] py-3 rounded-2xl bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-gray-200 text-sm font-mono font-bold text-gray-600 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  +{preset/1000}k
                </button>
              ))}
              {amount && (
                <button
                  type="button"
                  onClick={() => setAmount('')}
                  className="flex-none px-4 py-3 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-100 text-sm font-mono font-bold text-red-600 transition-colors cursor-pointer shadow-sm active:scale-95"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="pt-2 pb-2">
              <label className="text-[11px] sm:text-xs font-heading font-black text-gray-400 uppercase tracking-widest block pl-1 mb-3">
                Método de Pago
              </label>
              <div className="flex gap-2">
                {[
                  { id: 'Efectivo', icon: Banknote },
                  { id: 'Tarjeta', icon: CreditCard },
                  { id: 'Transferencia', icon: Smartphone }
                ].map(method => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex-1 py-3 px-2 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 border ${
                      paymentMethod === method.id 
                        ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-blue-500/20' 
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <method.icon className={`w-5 h-5 ${paymentMethod === method.id ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{method.id}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Points Calculated Card */}
            <div className={`p-4 sm:p-5 rounded-[1.5rem] flex items-center justify-between border transition-all duration-300 ${pointsCalculated > 0 ? 'bg-purple-50/50 border-purple-200 shadow-sm' : 'bg-gray-50 border-gray-100'}`}>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${pointsCalculated > 0 ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30' : 'bg-gray-200 text-gray-400'}`}>
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <span className={`text-[11px] sm:text-xs font-heading font-black uppercase tracking-wider block ${pointsCalculated > 0 ? 'text-purple-700' : 'text-gray-500'}`}>Recompensa</span>
                  <span className="text-[10px] sm:text-xs text-gray-500">
                    {pointsCalculated > 0 ? 'Puntos listos para enviar' : 'Monto mínimo requerido'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-2xl sm:text-3xl font-mono font-black ${pointsCalculated > 0 ? 'text-purple-700' : 'text-gray-300'}`}>
                  +{pointsCalculated.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Desktop Process Button (Hidden on Mobile) */}
        <div className="hidden sm:block">
          <button
            onClick={handleProcessSale}
            disabled={!attendee || numAmount <= 0 || isProcessing}
            className="w-full py-4 rounded-[1.5rem] bg-black hover:bg-gray-900 text-white font-heading font-black text-sm uppercase tracking-widest shadow-xl shadow-black/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Acreditar Puntos</span>
              </>
            )}
          </button>
        </div>

        {/* Recent Store Sales History */}
        <section className="bg-white rounded-[2rem] border border-gray-100 p-5 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h3 className="font-heading font-black text-sm text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              Últimas Ventas
            </h3>
            <span className="px-3 py-1 rounded-full bg-gray-100 text-[10px] text-gray-600 font-bold uppercase tracking-wider">{salesHistory.length} Hoy</span>
          </div>

          <div className="divide-y divide-gray-50">
            {loadingHistory ? (
              <div className="py-8 text-center text-xs font-mono text-gray-400 animate-pulse">Cargando operaciones...</div>
            ) : salesHistory.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-gray-400">
                Aún no hay ventas registradas.
              </div>
            ) : (
              paginatedSales.map((sale) => (
                <div key={sale.id} className="py-4 flex items-center justify-between gap-4 group hover:bg-gray-50/50 transition-colors rounded-2xl -mx-2 px-2">
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 shrink-0 group-hover:scale-110 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                      <ShoppingBag className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-heading font-bold text-sm text-gray-900 block truncate">{sale.attendeeNombre || 'Cliente'}</span>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-0.5 text-[10px] text-gray-400 font-mono tracking-wide">
                        <span className="flex items-center gap-1">
                          <Store className="w-3 h-3" />
                          <span className="truncate">{sale.storeName || 'Tienda SAIO'}</span>
                        </span>
                        <span className="hidden sm:inline text-gray-300">•</span>
                        <span className="truncate" title={sale.id}>ID: {sale.id}</span>
                        <button 
                          onClick={() => handleCopyId(sale.id)}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors cursor-pointer ml-1"
                          title="Copiar ID"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <span className="hidden sm:inline text-gray-300">•</span>
                        <span>{new Date(sale.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {sale.metodoPago && (
                          <>
                            <span className="hidden sm:inline text-gray-300">•</span>
                            <span className="font-bold text-gray-500 uppercase">{sale.metodoPago}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-sm font-black text-gray-900 block">${Number(sale.montoCop).toLocaleString()}</span>
                    <span className="text-[10px] font-mono font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md mt-1 inline-block">+{Number(sale.puntosOtorgados).toLocaleString()} PTS</span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                theme="light"
              />
            </div>
          )}
        </section>
      </main>

      {/* Sticky Bottom Action Bar (Mobile Only) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-gray-200/50 z-40 pb-safe shadow-[0_-10px_40px_rgb(0,0,0,0.05)]">
        <button
          onClick={handleProcessSale}
          disabled={!attendee || numAmount <= 0 || isProcessing}
          className="w-full py-4 rounded-[1.5rem] bg-black hover:bg-gray-900 text-white font-heading font-black text-sm uppercase tracking-widest shadow-xl shadow-black/20 cursor-pointer disabled:opacity-40 transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Procesando...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>Confirmar Venta</span>
            </>
          )}
        </button>
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

      {/* Sale Confirmation Receipt Dialog */}
      {lastSaleResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-6 shadow-2xl text-center space-y-5 relative text-gray-900">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-heading font-extrabold text-gray-900">¡Venta Procesada Exitosamente!</h3>
              <p className="text-xs text-gray-500 font-mono mt-1">ID: {lastSaleResult.saleId}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2.5 text-xs text-left">
              <div className="flex justify-between items-center border-b border-gray-200 pb-1.5">
                <span className="text-gray-500">Asistente:</span>
                <span className="font-bold text-gray-900">{lastSaleResult.attendeeNombre}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-1.5">
                <span className="text-gray-500">Cédula:</span>
                <span className="font-mono font-bold text-gray-900">{lastSaleResult.attendeeCedula}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-1.5">
                <span className="text-gray-500">Monto Venta:</span>
                <span className="font-mono font-bold text-gray-900">${lastSaleResult.montoCop.toLocaleString()} COP</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-1.5">
                <span className="text-gray-500">Puntos Otorgados:</span>
                <span className="font-mono font-extrabold text-purple-700">+{lastSaleResult.puntosOtorgados.toLocaleString()} PTS</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-gray-500">Nuevo Saldo del Asistente:</span>
                <span className="font-mono font-extrabold text-blue-700">{lastSaleResult.nuevoSaldoPuntos.toLocaleString()} PTS</span>
              </div>
            </div>

            <button
              onClick={handleResetFormForNewSale}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-heading font-bold text-xs uppercase tracking-wider shadow-xs cursor-pointer transition-colors"
            >
              Realizar Nueva Venta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
