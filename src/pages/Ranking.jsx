import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { pointsService } from '../services/pointsService';
import { Trophy, Award, Medal, Crown, Coins, RefreshCw } from 'lucide-react';
import UserNav from '../components/UserNav/UserNav';

export default function Ranking() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadRanking = async () => {
    if (!user?.uid) return;
    setIsLoading(true);
    try {
      // Cargamos el top 100 para computar también el ranking exacto del usuario
      const topUsers = await pointsService.getLeaderboard(100);
      setLeaderboard(topUsers.slice(0, 10));
      
      const index = topUsers.findIndex(u => u.uid === user.uid);
      if (index !== -1) {
        setUserRank(index + 1);
      } else {
        setUserRank(null);
      }
    } catch (err) {
      console.error("Error al cargar ranking:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRanking();
  }, [user]);

  // Auxiliar para reorganizar el podio en orden visual: 2do (izquierda), 1ro (centro), 3ro (derecha)
  const getPodiumList = () => {
    const podium = [];
    if (leaderboard[1]) podium.push({ ...leaderboard[1], position: 2 });
    if (leaderboard[0]) podium.push({ ...leaderboard[0], position: 1 });
    if (leaderboard[2]) podium.push({ ...leaderboard[2], position: 3 });
    return podium;
  };

  const podiumUsers = getPodiumList();
  const remainingUsers = leaderboard.slice(3);

  // Obtener iniciales del nombre
  const getInitials = (name) => {
    if (!name) return 'EX';
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#040b0f] text-white flex flex-col font-sans relative overflow-hidden select-none">
      {/* Nebulosas */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-primary/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Header */}
      <header className="glass-light border-b border-muted/20 px-6 py-4 sticky top-0 backdrop-blur-md z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center glow-purple">
              <span className="text-white font-heading font-extrabold text-sm">S</span>
            </div>
            <div>
              <span className="font-heading font-bold text-white text-md tracking-tight block">Tabla de Posiciones</span>
              <span className="text-[10px] text-accent tracking-widest uppercase">Podio de Exploradores</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={loadRanking} 
              className="p-2 hover:bg-white/5 rounded-xl border border-muted/10 text-secondary hover:text-white cursor-pointer transition-colors"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/20 border border-muted/10 text-xs font-semibold">
              <Coins className="w-3.5 h-3.5 text-accent shrink-0" />
              <span>Balance: <span className="text-white font-mono">{(user?.puntos || 0).toLocaleString()} PTS</span></span>
            </div>
          </div>
        </div>
      </header>

      <UserNav />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-8 z-20">
        {/* Cargando */}
        {isLoading ? (
          <div className="py-24 text-center text-secondary text-sm flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="font-heading text-xs tracking-wider uppercase">Ordenando el Podio Estelar...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="py-24 text-center text-secondary text-sm leading-relaxed">
            No se han registrado usuarios con puntos en el evento aún.
          </div>
        ) : (
          <>
            {/* Sección del Podio (Top 3) */}
            <section className="relative pt-6">
              <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent blur-3xl pointer-events-none rounded-3xl"></div>
              
              <div className="flex items-end justify-center gap-3 sm:gap-6 pt-10 pb-4 max-w-lg mx-auto relative z-10">
                {podiumUsers.map((pUser) => {
                  const isGold = pUser.position === 1;
                  const isSilver = pUser.position === 2;
                  const isBronze = pUser.position === 3;
                  const isSelf = pUser.uid === user?.uid;

                  return (
                    <div 
                      key={pUser.uid} 
                      className={`flex flex-col items-center w-28 sm:w-32 transition-transform duration-300 hover:-translate-y-1
                        ${isGold ? 'order-2 z-10 scale-105 sm:scale-110' : isSilver ? 'order-1' : 'order-3'}`}
                    >
                      {/* Avatar del Podio */}
                      <div className="relative mb-3 flex flex-col items-center">
                        {isGold && <Crown className="w-6 h-6 text-yellow-400 absolute -top-5 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)] animate-bounce" />}
                        
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-heading font-bold text-sm border-2 shadow-lg
                          ${isGold 
                            ? 'bg-yellow-500/20 border-yellow-400 text-yellow-200 shadow-yellow-500/10' 
                            : isSilver 
                              ? 'bg-slate-400/20 border-slate-300 text-slate-200 shadow-slate-400/10' 
                              : 'bg-amber-700/20 border-amber-600 text-amber-200 shadow-amber-700/10'
                          } ${isSelf ? 'ring-2 ring-accent ring-offset-2 ring-offset-[#040b0f]' : ''}`}
                        >
                          {getInitials(pUser.nombre)}
                        </div>

                        {/* Medalla de posición */}
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold border shadow
                          ${isGold 
                            ? 'bg-yellow-400 border-yellow-500 text-[#040b0f]' 
                            : isSilver 
                              ? 'bg-slate-300 border-slate-400 text-[#040b0f]' 
                              : 'bg-amber-600 border-amber-700 text-white'
                          }`}
                        >
                          {pUser.position}
                        </div>
                      </div>

                      {/* Info del usuario */}
                      <div className="text-center w-full mb-2">
                        <p className={`text-xs font-bold truncate px-1 ${isSelf ? 'text-accent' : 'text-white'}`}>
                          {pUser.nombre}
                        </p>
                        <p className={`text-[10px] font-extrabold font-mono mt-0.5
                          ${isGold ? 'text-yellow-400' : isSilver ? 'text-slate-300' : 'text-amber-500'}`}>
                          {(pUser.puntos || 0).toLocaleString()} PTS
                        </p>
                      </div>

                      {/* Pedestal */}
                      <div 
                        className={`w-full rounded-t-2xl border-t border-x relative overflow-hidden flex flex-col justify-end items-center pb-2 shadow-inner
                          ${isGold 
                            ? 'h-24 sm:h-28 bg-gradient-to-b from-yellow-500/10 to-yellow-500/2 border-yellow-500/20' 
                            : isSilver 
                              ? 'h-18 sm:h-20 bg-gradient-to-b from-slate-400/10 to-slate-400/2 border-slate-400/15' 
                              : 'h-12 sm:h-14 bg-gradient-to-b from-amber-700/10 to-amber-700/2 border-amber-700/15'}`}
                      >
                        <span className={`font-heading font-extrabold text-sm opacity-25
                          ${isGold ? 'text-yellow-400' : isSilver ? 'text-slate-300' : 'text-amber-500'}`}>
                          {isGold ? 'IST' : isSilver ? '2ND' : '3RD'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Listado del Resto del Top (Puestos 4 a 10) */}
            {remainingUsers.length > 0 && (
              <section className="space-y-3 max-w-2xl mx-auto">
                <div className="border-b border-muted/10 pb-2">
                  <h3 className="font-heading font-bold text-xs uppercase text-secondary tracking-wider">Resto del Top 10</h3>
                </div>

                <div className="space-y-2">
                  {remainingUsers.map((item, index) => {
                    const rank = index + 4;
                    const isSelf = item.uid === user?.uid;

                    return (
                      <div 
                        key={item.uid}
                        className={`glass p-4 rounded-xl flex items-center justify-between gap-4 border transition-all duration-200
                          ${isSelf 
                            ? 'border-accent/40 bg-accent/5 ring-1 ring-accent/30 shadow-lg shadow-accent/5' 
                            : 'border-muted/10 hover:border-muted/20'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Rank */}
                          <span className="font-heading font-extrabold text-xs text-secondary w-6 text-center">
                            #{rank}
                          </span>

                          {/* Avatar */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-heading font-bold text-xs bg-primary-light/10 text-primary-light border border-muted/20
                            ${isSelf ? 'border-accent text-accent bg-accent/10' : ''}`}
                          >
                            {getInitials(item.nombre)}
                          </div>

                          {/* Nombre */}
                          <div>
                            <span className={`text-xs font-bold block ${isSelf ? 'text-accent' : 'text-white'}`}>
                              {item.nombre} {isSelf && <span className="text-[9px] font-heading font-bold uppercase bg-accent/25 text-accent px-1.5 py-0.5 rounded ml-1 tracking-wider">Tú</span>}
                            </span>
                            <span className="text-[9px] text-secondary tracking-widest uppercase">Explorador</span>
                          </div>
                        </div>

                        {/* Puntos */}
                        <div className="text-right">
                          <span className="font-mono text-xs font-extrabold text-white">
                            {(item.puntos || 0).toLocaleString()}
                          </span>
                          <span className="text-[9px] text-secondary uppercase font-semibold block mt-0.5">PTS</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Ficha Exclusiva de Tu Posición (Si no estás en el podio superior o en el top 10) */}
            {userRank !== null && userRank > 10 && (
              <section className="max-w-2xl mx-auto pt-4">
                <div className="glass p-5 rounded-2xl border border-accent/40 bg-accent/5 flex items-center justify-between shadow-lg shadow-accent/5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center text-accent">
                      <Trophy className="w-6 h-6 shrink-0" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-white">Tu Posición en el Evento</h4>
                      <p className="text-secondary text-xs mt-0.5">Sigue reclamando códigos para escalar puestos.</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-heading font-extrabold text-accent">#{userRank}</p>
                    <p className="text-[10px] text-secondary uppercase font-semibold tracking-wider font-mono">Puesto Actual</p>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <footer className="py-4 px-6 text-center text-xs text-secondary mt-auto border-t border-muted/10 bg-black/20">
        © 2026 SAIO-XV Admin Portal. Tabla global de asistentes en vivo.
      </footer>
    </div>
  );
}
