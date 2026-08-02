import { CATALUNYA_COMARQUES } from '../data/catalunyaMapData';
import { MapaAmbZoom, useZoom } from './MapaAmbZoom';

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

/** Punt d'un poble contra-escalat amb el zoom: el radi es divideix per zoom,
 * així la mida A PANTALLA es manté constant (els punts no es fan gegants).
 * La zona de clic (invisible) creix amb sqrt perquè sigui fàcil de tocar al mòbil. */
function PobleAmbZoom({ p, seleccionat, onClic }: { p: PobleClicable; seleccionat: boolean; onClic?: (nom: string) => void }) {
  const zoom = useZoom();
  const rDot = (2.6 / zoom) * (seleccionat ? 1.3 : 1);
  const rHit = 6.24 / Math.sqrt(zoom);
  return (
    <g
      className={`mapa-poble ${seleccionat ? 'sel' : ''} ${onClic ? 'clicable' : ''}`}
      onClick={onClic ? () => onClic(p.nom) : undefined}
      transform={`translate(${p.x} ${p.y})`}
    >
      <circle r={rHit} fill="transparent" className="mapa-poble-hit" />
      <circle r={rDot} className="mapa-poble-dot" vectorEffect="non-scaling-stroke" />
      <text y={-(rDot + 4.5 / zoom)} textAnchor="middle" className="mapa-etiqueta-poble" style={{ fontSize: 5.5 / zoom }}>
        {p.nom}
      </text>
    </g>
  );
}

/** Marcador (club/rival) contra-escalat: creix lleugerament amb el zoom (sqrt)
 * perquè sigui el focus del mapa, però mai desproporcionadament. */
function MarcadorAmbZoom({ m }: { m: MarcadorMapa }) {
  const zoom = useZoom();
  const r = (m.mida ?? 4.2) / Math.sqrt(zoom);
  return (
    <g className="mapa-marcador">
      <circle cx={m.x} cy={m.y} r={r} fill={m.color} stroke="#0b0e14" strokeWidth={0.8} vectorEffect="non-scaling-stroke" />
      {m.label && (
        <text x={m.x} y={m.y - r - 2.5 / zoom} textAnchor="middle" className="mapa-etiqueta" style={{ fontSize: 7 / zoom }}>
          {m.label}
        </text>
      )}
    </g>
  );
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

      {pobles.map((p) => (
        <PobleAmbZoom
          key={p.nom}
          p={p}
          seleccionat={pobleSeleccionat === p.nom}
          onClic={onSeleccionarPoble}
        />
      ))}

      {marcadors.map((m, i) => (
        <MarcadorAmbZoom key={i} m={m} />
      ))}
    </MapaAmbZoom>
  );
}
