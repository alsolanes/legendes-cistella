import { useState } from 'react';
import {
  ShoppingCart,
  Sprout,
  AlertTriangle,
  Shield,
  ArrowUp,
  Coins,
  Bandage,
  Ban,
  BatteryLow,
  Star,
  X,
  RefreshCw,
  DoorOpen,
} from 'lucide-react';
import { IconPilota } from './icones';
import { useJoc } from '../game/store';
import { Jugador, Posicio } from '../game/types';
import { mitjana, simbolsJugador } from '../game/generador';
import { tePerk } from '../game/llegat';
import { aplicarDescompteNegociador } from '../game/contractes';

function AvatarJugador({ jugador, mida = 38, background }: { jugador: Jugador; mida?: number; background: string }) {
  if (jugador.avatar) {
    return <img className="jugador-avatar" src={jugador.avatar} style={{ width: mida, height: mida }} alt="" />;
  }
  return (
    <div className="jugador-avatar" style={{ width: mida, height: mida, background }}>
      {jugador.nom.slice(0, 1)}
    </div>
  );
}

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

function Estrelles({ n, size = 14 }: { n: number; size?: number }) {
  return (
    <div className="estrelles" style={{ display: 'inline-flex', gap: 2 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={size} fill={i < n ? 'currentColor' : 'none'} />
      ))}
    </div>
  );
}

function etiquetaPotencial(potencial: number, veuExacte: boolean): string {
  if (veuExacte) return `${potencial}`;
  if (potencial >= 85) return 'Molt alt';
  if (potencial >= 72) return 'Alt';
  if (potencial >= 60) return 'Mitjà';
  return 'Baix';
}

