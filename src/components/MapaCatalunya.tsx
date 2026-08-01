import { CATALUNYA_COMARQUES, CATALUNYA_MAP_VIEWBOX } from '../data/catalunyaMapData';

export interface MarcadorMapa {
  x: number;
  y: number;
  color: string;
  label?: string;
  mida?: number;
}

interface Props {
  comarcaSeleccionada?: string | null;
  onSeleccionarComarca?: (nom: string) => void;
  marcadors?: MarcadorMapa[];
}

export function MapaCatalunya({ comarcaSeleccionada, onSeleccionarComarca, marcadors = [] }: Props) {
  return (
    <svg
      viewBox={CATALUNYA_MAP_VIEWBOX}
      className="mapa-catalunya"
      role="img"
      aria-label="Mapa de Catalunya per comarques"
    >
      {CATALUNYA_COMARQUES.map((c) => (
        <path
          key={c.id}
          d={c.path}
          className={`mapa-comarca ${comarcaSeleccionada === c.name ? 'sel' : ''} ${onSeleccionarComarca ? 'clicable' : ''}`}
          onClick={onSeleccionarComarca ? () => onSeleccionarComarca(c.name) : undefined}
        >
          <title>{c.name}</title>
        </path>
      ))}
      {marcadors.map((m, i) => (
        <g key={i} className="mapa-marcador">
          <circle cx={m.x} cy={m.y} r={m.mida ?? 4.2} fill={m.color} stroke="#0b0e14" strokeWidth={0.8} />
          {m.label && (
            <text x={m.x} y={m.y - (m.mida ?? 4.2) - 2.5} textAnchor="middle" className="mapa-etiqueta">
              {m.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
