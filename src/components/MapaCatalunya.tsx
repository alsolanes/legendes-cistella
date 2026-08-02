import { ReactNode } from 'react';
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

/** Etiqueta que es contra-escala amb el zoom: manté la mida llegible a pantalla.
 * Sense això, els noms es veuen gegants quan t'apropes (el viewBox s'encongeix i
 * el text escala amb ell). fontSize en unitats d'usuari = midaBase / zoom. */
function EtiquetaAmbZoom({ x, y, midaBase, className, children }: { x: number; y: number; midaBase: number; className: string; children: ReactNode }) {
  const zoom = useZoom();
  return (
    <text x={x} y={y} textAnchor="middle" className={className} style={{ fontSize: midaBase / zoom }}>
      {children}
    </text>
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
            <EtiquetaAmbZoom x={0} y={-4.5} midaBase={5.5} className="mapa-etiqueta-poble">{p.nom}</EtiquetaAmbZoom>
          </g>
        );
      })}

      {marcadors.map((m, i) => (
        <g key={i} className="mapa-marcador">
          <circle cx={m.x} cy={m.y} r={m.mida ?? 4.2} fill={m.color} stroke="#0b0e14" strokeWidth={0.8} />
          {m.label && (
            <EtiquetaAmbZoom x={m.x} y={m.y - (m.mida ?? 4.2) - 2.5} midaBase={7} className="mapa-etiqueta">
              {m.label}
            </EtiquetaAmbZoom>
          )}
        </g>
      ))}
    </MapaAmbZoom>
  );
}
