import { useState } from 'react';
import { useJoc } from '../game/store';
import { Jugador, Posicio } from '../game/types';
import { mitjana } from '../game/generador';

const POSICIONS: Posicio[] = ['Base', 'Escorta', 'Aler', 'Ala-pivot', 'Pivot'];
const INICIALS_POS: Record<Posicio, string> = { Base: 'B', Escorta: 'E', Aler: 'A', 'Ala-pivot': 'AP', Pivot: 'P' };

/** Posicions a la pista: coordenades percentuals (esquerra = defensa pròpia, dreta = atac) */
const POSICIONS_PISTA: Record<Posicio, { x: number; y: number }> = {
  Base: { x: 58, y: 68 },
  Escorta: { x: 70, y: 40 },
  Aler: { x: 55, y: 30 },
  'Ala-pivot': { x: 35, y: 55 },
  Pivot: { x: 30, y: 40 },
};

export function Plantilla() {
  const partida = useJoc((s) => s.partida);
  const setTitulars = useJoc((s) => s.setTitulars);
  const setEsquema = useJoc((s) => s.setEsquema);
  const setPressing = useJoc((s) => s.setPressing);
  const [detall, setDetall] = useState<Jugador | null>(null);
  if (!partida) return null;

  const titulars = partida.alineacio.titulars
    .map((id) => partida.plantilla.find((j) => j.id === id))
    .filter(Boolean) as Jugador[];
  const banqueta = partida.plantilla.filter((j) => !partida.alineacio.titulars.includes(j.id));

  const ferTitular = (jugador: Jugador) => {
    // Substitueix el titular de la mateixa posició; si no n'hi ha, el pitjor titular
    const mateixaPos = titulars.find((t) => t.posicio === jugador.posicio);
    if (mateixaPos) {
      setTitulars(partida.alineacio.titulars.map((id) => (id === mateixaPos.id ? jugador.id : id)));
    } else {
      const pitjor = [...titulars].sort((a, b) => mitjana(a.atributs) - mitjana(b.atributs))[0];
      setTitulars(partida.alineacio.titulars.map((id) => (id === pitjor.id ? jugador.id : id)));
    }
  };

  const foraTitular = (jugador: Jugador) => {
    // El substitueix el millor jugador de la banqueta de la mateixa posició (o qualsevol)
    const candidat = banqueta.find((b) => b.posicio === jugador.posicio) ?? [...banqueta].sort((a, b) => mitjana(b.atributs) - mitjana(a.atributs))[0];
    if (candidat) {
      setTitulars(partida.alineacio.titulars.map((id) => (id === jugador.id ? candidat.id : id)));
    }
  };

  return (
    <>
      {/* Esquema i pressing */}
      <div className="card">
        <div className="card-titol"><span>Esquema tàctic</span></div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {([
            ['clasica', 'Clàssica'],
            ['exterior', 'Tir exterior'],
            ['interior', 'Joc interior'],
            ['transicio', 'Transició'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              className={`btn ${partida.alineacio.esquema === id ? 'btn-primari' : 'btn-secundari'}`}
              style={{ flex: 1, padding: '8px 10px', fontSize: 12 }}
              onClick={() => setEsquema(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
          <button className={`btn ${partida.alineacio.defensaPressing ? 'btn-primari' : 'btn-secundari'}`} style={{ flex: 1, padding: '8px', fontSize: 12 }} onClick={() => setPressing(!partida.alineacio.defensaPressing)}>
            {partida.alineacio.defensaPressing ? '🛡 Pressió activa' : '🛡 Pressió: OFF'}
          </button>
          <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
            La pressió augmenta els robatoris però cansa més la plantilla
          </span>
        </div>
      </div>

      {/* Pista */}
      <div className="card" style={{ padding: 12 }}>
        <div className="card-titol" style={{ marginBottom: 6 }}>
          <span>Quintet inicial</span>
          <span>Toca un jugador per canviar-lo</span>
        </div>
        <div className="pista">
          <div className="pista-linia centre" />
          <div className="pista-cercle" />
          <div className="pista-linia arc-local" />
          <div className="pista-linia arc-visitant" />
          <div className="pista-linia tres-local" />
          <div className="pista-linia tres-visitant" />
          {titulars.map((j) => {
            const pos = POSICIONS_PISTA[j.posicio];
            const força = mitjana(j.atributs);
            return (
              <button
                key={j.id}
                className={`jugador-pista titular ${j.estat !== 'actiu' ? 'lesionat' : ''}`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%`, background: j.estat !== 'actiu' ? '#555' : `linear-gradient(135deg, ${partida.colorPrincipal}, ${partida.colorSecundari})` }}
                onClick={() => setDetall(j)}
              >
                <span className="inicials">{j.nom.slice(0, 1)}{j.cognom.slice(0, 1)}</span>
                <span className="pos-etiqueta">{INICIALS_POS[j.posicio]} · {força}</span>
              </button>
            );
          })}
        </div>
        <div className="pista-llegenda">
          <span>Defensa pròpia</span>
          <span>Atac</span>
        </div>
      </div>

      {/* Banqueta */}
      <div className="card">
        <div className="card-titol"><span>Banqueta</span><span>{banqueta.length} jugadors</span></div>
        {banqueta.length === 0 && <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>La banqueta és buida.</div>}
        {banqueta.map((j) => (
          <JugadorFila
            key={j.id}
            jugador={j}
            colorPrincipal={partida.colorPrincipal}
            onClick={() => setDetall(j)}
            accio={<button className="btn btn-secundari" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => ferTitular(j)}>Titular</button>}
          />
        ))}
      </div>

      {/* Plantilla sencera per posició */}
      <div className="card">
        <div className="card-titol"><span>Plantilla</span><span>{partida.plantilla.length}/14</span></div>
        {POSICIONS.map((pos) => {
          const jugadors = partida.plantilla.filter((j) => j.posicio === pos);
          return (
            <div key={pos} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--taronja)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                {pos} · {jugadors.length}
              </div>
              {jugadors.map((j) => {
                const esTitular = partida.alineacio.titulars.includes(j.id);
                return (
                  <JugadorFila
                    key={j.id}
                    jugador={j}
                    colorPrincipal={partida.colorPrincipal}
                    onClick={() => setDetall(j)}
                    esTitular={esTitular}
                    accio={
                      esTitular
                        ? <button className="btn btn-perill" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => foraTitular(j)}>Treure</button>
                        : <button className="btn btn-secundari" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => ferTitular(j)}>Titular</button>
                    }
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Modal detall */}
      {detall && <DetallJugador jugador={detall} onClose={() => setDetall(null)} />}
    </>
  );
}

function JugadorFila({ jugador, onClick, accio, esTitular, colorPrincipal }: {
  jugador: Jugador; onClick: () => void; accio: React.ReactNode; esTitular?: boolean; colorPrincipal: string;
}) {
  const força = mitjana(jugador.atributs);
  const lesionat = jugador.estat !== 'actiu';
  return (
    <div className={`jugador-card ${esTitular ? 'titular' : ''} ${lesionat ? 'lesionat' : ''}`} onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="jugador-avatar" style={{ background: lesionat ? '#444' : `linear-gradient(135deg, ${colorPrincipal}, #00000066)` }}>
        {jugador.nom.slice(0, 1)}
      </div>
      <div className="jugador-info">
        <div className="jugador-nom">
          {jugador.nom} {jugador.cognom}
          {esTitular && <span className="badge" style={{ background: 'rgba(255,140,66,0.15)', color: 'var(--taronja)' }}>TIT</span>}
          {lesionat && <span className="badge lesio">😷 {jugador.lesioSetmanes} set.</span>}
          {jugador.estat === 'sancionat' && <span className="badge lesio">⛔ {jugador.sancionSetmanes} set.</span>}
        </div>
        <div className="jugador-sub">
          {jugador.posicio} · {jugador.edat} anys · {jugador.nacionalitat} · {jugador.sou.toLocaleString('ca')}€
        </div>
        <div className="barra"><div style={{ width: `${força}%` }} /></div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div className="estrelles">{'★'.repeat(jugador.estrelles)}{'☆'.repeat(5 - jugador.estrelles)}</div>
        <div style={{ fontSize: 16, fontWeight: 800 }}>{força}</div>
        <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>FOR {jugador.forma}</div>
      </div>
      <div onClick={(e) => e.stopPropagation()}>{accio}</div>
    </div>
  );
}

function DetallJugador({ jugador, onClose }: { jugador: Jugador; onClose: () => void }) {
  const acomiadar = useJoc((s) => s.acomiadar);
  const renovar = useJoc((s) => s.renovar);
  const vendre = useJoc((s) => s.vendreJugador);

  const atributs: Array<[string, number]> = [
    ['Anotació', jugador.atributs.anotacio],
    ['Triple', jugador.atributs.triple],
    ['Defensa', jugador.atributs.defensa],
    ['Rebot', jugador.atributs.rebot],
    ['Velocitat', jugador.atributs.velocitat],
    ['Resistència', jugador.atributs.resistencia],
  ];
  const valor = Math.round(jugador.sou * 2.2);

  return (
    <div className="modal-fons" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 18 }}>{jugador.nom} {jugador.cognom}</h2>
          <button className="btn btn-secundari" style={{ padding: '6px 10px' }} onClick={onClose}>✕</button>
        </div>
        <div className="jugador-sub" style={{ marginBottom: 12 }}>
          {jugador.posicio} · {jugador.edat} anys · {jugador.nacionalitat} · Contracte: {jugador.contracteAnys} any(s)
        </div>
        <div className="estrelles" style={{ marginBottom: 14 }}>{'★'.repeat(jugador.estrelles)}{'☆'.repeat(5 - jugador.estrelles)}</div>
        <div className="detall-atributs" style={{ marginBottom: 14 }}>
          {atributs.map(([nom, v]) => (
            <div key={nom} className="detall-atribut">
              <span>{nom}</span>
              <strong>{v}</strong>
            </div>
          ))}
        </div>
        <div className="detall-atribut" style={{ marginBottom: 16 }}>
          <span>Valor de mercat</span>
          <strong>{valor.toLocaleString('ca')}€</strong>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="btn btn-secundari" onClick={() => { renovar(jugador.id); onClose(); }}>🔄 Renovar contracte (+10% sou)</button>
          <button className="btn btn-secundari" onClick={() => { vendre(jugador.id); onClose(); }}>💸 Vendre ({valor.toLocaleString('ca')}€)</button>
          <button className="btn btn-perill" onClick={() => { acomiadar(jugador.id); onClose(); }}>🚪 Acomiadar (50% indemnització)</button>
        </div>
      </div>
    </div>
  );
}
