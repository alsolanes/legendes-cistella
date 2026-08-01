import { useJoc } from '../game/store';

const PESTANYES = [
  { id: 'tauler', etiqueta: '📊 Tauler' },
  { id: 'plantilla', etiqueta: '🏀 Plantilla' },
  { id: 'partit', etiqueta: '📅 Partit' },
  { id: 'entrenament', etiqueta: '🏋️ Entrenament' },
  { id: 'finances', etiqueta: '💰 Finances' },
  { id: 'jocs', etiqueta: '🍻 Jocs' },
  { id: 'cromos', etiqueta: '📖 Cromos' },
  { id: 'llegat', etiqueta: '🎖️ Llegat' },
  { id: 'mapa', etiqueta: '🗺️ Mapa' },
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
          {p.etiqueta}
        </button>
      ))}
    </nav>
  );
}
