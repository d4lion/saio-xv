import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Shield, Database, Cpu, Activity, User, Terminal, Settings, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [telemetryState, setTelemetryState] = useState('NORMAL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setIsLoggingOut(false);
    }
  }

  function handleSimulateRefresh() {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      const states = ['NORMAL', 'OPTIMIZADO', 'ALERTA LEVE', 'CRÍTICO DEPURADO'];
      const randomState = states[Math.floor(Math.random() * states.length)];
      setTelemetryState(randomState);
    }, 1000);
  }

  return (
    <div className="min-h-screen bg-[#040b0f] text-white flex flex-col font-sans relative overflow-hidden select-none">
      {/* Fondos y Nebulosas */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[160px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[180px] pointer-events-none"></div>

      {/* Header del Dashboard */}
      <header className="glass-light border-b border-muted/20 px-6 py-4 sticky top-0 backdrop-blur-md z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center glow-purple">
              <span className="text-white font-heading font-extrabold text-sm">S</span>
            </div>
            <div>
              <span className="font-heading font-bold text-white text-md tracking-tight block">SAIO-XV Console</span>
              <span className="text-[10px] text-accent tracking-widest uppercase">Admin Terminal</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Info del Usuario */}
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-primary/20 border border-muted/10 text-xs">
              <User className="w-3.5 h-3.5 text-secondary-light" />
              <span className="text-secondary max-w-[150px] truncate">{currentUser?.email}</span>
            </div>

            {/* Botón Logout */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 text-red-200 hover:text-white font-heading text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all duration-300 disabled:opacity-50"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <div className="w-3.5 h-3.5 border-2 border-red-200 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Salir</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6 z-20">
        {/* Banner de Bienvenida */}
        <section className="glass rounded-2xl p-6 relative overflow-hidden" style={{ boxShadow: '0 0 30px rgba(76,41,182,0.1)' }}>
          <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none"></div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white mb-2">
            ¡Hola, <span className="gradient-text-bright">{currentUser?.email?.split('@')[0]}</span>!
          </h2>
          <p className="text-secondary text-sm max-w-xl">
            Bienvenido al panel protegido de administración de SAIO-XV. Tienes acceso completo a la telemetría del sistema, registros de bases de datos y configuraciones globales.
          </p>
        </section>

        {/* Métrica / Grid de Estadísticas */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="glass-light p-5 rounded-2xl border border-muted/15 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-semibold text-secondary uppercase tracking-wider">Estado de Red</span>
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-heading font-extrabold text-white">Seguro</p>
              <p className="text-[10px] text-secondary mt-1">Protección de Firebase Auth activa</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-light p-5 rounded-2xl border border-muted/15 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-semibold text-secondary uppercase tracking-wider">Base de Datos</span>
              <Database className="w-5 h-5 text-primary-light" />
            </div>
            <div>
              <p className="text-2xl font-heading font-extrabold text-white">Online</p>
              <p className="text-[10px] text-secondary mt-1">Conexión en la nube restablecida</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-light p-5 rounded-2xl border border-muted/15 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-semibold text-secondary uppercase tracking-wider">Telemetría Core</span>
              <button 
                onClick={handleSimulateRefresh}
                className="hover:rotate-180 transition-transform duration-500 p-1 rounded hover:bg-white/5 cursor-pointer"
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 text-accent ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div>
              <p className="text-2xl font-heading font-extrabold text-white truncate uppercase">{telemetryState}</p>
              <p className="text-[10px] text-secondary mt-1">Presiona refrescar para simular</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="glass-light p-5 rounded-2xl border border-muted/15 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-semibold text-secondary uppercase tracking-wider">Carga CPU</span>
              <Cpu className="w-5 h-5 text-accent animate-pulse" />
            </div>
            <div>
              <p className="text-2xl font-heading font-extrabold text-white">12.4 %</p>
              <p className="text-[10px] text-secondary mt-1">Optimización de hilos automática</p>
            </div>
          </div>
        </section>

        {/* Sección de Paneles Avanzados */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Registro de Actividad Consola (Col 1 & 2) */}
          <div className="glass rounded-2xl p-6 border border-muted/20 lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 border-b border-muted/10 pb-3">
              <Terminal className="w-5 h-5 text-accent" />
              <h3 className="font-heading font-bold text-md">Terminal de Eventos Recientes</h3>
            </div>
            <div className="bg-black/40 p-4 rounded-xl font-mono text-xs text-emerald-400 space-y-2 overflow-y-auto max-h-[220px]">
              <p className="text-secondary">[03:14:02 UTC] Inicializando módulo de autenticación segura...</p>
              <p className="text-secondary">[03:14:03 UTC] Conectado a base de datos de Firebase Auth.</p>
              <p className="text-emerald-400">[03:14:04 UTC] Usuario autenticado exitosamente como: {currentUser?.email}</p>
              <p className="text-emerald-400">[03:14:05 UTC] Token de sesión JWT verificado y almacenado localmente.</p>
              <p className="text-blue-400">[03:14:08 UTC] Solicitud GET /api/v1/telemetry - Status: 200 OK</p>
              <p className="text-secondary">[03:14:15 UTC] Escucha en tiempo real activa para cambios de estado...</p>
              <div className="w-1.5 h-3 bg-emerald-400 inline-block animate-pulse"></div>
            </div>
          </div>

          {/* Acciones Rápidas (Col 3) */}
          <div className="glass rounded-2xl p-6 border border-muted/20 space-y-4">
            <div className="flex items-center gap-2 border-b border-muted/10 pb-3">
              <Settings className="w-5 h-5 text-accent" />
              <h3 className="font-heading font-bold text-md">Acciones Rápidas</h3>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => navigate('/puntos')}
                className="w-full py-2.5 px-4 rounded-xl bg-primary-light/10 hover:bg-primary-light/25 border border-primary-light/25 text-white text-xs font-semibold transition-all duration-200 text-left cursor-pointer"
              >
                Ir a Puntos Estelares
              </button>
              <button 
                onClick={() => alert('Parámetros de conexión restablecidos a por defecto.')}
                className="w-full py-2.5 px-4 rounded-xl bg-primary-light/10 hover:bg-primary-light/20 border border-primary-light/25 text-white text-xs font-semibold transition-all duration-200 text-left cursor-pointer"
              >
                Reconfigurar API de Firebase
              </button>
              <button 
                onClick={() => alert('Registros exportados en formato JSON.')}
                className="w-full py-2.5 px-4 rounded-xl bg-primary-light/10 hover:bg-primary-light/20 border border-primary-light/25 text-white text-xs font-semibold transition-all duration-200 text-left cursor-pointer"
              >
                Exportar Logs de Sesión
              </button>
              <button 
                onClick={() => navigate('/')}
                className="w-full py-2.5 px-4 rounded-xl bg-accent/10 hover:bg-accent/20 border border-accent/25 text-accent hover:text-white text-xs font-semibold transition-all duration-200 text-left cursor-pointer"
              >
                Volver a la Landing Page
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer del Dashboard */}
      <footer className="py-4 px-6 text-center text-xs text-secondary mt-auto border-t border-muted/10 bg-black/20">
        © 2026 SAIO-XV Admin Portal. Desarrollado con Firebase y React.
      </footer>
    </div>
  );
}
