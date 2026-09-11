import { motion } from 'framer-motion'
import { ShieldCheck, Server, Lock, Mail, ChevronRight } from 'lucide-react'
import Navbar from '../components/Navbar/Navbar'
import Footer from '../components/Footer/Footer'
import SEO from '../components/SEO/SEO'


export default function Privacidad() {
  return (
    <main className="relative bg-[#040b0f] min-h-screen flex flex-col justify-between overflow-hidden">
      <SEO 
        title="Políticas de Privacidad | SAIO XV Entropix"
        description="Conoce cómo manejamos tus datos personales, nuestra infraestructura tecnológica y tus derechos en SAIO XV Entropix."
      />
      <Navbar />

      <section className="relative flex-1 px-6 pt-32 pb-20 z-10 w-full max-w-4xl mx-auto">
        {/* Background cosmic glow effect */}
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            background: `
              radial-gradient(ellipse 75% 60% at 50% 20%, rgba(156,58,237,0.15) 0%, transparent 60%),
              radial-gradient(ellipse 50% 50% at 20% 70%, rgba(76,41,182,0.15) 0%, transparent 50%),
              radial-gradient(ellipse 40% 40% at 80% 30%, rgba(48,34,127,0.15) 0%, transparent 50%)
            `,
          }}
        />

        <div className="relative z-10">


          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[clamp(2.5rem,5vw,4rem)] font-bold font-heading leading-tight tracking-tight mb-4"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              background: 'linear-gradient(135deg, #ffffff 0%, #c3abdc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Políticas de Privacidad y Tratamiento de Datos Personales
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-secondary text-lg max-w-2xl mb-12 leading-relaxed"
          >
            SAIO XV Entropix, gestionado por <a className="text-purple-500 underline cursor-pointer" href="https://adamind.cloud" target="_blank" rel="noopener noreferrer">Adamind Labs </a> 
            para <a className="text-purple-500 underline cursor-pointer" href="https://aneiap.co/" target="_blank" rel="noopener noreferrer">ANEIAP</a>, valora tu privacidad. A continuación detallamos cómo protegemos y 
            utilizamos tu información.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-12 text-secondary-light"
          >
            <article className="glass p-8 rounded-2xl border border-purple-500/20 shadow-xl shadow-purple-900/10">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm">1</span>
                Introducción y Marco Legal
              </h2>
              <p className="leading-relaxed">
                De conformidad con lo dispuesto en la Ley 1581 de 2012 (Ley de Protección de Datos Personales o Habeas Data) y el Decreto 1377 de 2013 de la República de Colombia, la presente política establece los términos en que <strong>Adamind</strong>, en nombre y representación de la <strong>Asociación Nacional de Estudiantes de Ingenierías Industrial, Administrativa y de Producción (ANEIAP)</strong> para el evento <strong>SAIO XV Entropix</strong>, usa y protege la información proporcionada por los usuarios de su plataforma web.
              </p>
            </article>

            <article className="glass p-8 rounded-2xl border border-purple-500/20 shadow-xl shadow-purple-900/10">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm">2</span>
                Información Recopilada
              </h2>
              <p className="leading-relaxed mb-4">Podremos recopilar información personal, incluyendo pero no limitándose a:</p>
              <ul className="list-none space-y-3 pl-2">
                {[
                  'Nombres y apellidos.',
                  'Tipo y número de documento de identidad.',
                  'Información de contacto (correo electrónico, número de teléfono).',
                  'Información institucional (universidad, programa académico).',
                  'Datos de transacciones e historial de participación (puntos, compras de boletas, asistencia).'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <ChevronRight size={18} className="text-purple-400 shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="glass p-8 rounded-2xl border border-purple-500/20 shadow-xl shadow-purple-900/10">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm">3</span>
                Uso de la Información Recopilada
              </h2>
              <p className="leading-relaxed mb-4">Nuestra plataforma emplea la información con el fin de proporcionar el mejor servicio posible, específicamente para:</p>
              <ul className="list-none space-y-3 pl-2">
                {[
                  'Gestionar la inscripción, registro y acceso al evento SAIO XV Entropix.',
                  'Mantener un registro de usuarios y control de asistencia (Pasaporte Virtual).',
                  'Procesar compras de boletería y validación de pagos (mediante pasarelas autorizadas).',
                  'Gestionar el sistema de gamificación (asignación y redención de puntos).',
                  'Enviar correos electrónicos periódicos con información relevante del evento o avisos importantes.'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <ChevronRight size={18} className="text-purple-400 shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="glass p-8 rounded-2xl border border-purple-500/20 shadow-xl shadow-purple-900/10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Server className="text-purple-400" />
                Infraestructura Tecnológica
              </h2>
              <p className="leading-relaxed mb-6">
                Para garantizar la seguridad, disponibilidad y rendimiento de nuestra plataforma, el procesamiento y almacenamiento de datos se apoya en infraestructuras de clase mundial:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-purple-900/20 border border-purple-500/20 p-5 rounded-xl">
                  <h3 className="font-bold text-white mb-2">Firebase (Google Cloud)</h3>
                  <p className="text-sm">Empleado para la autenticación segura de usuarios, bases de datos en tiempo real y almacenamiento de registros.</p>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/20 p-5 rounded-xl">
                  <h3 className="font-bold text-white mb-2">Amazon Web Services (AWS)</h3>
                  <p className="text-sm">Utilizado para el despliegue de componentes del backend y procesamiento de servicios en la nube.</p>
                </div>
              </div>
              <div className="mt-6 flex items-start gap-4 p-4 bg-primary-dark/50 rounded-xl border border-purple-500/30">
                <Lock className="text-accent shrink-0 mt-1" />
                <p className="text-sm">
                  <strong>Adamind</strong> es la agencia encargada del diseño, desarrollo y gestión tecnológica integral de la plataforma. Tus datos son almacenados en servidores seguros con protocolos de encriptación estándar de la industria.
                </p>
              </div>
            </article>

            <article className="glass p-8 rounded-2xl border border-purple-500/20 shadow-xl shadow-purple-900/10">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm">5</span>
                Derechos de los Titulares
              </h2>
              <p className="leading-relaxed mb-4">Como titular de tus datos personales, tienes derecho a:</p>
              <ul className="list-none space-y-3 pl-2">
                {[
                  'Conocer, actualizar y rectificar tus datos personales.',
                  'Solicitar prueba de la autorización otorgada para el tratamiento de datos.',
                  'Ser informado sobre el uso que se ha dado a tus datos.',
                  'Revocar la autorización o solicitar la supresión de tus datos cuando no se respeten las garantías legales.'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <ChevronRight size={18} className="text-purple-400 shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="bg-gradient-to-br from-[#1a113d] to-[#0c0822] p-8 rounded-2xl border border-purple-500/30 shadow-xl shadow-purple-900/20">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Mail className="text-purple-400" />
                Contacto (PQRS)
              </h2>
              <p className="leading-relaxed mb-6">
                Para ejercer tus derechos sobre el tratamiento de datos, puedes contactarnos a través del correo electrónico oficial proporcionado por la organización de SAIO XV:
              </p>
              <a href="mailto:saio.unalmed@aneiap.co" className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-colors">
                saio.unalmed@aneiap.co
              </a>
            </article>
            
            <p className="text-sm text-center text-secondary/70 pt-8 border-t border-purple-500/20 tracking-wide">
              El uso de esta plataforma implica la aceptación de estas Políticas de Privacidad. Adamind y ANEIAP se reservan el derecho de actualizar esta política en cualquier momento.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Decorative Separator Line */}
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(156,58,237,0.3), transparent)' }} />

      <Footer />
    </main>
  )
}
