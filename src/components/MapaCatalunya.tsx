import { CATALUNYA_COMARQUES } from '../data/catalunyaMapData';
import { MapaAmbZoom } from './MapaAmbZoom';

export interface MarcadorMapa {
  x: number;
  y: number;
  color: string;
  label?: string;
  mida?: number;
}

export interface PobleClicable {
  nom: string;
  x: number;
  y: number;
}

interface Props {
  comarcaSeleccionada?: string | null;
  onSeleccionarComarca?: (nom: string) => void;
  marcadors?: MarcadorMapa[];
  /** Pobles reals de la comarca: es dibuixen com a punts clicables (amb zoom es deixen de solapar) */
  pobles?: PobleClicable[];
  onSeleccionarPoble?: (nom: string) => void;
  pobleSeleccionat?: string | null;
}

export function MapaCatalunya({ comarcaSeleccionada, onSeleccionarComarca, marcadors = [], pobles = [], onSeleccionarPoble, pobleSeleccionat }: Props) {
  return (
    <MapaAmbZoom>
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

      {/* Pobles de la comarca seleccionada: punts clicables (més fàcils de triar amb zoom) */}
      {pobles.map((p) => {
        const r = 2.6;
        return (
          <g
            key={p.nom}
            className={`mapa-poble ${pobleSeleccionat === p.nom ? 'sel' : ''} ${onSeleccionarPoble ? 'clicable' : ''}`}
            onClick={onSeleccionarPoble ? () => onSeleccionarPoble(p.nom) : undefined}
            transform={`translate(${p.x} ${p.y})`}
          >
            <circle r={r * 2.4} fill="transparent" className="mapa-poble-hit" />
            <circle r={r} className="mapa-poble-dot" />
            <text y={-4.5} textAnchor="middle" className="mapa-etiqueta-poble">{p.nom}</text>
          </g>
        );
      })}

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
    </MapaAmbZoom>
  );
}