export function Plantilla() {
  const partida = useJoc((s) => s.partida);
  const setTitulars = useJoc((s) => s.setTitulars);
  const setEsquema = useJoc((s) => s.setEsquema);
  const setPressing = useJoc((s) => s.setPressing);
  const [detall, setDetall] = useState<Jugador | null>(null);
  const [vista, setVista] = useState<'equip' | 'mercat' | 'cantera'>('equip');
  if (!partida) return null;

  const titulars = partida.alineacio.titulars
    .map((id) => partida.plantilla.find((j) => j.id === id))
    .filter(Boolean) as Jugador[];
  const banqueta = partida.plantilla.filter((j) => !partida.alineacio.titulars.includes(j.id));
  const teOjeador = tePerk(partida.llegat, 'ojeador');
  const teTactic = tePerk(partida.llegat, 'tactic');

  const ferTitular = (jugador: Jugador) => {
    const mateixaPos = titulars.find((t) => t.posicio === jugador.posicio);
    if (mateixaPos) {
      setTitulars(partida.alineacio.titulars.map((id) => (id === mateixaPos.id ? jugador.id : id)));
    } else {
      const pitjor = [...titulars].sort((a, b) => mitjana(a.atributs) - mitjana(b.atributs))[0];
      setTitulars(partida.alineacio.titulars.map((id) => (id === pitjor.id ? jugador.id : id)));
    }
  };

  const foraTitular = (jugador: Jugador) => {
    const candidat = banqueta.find((b) => b.posicio === jugador.posicio) ?? [...banqueta].sort((a, b) => mitjana(b.atributs) - mitjana(a.atributs))[0];
    if (candidat) {
      setTitulars(partida.alineacio.titulars.map((id) => (id === jugador.id ? candidat.id : id)));
    }
  };

  const titularsCansats = titulars.filter((j) => j.forma < 45);

  return (
    <>
      <div style={{ display: 'flex', gap: 4, background: 'var(--fons-elevat)', padding: 4, borderRadius: 14, marginBottom: 14 }}>
        {([
          ['equip', <><IconPilota size={16} /> Equip</>],
          ['mercat', <><ShoppingCart size={16} /> Mercat</>],
          ['cantera', <><Sprout size={16} /> Cantera</>],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            className={`tab ${vista === id ? 'activa' : ''}`}
            style={{ flex: 1 }}
            onClick={() => setVista(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {vista === 'equip' && (
        <>
          {titularsCansats.length > 0 && (
            <div className="card" style={{ borderColor: 'var(--vermell)' }}>
              <div className="card-titol"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={18} /> Rotació recomanada</span></div>
              <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>
                {titularsCansats.map((j) => `${j.nom} ${j.cognom}`).join(', ')} {titularsCansats.length > 1 ? 'juguen' : 'juga'} cansats (forma baixa). Considera descansar-los.
              </div>
            </div>
          )}

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
              {teTactic && (
                <button
                  className={`btn ${partida.alineacio.esquema === 'zona23' ? 'btn-primari' : 'btn-secundari'}`}
                  style={{ flex: 1, padding: '8px 10px', fontSize: 12 }}
                  onClick={() => setEsquema('zona23')}
                >
                  Zona 2-3
                </button>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
              <button className={`btn ${partida.alineacio.defensaPressing ? 'btn-primari' : 'btn-secundari'}`} style={{ flex: 1, padding: '8px', fontSize: 12 }} onClick={() => setPressing(!partida.alineacio.defensaPressing)}>
                <Shield size={18} /> {partida.alineacio.defensaPressing ? 'Pressió activa' : 'Pressió: OFF'}
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
        </>
      )}

      {vista === 'mercat' && <Mercat teOjeador={teOjeador} />}
      {vista === 'cantera' && <Cantera teOjeador={teOjeador} />}

      {/* Modal detall */}
      {detall && <DetallJugador jugador={detall} onClose={() => setDetall(null)} />}
    </>
  );
}

function Mercat({ teOjeador }: { teOjeador: boolean }) {
  const partida = useJoc((s) => s.partida);
  const fitxarMercat = useJoc((s) => s.fitxarMercat);
  if (!partida) return null;

  return (
    <div className="card">
      <div className="card-titol"><span>Mercat de fitxatges</span><span>Es renova cada setmana</span></div>
      {partida.mercat.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>Cap jugador disponible ara mateix.</div>}
      {partida.mercat.map((j) => {
        const preu = aplicarDescompteNegociador(j.preuFitxatge ?? 0, partida.llegat);
        const esAgentLliure = (j.preuFitxatge ?? 0) === 0;
        const noPotPagar = partida.finanzas.pressupost < preu || partida.plantilla.length >= 14;
        return (
          <div key={j.id} className="jugador-card">
            <AvatarJugador jugador={j} background={`linear-gradient(135deg, ${partida.colorPrincipal}, #00000066)`} />
            <div className="jugador-info">
              <div className="jugador-nom">
                {j.nom} {j.cognom}
                {esAgentLliure && <span className="badge">AGENT LLIURE</span>}
              </div>
              <div className="jugador-sub">{j.posicio} · {j.edat} anys · {mitjana(j.atributs)} mitjana · {j.sou.toLocaleString('ca')}€/any</div>
              <div className="simbols-fila">
                {simbolsJugador(j.atributs).map((s) => <span key={s} className="simbol-badge">{s}</span>)}
                {teOjeador && j.potencial !== undefined && <span className="simbol-badge" style={{ background: 'rgba(90,169,255,0.15)', color: 'var(--blau)' }}>POT {j.potencial}</span>}
              </div>
            </div>
            <button className="btn btn-primari" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => fitxarMercat(j.id)} disabled={noPotPagar}>
              {preu.toLocaleString('ca')}€
            </button>
          </div>
        );
      })}
    </div>
  );
}

function Cantera({ teOjeador }: { teOjeador: boolean }) {
  const partida = useJoc((s) => s.partida);
  const pujarCantera = useJoc((s) => s.pujarCantera);
  const vendreCantera = useJoc((s) => s.vendreCantera);
  if (!partida) return null;

  return (
    <div className="card">
      <div className="card-titol"><span>Cantera</span><span>Joves de la temporada</span></div>
      {partida.cantera.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>Cap jove promès disponible aquesta temporada.</div>}
      {partida.cantera.map((j) => (
        <div key={j.id} className="jugador-card">
          <AvatarJugador jugador={j} background="linear-gradient(135deg, #3ddc97, #0f6e4f)" />
          <div className="jugador-info">
            <div className="jugador-nom">{j.nom} {j.cognom} <span className="badge">{j.edat} anys</span></div>
            <div className="jugador-sub">{j.posicio} · nivell actual {mitjana(j.atributs)} · potencial: {etiquetaPotencial(j.potencial ?? 50, teOjeador)}</div>
            <div className="simbols-fila">{simbolsJugador(j.atributs).map((s) => <span key={s} className="simbol-badge">{s}</span>)}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button className="btn btn-primari" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => pujarCantera(j.id)} disabled={partida.plantilla.length >= 14}><ArrowUp size={16} /> Pujar</button>
            <button className="btn btn-secundari" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => vendreCantera(j.id)}><Coins size={16} /> Vendre</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function JugadorFila({ jugador, onClick, accio, esTitular, colorPrincipal }: {
  jugador: Jugador; onClick: () => void; accio: React.ReactNode; esTitular?: boolean; colorPrincipal: string;
}) {
  const força = mitjana(jugador.atributs);
  const lesionat = jugador.estat !== 'actiu';
  const cansat = esTitular && jugador.forma < 45;
  return (
    <div className={`jugador-card ${esTitular ? 'titular' : ''} ${lesionat ? 'lesionat' : ''}`} onClick={onClick} style={{ cursor: 'pointer' }}>
      <AvatarJugador jugador={jugador} background={lesionat ? '#444' : `linear-gradient(135deg, ${colorPrincipal}, #00000066)`} />
      <div className="jugador-info">
        <div className="jugador-nom">
          {jugador.nom} {jugador.cognom}
          {esTitular && <span className="badge" style={{ background: 'rgba(255,140,66,0.15)', color: 'var(--taronja)' }}>TIT</span>}
          {lesionat && <span className="badge lesio" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Bandage size={12} /> {jugador.lesioSetmanes} set.</span>}
          {jugador.estat === 'sancionat' && <span className="badge lesio" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Ban size={12} /> {jugador.sancionSetmanes} set.</span>}
          {cansat && <span className="badge lesio" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><BatteryLow size={12} /> Cansat</span>}
        </div>
        <div className="jugador-sub">
          {jugador.posicio} · {jugador.edat} anys · {jugador.nacionalitat} · {jugador.sou.toLocaleString('ca')}€
        </div>
        <div className="barra"><div style={{ width: `${força}%` }} /></div>
        <div className="simbols-fila">{simbolsJugador(jugador.atributs).map((s) => <span key={s} className="simbol-badge">{s}</span>)}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <Estrelles n={jugador.estrelles} size={14} />
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
          <button className="btn btn-secundari" style={{ padding: '6px 10px' }} onClick={onClose}><X size={20} /></button>
        </div>
        <div className="jugador-sub" style={{ marginBottom: 8 }}>
          {jugador.posicio} · {jugador.edat} anys · {jugador.nacionalitat} · Contracte: {jugador.contracteAnys} any(s)
        </div>
        <div className="simbols-fila" style={{ marginBottom: 10 }}>{simbolsJugador(jugador.atributs).map((s) => <span key={s} className="simbol-badge">{s}</span>)}</div>
        <div style={{ marginBottom: 14 }}><Estrelles n={jugador.estrelles} size={18} /></div>
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
          <button className="btn btn-secundari" onClick={() => { renovar(jugador.id); onClose(); }}><RefreshCw size={18} /> Renovar contracte (+10% sou, no sempre accepten)</button>
          <button className="btn btn-secundari" onClick={() => { vendre(jugador.id); onClose(); }}><Coins size={18} /> Vendre ({valor.toLocaleString('ca')}€)</button>
          <button className="btn btn-perill" onClick={() => { acomiadar(jugador.id); onClose(); }}><DoorOpen size={18} /> Acomiadar (50% indemnització)</button>
        </div>
      </div>
    </div>
  );
}
