import { Zap, Crown } from 'lucide-react'

export const TICKETS_DATA = [
  {
    id: 'general',
    name: 'Boleta General',
    subtitle: 'Acceso completo a la experiencia SAIO XV',
    icon: Zap,
    price: '$50.000',
    rawPrice: 50000,
    currency: 'COP',
    period: 'por persona',
    color: '#4c29b6',
    borderColor: 'rgba(76,41,182,0.6)',
    glowColor: 'rgba(76,41,182,0.3)',
    features: [
      'Acceso completo a talleres y conferencias',
      'Asistencia a los paneles de ponentes',
      'Material digital exclusivo del evento',
      'Networking con asistentes y profesionales',
      'Coffee break incluido',
      'Certificado digital de asistencia'
    ],
    cta: 'Comprar boleta General',
    totalAvailable: 200,
    remainingAvailable: 142,
    popular: false,
    checkoutUrl: import.meta.env.VITE_WOMPI_LINK_GENERAL || 'https://checkout.wompi.co/l/test_TCCgi9'
  },
  {
    id: 'vip',
    name: 'Boleta VIP',
    subtitle: 'Experiencia exclusiva y acceso preferencial',
    icon: Crown,
    price: '$90.000',
    rawPrice: 90000,
    currency: 'COP',
    period: 'por persona',
    color: '#9c3aed',
    borderColor: 'rgba(156,58,237,0.8)',
    glowColor: 'rgba(156,58,237,0.4)',
    features: [
      'Todo lo incluido en la Boleta General',
      'Ubicación preferencial en conferencias',
      'Acceso a sesión privada Meet & Greet con ponentes',
      'Kit de bienvenida físico exclusivo SAIO XV',
      'Acceso prioritario a zona VIP de networking',
      'Grabaciones completas en HD del evento',
      'Certificado VIP oficial de participación'
    ],
    cta: 'Comprar boleta VIP',
    totalAvailable: 50,
    remainingAvailable: 16,
    popular: true,
    checkoutUrl: import.meta.env.VITE_WOMPI_LINK_VIP || 'https://checkout.wompi.co/l/test_TCCgi9'
  }
]
