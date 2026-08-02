import { ClipboardList, Plane, CheckCircle2, AlertTriangle, Newspaper, Map } from 'lucide-react';
import { useJoc } from '../game/store';
import { IconPavello, IconPilota } from './icones';

export function Tauler() {
  const partida = useJoc((s) => s.partida);
  const jugar = useJoc((s) => s.jugar);
  const setPestanya = useJoc((s) => s.setPestanya);
  if (!partida) return null;

  const acabada = partida.jornadaActual >= 22;
  const filaMeu = partida.classificacio.find((f) => f.equipId === 'meu');
  const posMeu = filaMeu ? partida.classificacio.indexOf(filaMeu) + 1 : -1;

  const darrerPartit = partida.darrersPartits[partida.darrersPartits.length - 1];

  return (
    <>
      {/* Resultat de l'última jornada */}
      {darrerPartit && (
        <div className="card">
          <div className="card-titol">
            <span>Últim partit · J{darrerPartit.jornada}</span>
            <span>{darrerPartit.mvp} MVP</span>
          </div>
          <div className="marcador">
            <div className="marcador-equip local">{darrerPartit.local}</div>
            <div className="marcador-punts local">{darrerPartit.puntsLocal}</div>
            <div className="marcador-separador">–</div>
            <div className="marcador-punts visitant">{darrerPartit.puntsVisitant}</div>
            <div className="marcador-equip visitant">{darrerPartit.visitant}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secundari" style={{ flex: 1 }} onClick={() => setPestanya('partit')}>
              <ClipboardList size={16} /> Crònica
            </button>
          </div>
        </div>
      )}

      {/* Classificació */}
      <div className="card">
        <div className="card-titol">
          <span>Classificació</span>
          <span>Lliga LEB Or · 12 equips</span>
        </div>
        <table className="taula-lliga">
          <thead>
            <tr>
              <th>#</th>
              <th>Equip</th>
              <th className="num">J</th>
              <th className="num">G</th>
              <th className="num">P</th>
              <th className="num">PF</th>
              <th className="num">PC</th>
              <th className="num">PTS</th>
              <th style={{ textAlign: 'right' }}>Ratxa</th>
            </tr>
          </thead>
          <tbody>
            {partida.classificacio.map((fila) => (
              <tr key={fila.equipId} className={fila.equipId === 'meu' ? 'meu' : ''}>
                <td className="pos">{partida.classificacio.indexOf(fila) + 1}</td>
                <td>{fila.nom}</td>
                <td className="num">{fila.jugats}</td>
                <td className="num">{fila.guanyats}</td>
                <td className="num">{fila.perduts}</td>
                <td className="num">{fila.puntsFavor}</td>
                <td className="num">{fila.puntsContra}</td>
                <td className="num"><strong>{fila.punts}</strong></td>
                <td>
                  <div className="ratxa">
                    {fila.ratxa.slice(-5).map((r, i) => (
                      <span key={i} className={r}>{r}</span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pròxim partit */}
      {!acabada && (() => {
        const seg = partida.calendari.find((c) => c.jornada === partida.jornadaActual + 1 && (c.local === 'meu' || c.visitant === 'meu'));
        if (!seg) return null;
        const esLocal = seg.local === 'meu';
        const rival = partida.rivals.find((r) => r.id === (esLocal ? seg.visitant : seg.local));
        const filaRival = partida.classificacio.find((f) => f.equipId === rival?.id);
        return (
          <div className="card">
            <div className="card-titol">
              <span>Pròxim partit · J{partida.jornadaActual + 1}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {esLocal ? <><IconPavello size={16} /> A casa</> : <><Plane size={16} /> Fora</>}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
              {rival?.escut ? (
                <img src={rival.escut} alt="" style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div
                  style={{ width: 44, height: 44, borderRadius: 12, background: rival?.color, display: 'grid', placeItems: 'center', fontWeight: 800, flexShrink: 0 }}
                >
                  {rival?.nom.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{esLocal ? `${partida.clubNom} vs ${rival?.nom}` : `${rival?.nom} vs ${partida.clubNom}`}</div>
                <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                  {rival?.ciutat} · Nivell {rival?.nivell} · {filaRival ? `${filaRival.guanyats}V-${filaRival.perduts}D` : ''}
                </div>
              </div>
              <button className="btn btn-secundari" style={{ padding: '6px 10px', fontSize: 12, flexShrink: 0 }} onClick={() => setPestanya('mapa')}>
                <Map size={14} /> Mapa
              </button>
            </div>
          </div>
        );
      })()}

      {/* Notícies */}
      {partida.noticies.length > 0 && (
        <div className="card">
          <div className="card-titol"><span>Notícies</span></div>
          {partida.noticies.slice(-4).reverse().map((n) => (
            <div key={n.id} className="noticia">
              <div className="noticia-titol">
                <span className="emoji">
                  {n.tipus === 'positiu' ? <CheckCircle2 size={16} /> : n.tipus === 'negatiu' ? <AlertTriangle size={16} /> : <Newspaper size={16} />}
                </span>
                {n.titol}
              </div>
              <div className="noticia-text">{n.text}</div>
            </div>
          ))}
        </div>
      )}

      {/* Historial */}
      {partida.història.length > 0 && (
        <div className="card">
          <div className="card-titol"><span>Historial</span></div>
          {partida.història.slice().reverse().map((h) => (
            <div key={h.temporada} className="hist-item">
              <span>Temporada {h.temporada}</span>
              <span className="hist-posicio">{h.posicio}º de {h.total}</span>
              <span style={{ color: 'var(--text-dim)' }}>{h.puntsFavor}-{h.puntsContra}</span>
            </div>
          ))}
        </div>
      )}

      {/* Botó jugar */}
      {!acabada && (
        <div className="jugar-flotant">
          <button className="btn btn-primari" onClick={jugar}>
            <IconPilota size={18} /> Jugar jornada {partida.jornadaActual + 1}
          </button>
          <span className="hint-jornada">
            {posMeu > 0 ? `Ocupes la ${posMeu}º posició amb ${filaMeu?.guanyats} victòries` : ''}
          </span>
        </div>
      )}
    </>
  );
}
