import { ArrowLeft } from 'lucide-react';
import { useJoc } from '../game/store';
import { MapaCatalunya, MarcadorMapa } from './MapaCatalunya';
import { getTownPointFlexible } from '../utils/catalunyaMap';

export function Mapa() {
  const partida = useJoc((s) => s.partida);
  const setPestanya = useJoc((s) => s.setPestanya);
  if (!partida) return null;

  const marcadors: MarcadorMapa[] = [];
  const puntClub = getTownPointFlexible(partida.ciutat);
  if (puntClub) marcadors.push({ x: puntClub.x, y: puntClub.y, color: partida.colorPrincipal, label: partida.clubNom, mida: 6 });

  for (const rival of partida.rivals) {
    const punt = getTownPointFlexible(rival.ciutat);
    if (punt) marcadors.push({ x: punt.x, y: punt.y, color: rival.color, label: rival.nom, mida: 3.6 });
  }

  return (
    <>
      <button className="btn btn-secundari" style={{ marginBottom: 12 }} onClick={() => setPestanya('tauler')}>
        <ArrowLeft size={16} /> Tornar al tauler
      </button>

      <div className="card">
        <div className="card-titol">
          <span>Mapa del club</span>
          <span>{partida.comarca ?? partida.ciutat}</span>
        </div>
        <MapaCatalunya marcadors={marcadors} />
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 10, textAlign: 'center' }}>
          El punt gran és el teu club. Els punts petits són els rivals catalans localitzats al mapa.
        </div>
      </div>

      <div className="card">
        <div className="card-titol"><span>Rivals a Catalunya</span></div>
        {partida.rivals.filter((r) => getTownPointFlexible(r.ciutat)).map((r) => (
          <div key={r.id} className="hist-item">
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: r.color, display: 'inline-block' }} />
              {r.nom}
            </span>
            <span style={{ color: 'var(--text-dim)' }}>{r.ciutat} · Nivell {r.nivell}</span>
          </div>
        ))}
        {partida.rivals.every((r) => !getTownPointFlexible(r.ciutat)) && (
          <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>Cap rival localitzat al mapa aquesta temporada.</div>
        )}
      </div>
    </>
  );
}
