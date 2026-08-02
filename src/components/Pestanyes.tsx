import { LayoutDashboard, Calendar, Dumbbell, Wallet, Beer, BookOpen, Map } from 'lucide-react';
import { useJoc } from '../game/store';
import { IconPilota, IconTitul } from './icones';

const PESTANYES = [
  { id: 'tauler', etiqueta: 'Tauler', Icona: LayoutDashboard },
  { id: 'plantilla', etiqueta: 'Plantilla', Icona: IconPilota },
  { id: 'partit', etiqueta: 'Partit', Icona: Calendar },
  { id: 'entrenament', etiqueta: 'Entrenament', Icona: Dumbbell },
  { id: 'finances', etiqueta: 'Finances', Icona: Wallet },
  { id: 'jocs', etiqueta: 'Jocs', Icona: Beer },
  { id: 'cromos', etiqueta: 'Cromos', Icona: BookOpen },
  { id: 'llegat', etiqueta: 'Llegat', Icona: IconTitul },
  { id: 'mapa', etiqueta: 'Mapa', Icona: Map },
];

export function Pestanyes() {
  const pestanya = useJoc((s) => s.pestanya);
  const setPestanya = useJoc((s) => s.setPestanya);

  return (
    <nav className="tabs">
      {PESTANYES.map((p) => (
        <button
          key={p.id}
          className={`tab ${pestanya === p.id ? 'activa' : ''}`}
          onClick={() => setPestanya(p.id)}
        >
          <p.Icona size={16} /> {p.etiqueta}
        </button>
      ))}
    </nav>
  );
}
