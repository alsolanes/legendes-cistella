import { useState } from 'react';
import { useJoc } from '../game/store';
import { PartitSimulat } from '../game/types';

export function Partit() {
  const partida = useJoc((s) => s.partida);
  const jugar = useJoc((s) => s.jugar);
  if (!partida) return null;

  const darrers = partida.darrersPartits;
  const [seleccionat, setSeleccionat] = useState<number>(darrers.length - 1);

  if (darrers.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🏀</div>
        <p style={{ marginBottom: 16, color: 'var(--text-dim)' }}>Encara no has jugat cap partit.</p>
        <button className="btn btn-primari" onClick={jugar}>Jugar la jornada 1</button>
      </div>
    );
  }

  const partit = darrers[Math.min(seleccionat, darrers.length - 1)];
  const esLocal = partit.local === partida.clubNom;
  const victoria = esLocal ? partit.puntsLocal > partit.puntsVisitant : partit.puntsVisitant > partit.puntsLocal;
  const stats = esLocal ? partit.stats.local : partit.stats.visitant;
  const statsRival = esLocal ? partit.stats.visitant : partit.stats.local;

  return (
    <>
      {/* Selector d'historial */}
      {darrers.length > 1 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto' }}>
          {darrers.map((p, i) => (
            <button
              key={p.id}
              className={`btn ${i === seleccionat ? 'btn-primari' : 'btn-secundari'}`}
              style={{ padding: '6px 10px', fontSize: 12, flexShrink: 0 }}
              onClick={() => setSeleccionat(i)}
            >
              J{p.jornada}
            </button>
          ))}
        </div>
      )}

      <div className="card">
        <div className="partit-cap">
          <span>Jornada {partit.jornada} · {esLocal ? 'A casa' : 'Fora'}</span>
          <span style={{ color: victoria ? 'var(--verd)' : 'var(--vermell)', fontWeight: 800 }}>
            {victoria ? 'VICTÒRIA' : 'DERROTA'}
          </span>
        </div>
        <div className="marcador">
          <div className="marcador-equip local">{partit.local}</div>
          <div className="marcador-punts local">{partit.puntsLocal}</div>
          <div className="marcador-separador">–</div>
          <div className="marcador-punts visitant">{partit.puntsVisitant}</div>
          <div className="marcador-equip visitant">{partit.visitant}</div>
        </div>
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-dim)' }}>
          ⭐ MVP: {partit.mvp}
        </div>
      </div>

      {/* Crònica */}
      <div className="card">
        <div className="card-titol"><span>Crònica</span><span>{partit.events.length} events</span></div>
        <div className="cronica">
          {partit.events.map((ev, i) => (
            <div key={i} className={`cronica-item ${ev.equip}`}>
              <span className="cronica-minut">{ev.minut}&apos;</span>
              <span>{ev.descripcio}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="card">
        <div className="card-titol"><span>Estadístiques</span></div>
        <div className="stats-taul">
          <StatFila l={stats.punts} v={statsRival.punts} etiqueta="Punts" destacat />
          <div className="separador" />
          <StatFila l={`${stats.tirs2.anotats}/${stats.tirs2.intentats}`} v={`${statsRival.tirs2.anotats}/${statsRival.tirs2.intentats}`} etiqueta="Tirs de 2" />
          <StatFila l={`${stats.tirs3.anotats}/${stats.tirs3.intentats}`} v={`${statsRival.tirs3.anotats}/${statsRival.tirs3.intentats}`} etiqueta="Triples" />
          <StatFila l={`${stats.tirsLliures.anotats}/${stats.tirsLliures.intentats}`} v={`${statsRival.tirsLliures.anotats}/${statsRival.tirsLliures.intentats}`} etiqueta="Tirs lliures" />
          <div className="separador" />
          <StatFila l={stats.rebots} v={statsRival.rebots} etiqueta="Rebots" />
          <StatFila l={stats.assistencies} v={statsRival.assistencies} etiqueta="Assistències" />
          <StatFila l={stats.robatoris} v={statsRival.robatoris} etiqueta="Robatoris" />
          <StatFila l={stats.perdudes} v={statsRival.perdudes} etiqueta="Pilotes perdudes" />
          <StatFila l={stats.faltes} v={statsRival.faltes} etiqueta="Faltes" />
        </div>
      </div>

      {/* Botó jugar següent jornada */}
      {partida.jornadaActual < 22 && (
        <div className="jugar-flotant">
          <button className="btn btn-primari" onClick={jugar}>
            🏀 Jugar jornada {partida.jornadaActual + 1}
          </button>
        </div>
      )}
    </>
  );
}

function StatFila({ l, v, etiqueta, destacat }: { l: number | string; v: number | string; etiqueta: string; destacat?: boolean }) {
  return (
    <>
      <div className="valor l" style={destacat ? { color: 'var(--taronja)', fontSize: 20 } : undefined}>{l}</div>
      <div className="etiqueta" style={destacat ? { fontWeight: 800 } : undefined}>{etiqueta}</div>
      <div className="valor" style={destacat ? { color: 'var(--blau)', fontSize: 20 } : undefined}>{v}</div>
    </>
  );
}

export type { PartitSimulat };
