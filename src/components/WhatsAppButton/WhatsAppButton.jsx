import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Send, Sparkles, CheckCheck } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function WhatsAppButton() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [hasClosed, setHasClosed] = useState(() => {
    try {
      return localStorage.getItem('saio_wa_closed') === 'true';
    } catch {
      return false;
    }
  });
  const [userMessage, setUserMessage] = useState('');

  // Hide on Dashboard routes
  if (location.pathname.startsWith('/dashboard')) {
    return null;
  }

  const phone = import.meta.env.VITE_WHATSAPP_PHONE || "573000000000";
  const defaultText = "Hola equipo SAIO XV, me gustaría obtener información sobre el evento y boletas.";

  const getWhatsappLink = (msg) => {
    const textToUse = msg && msg.trim() ? msg.trim() : defaultText;
    return `https://wa.me/${phone}?text=${encodeURIComponent(textToUse)}`;
  };

  const handleClosePermanently = (e) => {
    if (e) e.stopPropagation();
    setHasClosed(true);
    setIsOpen(false);
    try {
      localStorage.setItem('saio_wa_closed', 'true');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendCustomMessage = (e) => {
    e.preventDefault();
    const link = getWhatsappLink(userMessage);
    window.open(link, '_blank', 'noopener,noreferrer');
    setUserMessage('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto select-none font-sans">
      {/* Interactive Chatbot Popup Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="mb-4 w-80 sm:w-96 bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden flex flex-col text-gray-900"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-bold text-white shadow-sm">
                    <Sparkles className="w-5 h-5 text-emerald-100" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-emerald-700 rounded-full"></span>
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm leading-tight text-white">Soporte Saio</h4>
                  <p className="text-[11px] text-emerald-100 font-sans flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                    <span>Asistente virtual • En línea</span>
                  </p>
                </div>
              </div>

              <button
                onClick={handleClosePermanently}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Cerrar chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-4 bg-[#f8f9fa] space-y-3 max-h-80 overflow-y-auto">
              <div className="text-center my-1">
                <span className="text-[10px] bg-gray-200/60 text-gray-500 font-mono px-2.5 py-0.5 rounded-full">
                  Hoy • Respuesta inmediata
                </span>
              </div>

              {/* Bot Message 1 */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-xs">
                  S
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-tl-xs border border-gray-200 text-xs text-gray-800 shadow-xs space-y-1 max-w-[85%]">
                  <p className="font-semibold text-emerald-700">¡Hola! 👋 Bienvenido a SAIO-XV</p>
                  <p className="leading-relaxed">
                    Si tienes dudas sobre el evento, boletas, cronograma o conferencistas, no dudes en escribirnos.
                  </p>
                  <div className="flex justify-end items-center gap-1 text-[10px] text-gray-400 pt-0.5">
                    <span>Justo ahora</span>
                    <CheckCheck className="w-3 h-3 text-emerald-500" />
                  </div>
                </div>
              </div>

              {/* Bot Message 2 */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-xs">
                  S
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-tl-xs border border-gray-200 text-xs text-gray-800 shadow-xs space-y-1 max-w-[85%]">
                  <p className="leading-relaxed">
                    Un asesor de nuestro equipo te atenderá de inmediato por WhatsApp.
                  </p>
                  <div className="flex justify-end items-center gap-1 text-[10px] text-gray-400 pt-0.5">
                    <span>Justo ahora</span>
                    <CheckCheck className="w-3 h-3 text-emerald-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="p-4 bg-white border-t border-gray-150 space-y-3">
              {/* Form Input simulation */}
              <form onSubmit={handleSendCustomMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="Escribe tu consulta aquí..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-emerald-500 focus:bg-white transition-all font-sans"
                />
                <button
                  type="submit"
                  className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shrink-0 shadow-xs"
                  title="Enviar por WhatsApp"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* Direct WhatsApp Action Button */}
              <a
                href={getWhatsappLink(userMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
              >
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>Escribir a WhatsApp</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Main Button & Optional Tooltip */}
      <div className="flex items-center gap-3">
        {/* Startup-style Initial Tooltip Bubble (only if user hasn't closed it before and chat is closed) */}
        {!hasClosed && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 15 }}
            className="hidden sm:flex items-center gap-2.5 bg-[#0a151d]/90 backdrop-blur-md text-white p-3 pr-3.5 rounded-2xl border border-emerald-500/30 shadow-2xl shadow-emerald-900/30 max-w-xs cursor-pointer"
            onClick={() => setIsOpen(true)}
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="flex-1 text-xs leading-tight">
              <span className="font-bold text-white block mb-0.5">¿Preguntas sobre el evento?</span>
              <span className="text-[11px] text-emerald-200 font-sans">Chatea con nosotros</span>
            </div>

            <button
              onClick={handleClosePermanently}
              className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              title="Cerrar aviso"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}

        {/* Circular Floating Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Abrir chat de ayuda por WhatsApp"
          className="relative flex items-center justify-center w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-110 active:scale-95 transition-all duration-300 border border-emerald-300/40 cursor-pointer"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <svg className="w-6.5 h-6.5 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
          )}

          {/* Online status indicator dot */}
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#040b0f] rounded-full pointer-events-none" />
        </button>
      </div>
    </div>
  );
}
