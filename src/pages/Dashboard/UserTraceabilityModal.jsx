import React, { useState, useEffect } from 'react';
import { 
  X, 
  History, 
  User, 
  TrendingUp, 
  TrendingDown, 
  ShoppingBag, 
  Gift,
  AlertCircle,
  Copy,
  Minimize2
} from 'lucide-react';
import { toast } from 'sonner';
import Pagination from '../../components/Pagination';

export default function UserTraceabilityModal({ isOpen, onClose, user, allTransactions = [] }) {
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  if (!isOpen || !user) return null;

  const handleCopyId = (id) => {
    if (!id || id === 'N/A') return;
    navigator.clipboard.writeText(id);
    toast.success('ID copiado al portapapeles');
  };

  // Derive history from allTransactions
  const userUid = user.uid || user.id;
  const history = allTransactions.filter(tx => tx.uid === userUid);

  // Helper to get transaction icon/color based on type or amount
  const getTransactionStyles = (tx) => {
    if (tx.type === 'reward_claim' || tx.puntos < 0) {
      return {
        icon: <Gift className="w-5 h-5 text-red-600" />,
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700'
      };
    }
    if (tx.type === 'store_sale' || tx.storeName || tx.tienda || (tx.code && tx.code.includes('COMPRA_TIENDA'))) {
      return {
        icon: <ShoppingBag className="w-5 h-5 text-emerald-600" />,
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-700'
      };
    }
    if (tx.puntos > 0) {
      return {
        icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700'
      };
    }
    return {
      icon: <TrendingDown className="w-5 h-5 text-gray-600" />,
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-700'
    };
  };

  // Filter history based on active tab
  const filteredHistory = history.filter(tx => {
    if (activeTab === 'all') return true;
    if (activeTab === 'tienda') return tx.type === 'store_sale' || tx.storeName || tx.tienda || (tx.code && tx.code.includes('COMPRA_TIENDA'));
    if (activeTab === 'premios') return tx.type === 'reward_claim' || (tx.code && tx.code.includes('CANJE_'));
    if (activeTab === 'puntos') return !tx.type && !tx.storeName && !tx.tienda && !(tx.code && (String(tx.code).includes('CANJE_') || String(tx.code).includes('COMPRA_TIENDA')));
    return true;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="border-b border-gray-150 p-6 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-xl text-gray-900 tracking-tight">Trazabilidad de Usuario</h2>
              <p className="text-xs text-gray-500 font-medium">Historial completo de acciones y puntos</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* User Summary Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none" />
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-md flex items-center justify-center font-bold text-xl border-4 border-white shrink-0">
                {user.nombre ? user.nombre.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-heading font-black text-lg text-gray-900">{user.nombre || 'Usuario Desconocido'}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-600 font-mono mt-1">
                  <span className="font-bold bg-white/60 px-2 py-0.5 rounded-md border border-gray-200/60">ID: {user.cedula || 'N/A'}</span>
                  <span>{user.correo}</span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right relative z-10 shrink-0">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-0.5">Saldo Actual</span>
              <span className="font-mono text-3xl font-black text-blue-700">{Number(user.puntos || 0).toLocaleString()} <span className="text-sm">PTS</span></span>
            </div>
          </div>

          {/* Tabs and Timeline */}
          <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <h4 className="font-heading font-bold text-sm text-gray-900 flex items-center gap-2 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                Registro de Actividad
              </h4>

              {/* Tabs */}
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${activeTab === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Todo
                </button>
                <button
                  onClick={() => setActiveTab('tienda')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${activeTab === 'tienda' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> Tienda
                </button>
                <button
                  onClick={() => setActiveTab('premios')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${activeTab === 'premios' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Gift className="w-3.5 h-3.5" /> Premios
                </button>
                <button
                  onClick={() => setActiveTab('puntos')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${activeTab === 'puntos' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Puntos
                </button>
              </div>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-center bg-gray-50 rounded-2xl border border-gray-100">
                <AlertCircle className="w-10 h-10 text-gray-300" />
                <p className="text-sm font-medium text-gray-500">No hay transacciones registradas en esta categoría.</p>
              </div>
            ) : (
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {paginatedHistory.map((tx, index) => {
                  const style = getTransactionStyles(tx);
                  const isPositive = Number(tx.puntos) > 0;
                  const date = tx.fecha ? new Date(tx.fecha) : new Date();

                  return (
                    <div key={tx.id || index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      {/* Timeline Icon */}
                      <div className={`flex items-center justify-center w-12 h-12 rounded-full border-4 border-white ${style.bg} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 transition-transform group-hover:scale-110`}>
                        {style.icon}
                      </div>
                      
                      {/* Content Card */}
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-4 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-mono text-sm font-black ${style.text}`}>
                            {isPositive ? '+' : ''}{Number(tx.puntos).toLocaleString()} PTS
                          </span>
                          <span className="text-[10px] font-mono text-gray-400">
                            {date.toLocaleDateString()} {date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        <h5 className="font-heading font-bold text-gray-900 text-sm mb-1">{tx.transactionName || tx.descripcion || 'Transacción'}</h5>
                        <p className="text-xs text-gray-500 font-medium">
                          {tx.transactionDescription || (tx.storeName || tx.tienda ? `Compra en: ${tx.storeName || tx.tienda}` : tx.razon || 'Movimiento de puntos')}
                        </p>
                        
                        {(tx.storeName || tx.tienda || (tx.code && tx.code.includes('COMPRA_TIENDA'))) && (
                          <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between">
                            <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Tienda</span>
                            <span className="font-mono text-xs font-bold text-gray-700">{tx.storeName || tx.tienda || 'Tienda SAIO'}</span>
                          </div>
                        )}
                        <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between">
                          <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">ID Transacción</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] font-bold text-gray-500 truncate max-w-[120px]" title={tx.id || tx.code}>{tx.id || tx.code || 'N/A'}</span>
                            {(tx.id || tx.code) && (
                              <button 
                                onClick={() => handleCopyId(tx.id || tx.code)}
                                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                                title="Copiar ID"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        {tx.montoCop && (
                          <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between">
                            <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Monto COP</span>
                            <span className="font-mono text-xs font-bold text-gray-700">${Number(tx.montoCop).toLocaleString()}</span>
                          </div>
                        )}
                        {tx.metodoPago && (
                          <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between">
                            <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Método Pago</span>
                            <span className="font-mono text-xs font-bold text-gray-700 uppercase">{tx.metodoPago}</span>
                          </div>
                        )}
                        {tx.costoPoints && (
                          <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between">
                            <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Costo Premio</span>
                            <span className="font-mono text-xs font-bold text-red-600">-{Number(tx.costoPoints).toLocaleString()} PTS</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {totalPages > 1 && (
                  <div className="relative z-10 pt-4 bg-white md:bg-transparent">
                    <Pagination 
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                      theme="light"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
