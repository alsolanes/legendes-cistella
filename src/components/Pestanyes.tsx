import { useJoc } from '../game/store';

const PESTANYES = [
  { id: 'tauler', etiqueta: '📊 Tauler' },
  { id: 'plantilla', etiqueta: '🏀 Plantilla' },
  { id: 'partit', etiqueta: '📅 Partit' },
  { id: 'finances', etiqueta: '💰 Finances' },
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
