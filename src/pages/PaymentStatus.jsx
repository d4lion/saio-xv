import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Mail, 
  Home, 
  Ticket,
  RotateCw,
  MessageCircle,
  Copy,
  Check,
  ShieldCheck,
  Building2
} from 'lucide-react'
import { getTransactionStatus } from '../services/wompiService'
import logo from '../assets/logo.png'
import SEO from '../components/SEO/SEO'

export default function PaymentStatus() {
  const [searchParams] = useSearchParams()
  const transactionId = searchParams.get('id')
  const envParam = searchParams.get('env')

  const [transaction, setTransaction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copiedId, setCopiedId] = useState(false)

  useEffect(() => {
    async function fetchStatus() {
      if (!transactionId) {
        setError('No se proporcionó un código de transacción en la solicitud.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const data = await getTransactionStatus(transactionId, envParam)
        setTransaction(data)
      } catch (err) {
        console.error('Error al verificar transacción:', err)
        setError(err.message || 'No fue posible consultar el resultado del pago.')
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
  }, [transactionId, envParam])

  const formatCurrency = (cents) => {
    if (typeof cents !== 'number') return '$0 COP'
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(cents / 100)
  }

  const formatDate = (isoString) => {
    if (!isoString) return '---'
    return new Date(isoString).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const cleanStatusMessage = (msg) => {
    if (!msg) return 'Transacción no aprobada por el sistema bancario.'
    if (msg.toLowerCase().includes('sandbox')) {
      return 'Transacción no aprobada por la entidad financiera.'
    }
    return msg
  }

  const handleCopyId = () => {
    if (transactionId) {
      navigator.clipboard.writeText(transactionId)
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 2000)
    }
  }

  const whatsappPhone = import.meta.env.VITE_WHATSAPP_PHONE || '573193035676'
  const whatsappMsgText = `Hola, tuve un problema con la transacción: ${transactionId || ''}. ¿Podrías ayudarme?`
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMsgText)}`

  const status = transaction?.status?.toUpperCase()

  return (
    <main className="min-h-screen bg-[#161426] text-purple-100 font-sans flex flex-col justify-between items-center px-4 py-6 md:py-10 select-none overflow-x-hidden relative">
      <SEO 
        title="Estado de la Transacción | SAIO XV Entropix"
        description="Consulta la confirmación y el estado de tu pago en la plataforma oficial de SAIO XV Entropix."
        path="/payment/status"
      />
      
      {/* Subtle Purple-Slate Ambient Glow */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse 65% 55% at 50% 20%, rgba(147, 51, 234, 0.12) 0%, transparent 70%),
            radial-gradient(ellipse 45% 45% at 85% 85%, rgba(79, 70, 229, 0.1) 0%, transparent 60%)
          `,
        }}
      />

      {/* Top Header - Balanced Dark Theme */}
      <header className="relative z-10 w-full max-w-lg flex items-center justify-between py-3 mb-4 border-b border-purple-500/20">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="SAIO XV" className="h-8 w-auto object-contain" />
          <div className="flex flex-col text-left">
            <span className="text-sm font-bold text-white tracking-tight font-heading leading-none">
              SAIO XV Entropix
            </span>
            <span className="text-[10px] text-purple-300 font-medium">
              Confirmación de Pago
            </span>
          </div>
        </Link>
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#201c36] border border-purple-500/25 text-[11px] text-purple-200 font-semibold shadow-sm">
          <ShieldCheck size={13} className="text-purple-400" />
          <span>Pago Seguro</span>
        </div>
      </header>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-lg my-auto">

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#201c36] border border-purple-500/25 rounded-xl p-8 text-center shadow-2xl shadow-purple-950/60 flex flex-col items-center"
          >
            <div className="w-10 h-10 mb-4 border-3 border-purple-500/20 border-t-purple-400 rounded-full animate-spin" />
            <h2 className="text-base font-bold text-white mb-1 font-heading">
              Verificando transacción...
            </h2>
            <p className="text-xs text-purple-300/70">
              Consultando la respuesta directamente con la pasarela bancaria.
            </p>
          </motion.div>
        )}

        {/* Error State */}
        {!loading && error && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#201c36] border border-rose-500/30 rounded-xl p-6 md:p-8 text-center shadow-2xl shadow-purple-950/60"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-400">
              <AlertCircle size={24} />
            </div>
            <h2 className="text-lg font-bold text-white font-heading mb-1">
              No fue posible verificar el pago
            </h2>
            <p className="text-xs text-purple-200/80 mb-4 leading-relaxed max-w-xs mx-auto">
              {error}
            </p>

            {/* Reassuring Security Note */}
            <div className="mb-6 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/20 text-left text-xs text-rose-200/90 leading-relaxed flex gap-2.5 items-start">
              <ShieldCheck size={16} className="text-rose-400 shrink-0 mt-0.5" />
              <p>
                <strong className="text-white">Nota de tranquilidad:</strong> Si la transacción no se completó, el dinero <strong className="text-white">no debió haber sido debitado</strong> de tu cuenta bancaria. Ante cualquier inquietud o novedad en tu saldo, te recomendamos consultar directamente con tu <strong className="text-white">entidad bancaria</strong>.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow transition-colors"
              >
                <MessageCircle size={16} />
                <span>Soporte por WhatsApp</span>
              </a>

              <Link
                to="/"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs transition-colors"
              >
                <Home size={14} />
                <span>Volver al Inicio</span>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Transaction Content */}
        {!loading && !error && transaction && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4 text-left"
          >

            {/* Status Hero Card */}
            <div className="bg-[#201c36] border border-purple-500/25 rounded-xl p-6 md:p-7 shadow-2xl shadow-purple-950/60 relative overflow-hidden">
              
              {/* APPROVED */}
              {status === 'APPROVED' && (
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-xs font-semibold">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span>Transacción Aprobada</span>
                    </span>

                    <span className="text-[11px] text-purple-300/60 font-mono">
                      Wompi Verified
                    </span>
                  </div>

                  <h1 className="text-xl md:text-2xl font-bold text-white font-heading mb-2 leading-tight">
                    ¡Gracias por tu compra!
                  </h1>
                  <p className="text-xs text-purple-200/80 mb-5">
                    Tu pago ha sido procesado exitosamente.
                  </p>

                  {/* Mail & SPAM Callout Box */}
                  <div className="p-4 rounded-xl bg-purple-950/60 border border-purple-400/30 text-purple-100 flex gap-3.5 items-start text-xs leading-relaxed">
                    <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow">
                      <Mail size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-white mb-1">
                        Información importante sobre tu entrada:
                      </p>
                      <p className="text-purple-200/90">
                        Te hemos enviado la confirmación a tu <strong className="text-white font-bold">correo electrónico</strong>. Por favor mantente atento a tu bandeja de entrada y revisa cuidadosamente la carpeta de <strong className="text-amber-300 font-bold underline decoration-amber-400/60">SPAM o Correo no deseado</strong> para obtener tu entrada oficial.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* PENDING */}
              {(status === 'PENDING' || status === 'PENDIENTE') && (
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/35 text-amber-300 text-xs font-semibold">
                      <Clock size={14} className="text-amber-400" />
                      <span>Transacción en Proceso</span>
                    </span>
                  </div>

                  <h1 className="text-xl md:text-2xl font-bold text-white font-heading mb-2 leading-tight">
                    Pago en verificación bancaria
                  </h1>
                  <p className="text-xs text-purple-200/80 mb-5">
                    La entidad financiera está validando la transacción.
                  </p>

                  {/* Amber Callout Box */}
                  <div className="p-4 rounded-xl bg-amber-950/50 border border-amber-500/30 text-amber-100 flex gap-3.5 items-start text-xs leading-relaxed">
                    <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow">
                      <Clock size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-white mb-1">
                        ¡Gracias por tu compra! Tu pago se está procesando:
                      </p>
                      <p className="text-amber-200/90">
                        Tan pronto la entidad confirme la aprobación, recibirás la entrada en tu <strong className="text-white font-bold">correo electrónico</strong> (revisa la carpeta de <strong className="text-amber-300 font-bold">SPAM</strong>).
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* DECLINED / VOIDED / ERROR */}
              {status !== 'APPROVED' && status !== 'PENDING' && status !== 'PENDIENTE' && (
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/15 border border-rose-500/35 text-rose-300 text-xs font-semibold">
                      <XCircle size={14} className="text-rose-400" />
                      <span>Transacción No Aprobada</span>
                    </span>
                  </div>

                  <h1 className="text-xl md:text-2xl font-bold text-white font-heading mb-2 leading-tight">
                    El pago no se pudo completar
                  </h1>

                  <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-100 text-xs leading-relaxed space-y-2.5">
                    <div>
                      <p className="font-bold text-white mb-0.5">Motivo reportado por la entidad:</p>
                      <p className="text-rose-300 font-mono text-[11px]">
                        {cleanStatusMessage(transaction.status_message)}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-rose-500/20 text-rose-200/90 text-[11px] leading-normal flex gap-2 items-start">
                      <ShieldCheck size={16} className="text-rose-400 shrink-0 mt-0.5" />
                      <p>
                        <strong className="text-white">Nota de tranquilidad:</strong> Al no ser aprobada la transacción, el dinero <strong className="text-white">no debió haber sido debitado</strong> de tu cuenta bancaria. Si observas alguna retención preventiva o novedad en tu saldo, te sugerimos comunicarte directamente con tu <strong className="text-white">entidad bancaria</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Receipt Summary Card */}
            <div className="bg-[#201c36] border border-purple-500/25 rounded-xl p-5 md:p-6 shadow-2xl shadow-purple-950/60">
              
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-purple-500/15">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300 font-heading">
                  Detalles de la Operación
                </span>

                <button
                  onClick={handleCopyId}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#2a2446] hover:bg-[#342d56] text-purple-200 border border-purple-400/30 text-[11px] font-semibold transition-colors"
                >
                  {copiedId ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedId ? 'Copiado' : 'Copiar ID'}</span>
                </button>
              </div>

              {/* Data Rows */}
              <div className="space-y-3 text-xs">
                
                <div className="flex justify-between items-center py-1">
                  <span className="text-purple-300/70 font-medium">Monto abonado</span>
                  <span className="text-base font-bold text-emerald-400">
                    {formatCurrency(transaction.amount_in_cents)}
                  </span>
                </div>

                <div className="h-px bg-purple-500/15 w-full" />

                <div className="flex justify-between items-center py-1">
                  <span className="text-purple-300/70 font-medium">Método de Pago</span>
                  <span className="text-white font-semibold">
                    {transaction.payment_method_type || transaction.payment_method?.type || 'Transferencia'}
                  </span>
                </div>

                <div className="h-px bg-purple-500/15 w-full" />

                <div className="flex flex-col py-1">
                  <span className="text-purple-300/70 font-medium mb-0.5">ID de Transacción</span>
                  <span className="text-purple-200 font-mono text-[11px] font-semibold break-all">
                    {transaction.id}
                  </span>
                </div>

                <div className="h-px bg-purple-500/15 w-full" />

                <div className="flex flex-col py-1">
                  <span className="text-purple-300/70 font-medium mb-0.5">Referencia de Pago</span>
                  <span className="text-purple-200/90 font-mono text-[11px] break-all">
                    {transaction.reference || '---'}
                  </span>
                </div>

                {transaction.customer_email && (
                  <>
                    <div className="h-px bg-purple-500/15 w-full" />
                    <div className="flex justify-between items-center py-1">
                      <span className="text-purple-300/70 font-medium">Correo del Comprador</span>
                      <span className="text-white font-semibold truncate max-w-[200px]">
                        {transaction.customer_email}
                      </span>
                    </div>
                  </>
                )}

                <div className="h-px bg-purple-500/15 w-full" />

                <div className="flex justify-between items-center py-1">
                  <span className="text-purple-300/70 font-medium">Fecha y Hora</span>
                  <span className="text-purple-200">
                    {formatDate(transaction.created_at)}
                  </span>
                </div>

              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              
              {/* WhatsApp Support Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs tracking-wide shadow-lg transition-transform hover:scale-[1.01]"
              >
                <MessageCircle size={18} />
                <span>¿Dudas o problemas? Contactar Soporte por WhatsApp</span>
              </a>

              {/* Navigation Tonal Buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors shadow"
                >
                  <Home size={15} />
                  <span>Inicio</span>
                </Link>

                <Link
                  to="/mi-entrada"
                  className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#2a2446] hover:bg-[#342d56] text-purple-200 font-bold text-xs border border-purple-400/30 transition-colors"
                >
                  <Ticket size={15} />
                  <span>Mis Entradas</span>
                </Link>
              </div>

              {status !== 'APPROVED' && (
                <div className="text-center pt-1">
                  <a
                    href="/#tickets"
                    className="inline-flex items-center gap-1.5 text-xs text-purple-300 hover:text-white font-semibold transition-colors"
                  >
                    <RotateCw size={13} />
                    <span>Reintentar proceso de compra</span>
                  </a>
                </div>
              )}

            </div>

          </motion.div>
        )}

      </div>

      {/* Footer Branding */}
      <footer className="relative z-10 w-full max-w-lg mt-6 pt-3 border-t border-purple-500/20 text-center">
        <p className="text-[11px] text-purple-300/70 font-medium">
          SAIO XV Entropix · Plataforma Oficial de Registro y Pagos
        </p>
      </footer>

    </main>
  )
}
