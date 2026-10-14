import { useAuth } from '../context/AuthContext';
import { Ticket } from 'lucide-react';
import BoletaPass from '../components/BoletaPass/BoletaPass';

export default function MiEntrada() {
  const { user } = useAuth();

  return (
    <div className="w-full flex flex-col gap-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
          <Ticket className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-heading font-black text-white">Tu Entrada Digital</h1>
          <p className="text-secondary text-sm">Presenta este código para acceder al evento.</p>
        </div>
      </div>

      <BoletaPass user={user} />

      <p className="text-[10px] text-secondary text-center leading-relaxed tracking-wider font-medium max-w-sm mx-auto">
        Presenta esta credencial digital en el stand de ingreso para realizar la validación de tu entrada.
      </p>
    </div>
  );
}
