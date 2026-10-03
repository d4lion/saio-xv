import { Zap, Crown, Sparkles } from 'lucide-react'

export const TICKETS_DATA = [
  {
    id: 'orbita',
    name: 'Boleta Órbita',
    subtitle: 'Acceso completo a la experiencia SAIO XV',
    icon: Zap,
    iconName: 'Zap',
    price: '$50.000',
    rawPrice: 50000,
    currency: 'COP',
    period: 'por persona',
    color: '#3b82f6',
    borderColor: 'rgba(59,130,246,0.6)',
    glowColor: 'rgba(59,130,246,0.3)',
    features: [
      'Acceso completo a talleres y conferencias',
      'Asistencia a los paneles de expertos',
      'Material digital exclusivo del evento',
      'Networking con asistentes y profesionales',
      'Coffee break & 1 Almuerzo incluido',
      'Certificado digital de asistencia'
    ],
    cta: 'Comprar boleta Órbita',
    totalAvailable: 200,
    remainingAvailable: 142,
    popular: false,
    activo: true,
    checkoutUrl: import.meta.env.VITE_WOMPI_LINK_GENERAL || 'https://checkout.wompi.co/l/test_TCCgi9'
  },
  {
    id: 'supernova',
    name: 'Boleta Supernova',
    subtitle: 'Experiencia ampliada con beneficios dobles',
    icon: Sparkles,
    iconName: 'Sparkles',
    price: '$70.000',
    rawPrice: 70000,
    currency: 'COP',
    period: 'por persona',
    color: '#8b5cf6',
    borderColor: 'rgba(139,92,246,0.8)',
    glowColor: 'rgba(139,92,246,0.4)',
    features: [
      'Todo lo incluido en la Boleta Órbita',
      '2 Almuerzos completos incluidos',
      'Acceso prioritario a talleres interactivos',
      'Kit de bienvenida SAIO Supernova',
      'Descuento especial en tienda oficial',
      'Certificado con distinción de participación'
    ],
    cta: 'Comprar boleta Supernova',
    totalAvailable: 100,
    remainingAvailable: 42,
    popular: true,
    activo: true,
    checkoutUrl: import.meta.env.VITE_WOMPI_LINK_SUPERNOVA || import.meta.env.VITE_WOMPI_LINK_GENERAL || 'https://checkout.wompi.co/l/test_TCCgi9'
  },
  {
    id: 'vip',
    name: 'Boleta VIP',
    subtitle: 'Experiencia máxima y acceso preferencial',
    icon: Crown,
    iconName: 'Crown',
    price: '$90.000',
    rawPrice: 90000,
    currency: 'COP',
    period: 'por persona',
    color: '#9c3aed',
    borderColor: 'rgba(156,58,237,0.8)',
    glowColor: 'rgba(156,58,237,0.4)',
    features: [
      'Todo lo incluido en la Boleta Supernova',
      'Ubicación preferencial en conferencias',
      'Acceso a sesión privada Meet & Greet',
      'Kit de bienvenida físico exclusivo SAIO XV',
      'Acceso prioritario a zona VIP networking',
      'Grabaciones completas en HD del evento',
      'Certificado VIP oficial de participación'
    ],
    cta: 'Comprar boleta VIP',
    totalAvailable: 50,
    remainingAvailable: 16,
    popular: false,
    activo: true,
    checkoutUrl: import.meta.env.VITE_WOMPI_LINK_VIP || 'https://checkout.wompi.co/l/test_TCCgi9'
  }
]

