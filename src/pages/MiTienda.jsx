import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { storeService } from '../services/storeService';
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
  CreditCard
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { ROLES } from '../constants/roles';

export default function MiTienda() {
  const { user, logout } = useAuth();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [attendee, setAttendee] = useState(null);
  
  const [amount, setAmount] = useState('');
  const [rules, setRules] = useState([]);
  const [loadingRules, setLoadingRules] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Completed Sale Modal State
  const [lastSaleResult, setLastSaleResult] = useState(null);
  const [salesHistory, setSalesHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const storeName = user?.tiendaNombre || user?.nombre || 'Tienda SAIO-XV';

  // Load rules & history on mount
  useEffect(() => {
    loadRulesAndHistory();
  }, [user]);

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
        pointsCalculated
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
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 flex flex-col font-sans select-none antialiased">
      {/* Google-style Clean Top Bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-3.5 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <Store className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-bold text-gray-900 text-base tracking-tight">{storeName}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold">
                  Punto de Venta
                </span>
              </div>
              <span className="text-xs text-gray-500 font-sans">SAIO-XV Comercio Oficial</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {(user?.rol === ROLES.ADMIN || user?.rol === ROLES.COORDINADOR) && (
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
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Sales Card (Google Material Clean White Card) */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
          <div className="border-b border-gray-150 pb-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="text-lg font-heading font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                <span>Registrar Venta de Comercio</span>
              </h2>
              <p className="text-gray-500 text-xs mt-0.5">Ingresa la cédula o código del comprador para otorgarle sus puntos estelares.</p>
            </div>

            {attendee && (
              <button
                onClick={handleClearAttendee}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200 text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Cambiar Asistente</span>
              </button>
            )}
          </div>

          {/* Step 1: Search Attendee */}
          <div className="space-y-3 mb-6">
            <label className="text-xs font-heading font-bold text-gray-700 uppercase tracking-wider block">
              1. Identificación del Asistente (Cédula / Correo / UID)
            </label>

            {!attendee ? (
              <form onSubmit={handleSearchAttendee} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Escribe Cédula, Correo o UID..."
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 font-mono shadow-xs"
                    disabled={searching}
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching || !searchQuery.trim()}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-heading text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2 shadow-xs"
                >
                  {searching ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Buscar</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Selected Attendee Summary Box */
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-gray-900 flex items-center gap-2">
                      <span>{attendee.nombre || 'Asistente'}</span>
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    </h3>
                    <p className="text-xs text-gray-600 font-mono mt-0.5">
                      Cédula: <span className="font-bold text-gray-900">{attendee.cedula || 'N/A'}</span> • {attendee.correo || attendee.email}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Puntos Actuales</span>
                  <span className="font-mono text-base font-extrabold text-blue-700">
                    {(attendee.puntos || 0).toLocaleString()} PTS
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Sale Amount */}
          <div className="space-y-3 mb-8">
            <label className="text-xs font-heading font-bold text-gray-700 uppercase tracking-wider block">
              2. Monto de la Venta ($ COP)
            </label>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-heading font-bold text-xl">
                $
              </div>
              <input
                type="number"
                min="0"
                step="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-10 pr-4 py-3.5 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-2xl font-mono font-bold text-gray-900 placeholder-gray-300 outline-none transition-all duration-200 shadow-xs"
              />
            </div>

            {/* Quick Add Buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[5000, 10000, 20000, 50000, 100000].map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleQuickAddAmount(preset)}
                  className="px-3.5 py-1.5 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-gray-200 text-xs font-mono font-semibold text-gray-700 transition-all cursor-pointer"
                >
                  +${preset.toLocaleString()}
                </button>
              ))}
              {amount && (
                <button
                  type="button"
                  onClick={() => setAmount('')}
                  className="px-3.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-mono text-red-600 transition-colors cursor-pointer"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Live Points Calculated Card */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4.5 h-4.5 text-purple-600" />
                </div>
                <div>
                  <span className="text-xs font-heading font-bold text-gray-900 block">Puntos Acreditar a la Compra</span>
                  <span className="text-[11px] text-gray-500">
                    {pointsCalculated > 0 
                      ? `Calculados por rango de $${numAmount.toLocaleString()} COP`
                      : 'Monto menor al rango mínimo para otorgar puntos'
                    }
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-2xl font-mono font-extrabold text-purple-700">
                  +{pointsCalculated.toLocaleString()} PTS
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleProcessSale}
            disabled={!attendee || numAmount <= 0 || isProcessing}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-heading font-bold text-xs uppercase tracking-wider shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Procesando Venta...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4.5 h-4.5" />
                <span>Procesar Venta y Otorgar +{pointsCalculated} PTS</span>
              </>
            )}
          </button>
        </section>

        {/* Recent Store Sales History */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-150 pb-3">
            <h3 className="font-heading font-bold text-sm text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <span>Ventas Recientes de la Tienda</span>
            </h3>
            <span className="text-xs text-gray-500 font-mono">{salesHistory.length} Registradas</span>
          </div>

          <div className="divide-y divide-gray-100">
            {loadingHistory ? (
              <div className="py-6 text-center text-xs text-gray-500 animate-pulse">Cargando historial de ventas...</div>
            ) : salesHistory.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-500">
                No se registran ventas el día de hoy.
              </div>
            ) : (
              salesHistory.map((sale) => (
                <div key={sale.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 shrink-0">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-gray-900 block">{sale.attendeeNombre || 'Asistente'}</span>
                      <span className="text-[11px] text-gray-500 font-mono">
                        Cédula: {sale.attendeeCedula || 'N/A'} • {new Date(sale.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-gray-900 block">${Number(sale.montoCop).toLocaleString()} COP</span>
                    <span className="text-[11px] font-mono font-bold text-purple-700">+{Number(sale.puntosOtorgados).toLocaleString()} PTS</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

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
