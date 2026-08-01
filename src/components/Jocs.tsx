import { useState } from 'react';
import { useJoc } from '../game/store';
import {
  angleDelPremi, comprovarRasca, barallarCartesMemoria, costJoc, girarRuleta,
  PREMIS_RULETA, PremiRuleta, premiMemoria, potJugar, SIMBOLS_RASCA,
} from '../game/jocs';

export function Jocs() {
  const partida = useJoc((s) => s.partida);
  if (!partida) return null;

  const potRuleta = potJugar(partida.salaJocs, 'ruleta', partida.setmana);
  const potRasca = potJugar(partida.salaJocs, 'rasca', partida.setmana);
  const potMemoria = potJugar(partida.salaJocs, 'memoria', partida.setmana);

  return (
    <>
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40 }}>🍻</div>
        <h2 style={{ fontSize: 18, margin: '4px 0 2px' }}>Bar dels Pavellons</h2>
        <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Cada joc es pot fer un cop per setmana. Prova sort!</p>
      </div>

      <div className="jocs-graella">
        <RuletaCard disponible={potRuleta} />
        <RascaCard disponible={potRasca} />
        <MemoriaCard disponible={potMemoria} />
      </div>
    </>
  );
}

function RuletaCard({ disponible }: { disponible: boolean }) {
  const pagarJocSala = useJoc((s) => s.pagarJocSala);
  const aplicarPremiRuleta = useJoc((s) => s.aplicarPremiRuleta);
  const partida = useJoc((s) => s.partida);
  const [angle, setAngle] = useState(0);
  const [girant, setGirant] = useState(false);
  const [premi, setPremi] = useState<PremiRuleta | null>(null);

  const cost = costJoc('ruleta');
  const noPotPagar = !partida || partida.finanzas.pressupost < cost;

  const conic = `conic-gradient(${PREMIS_RULETA.map((_p, i) => {
    const mida = 360 / PREMIS_RULETA.length;
    const colors = ['#ff8c42', '#5aa9ff', '#3ddc97', '#ffd166', '#c77dff', '#ff5d73', '#9aa5bd'];
    return `${colors[i % colors.length]} ${i * mida}deg ${(i + 1) * mida}deg`;
  }).join(', ')})`;

  const girar = () => {
    if (girant || !disponible || noPotPagar) return;
    if (!pagarJocSala('ruleta')) return;
    setPremi(null);
    setGirant(true);
    const resultat = girarRuleta();
    const anglePremi = angleDelPremi(resultat);
    setAngle((a) => (a - (a % 360)) + 360 * 5 + (360 - anglePremi));
    setTimeout(() => {
      setGirant(false);
      setPremi(resultat);
      aplicarPremiRuleta(resultat);
    }, 3200);
  };

  return (
    <div className="card joc-card">
      <div className="joc-emoji">🎡</div>
      <div className="card-titol" style={{ justifyContent: 'center' }}><span>Ruleta del triple</span></div>
      <div className="joc-cost">Cost: {cost.toLocaleString('ca')}€</div>
      <div className="ruleta-wrap">
        <div className="ruleta-marc">
          <div className="ruleta-agulla" />
          <div className="ruleta-disc" style={{ background: conic, transform: `rotate(${angle}deg)` }} />
        </div>
        <div className="ruleta-resultat">
          {girant ? 'Girant...' : premi ? `${premi.emoji} ${premi.etiqueta}` : '—'}
        </div>
        <button className="btn btn-primari btn-blok" onClick={girar} disabled={!disponible || girant || noPotPagar}>
          {disponible ? '🎡 Girar' : 'Ja jugat aquesta setmana'}
        </button>
      </div>
    </div>
  );
}

function RascaCard({ disponible }: { disponible: boolean }) {
  const pagarJocSala = useJoc((s) => s.pagarJocSala);
  const afegirDiners = useJoc((s) => s.afegirDiners);
  const partida = useJoc((s) => s.partida);
  const [graella, setGraella] = useState<string[] | null>(null);
  const [revelades, setRevelades] = useState<boolean[]>([]);
  const [resultat, setResultat] = useState<{ guanya: boolean; premi: number; simbolGuanyador?: string } | null>(null);

  const cost = costJoc('rasca');
  const noPotPagar = !partida || partida.finanzas.pressupost < cost;

  const comprar = () => {
    if (!disponible || noPotPagar) return;
    if (!pagarJocSala('rasca')) return;
    const nova: string[] = Array.from({ length: 9 }, () => SIMBOLS_RASCA[Math.floor(Math.random() * SIMBOLS_RASCA.length)]);
    setGraella(nova);
    setRevelades(new Array(9).fill(false));
    setResultat(null);
  };

  const revelar = (i: number) => {
    if (!graella || revelades[i]) return;
    const noves = [...revelades];
    noves[i] = true;
    setRevelades(noves);
    if (noves.every(Boolean)) {
      const r = comprovarRasca(graella);
      setResultat(r);
      afegirDiners(r.premi);
    }
  };

  return (
    <div className="card joc-card">
      <div className="joc-emoji">🎫</div>
      <div className="card-titol" style={{ justifyContent: 'center' }}><span>Rasca i guanya</span></div>
      <div className="joc-cost">Cost: {cost.toLocaleString('ca')}€</div>
      {!graella ? (
        <button className="btn btn-primari btn-blok" onClick={comprar} disabled={!disponible || noPotPagar}>
          {disponible ? '🎫 Comprar rasca' : 'Ja jugat aquesta setmana'}
        </button>
      ) : (
        <>
          <div className="rasca-graella">
            {graella.map((s, i) => (
              <div
                key={i}
                className={`rasca-cella ${revelades[i] ? 'revelada' : ''} ${resultat?.guanya && revelades[i] && s === resultat.simbolGuanyador ? 'guanyadora' : ''}`}
                onClick={() => revelar(i)}
              >
                {revelades[i] ? s : '❓'}
              </div>
            ))}
          </div>
          {resultat && (
            <div className="ruleta-resultat" style={{ marginTop: 10 }}>
              {resultat.guanya ? `🎉 Guanyes ${resultat.premi.toLocaleString('ca')}€!` : 'Sense sort aquesta vegada'}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MemoriaCard({ disponible }: { disponible: boolean }) {
  const pagarJocSala = useJoc((s) => s.pagarJocSala);
  const afegirDiners = useJoc((s) => s.afegirDiners);
  const partida = useJoc((s) => s.partida);
  const [cartes, setCartes] = useState<string[] | null>(null);
  const [obertes, setObertes] = useState<number[]>([]);
  const [trobades, setTrobades] = useState<number[]>([]);
  const [intents, setIntents] = useState(0);
  const [premiFinal, setPremiFinal] = useState<number | null>(null);
  const [bloquejat, setBloquejat] = useState(false);

  const cost = costJoc('memoria');
  const noPotPagar = !partida || partida.finanzas.pressupost < cost;

  const comprar = () => {
    if (!disponible || noPotPagar) return;
    if (!pagarJocSala('memoria')) return;
    setCartes(barallarCartesMemoria());
    setObertes([]);
    setTrobades([]);
    setIntents(0);
    setPremiFinal(null);
  };

  const clicar = (i: number) => {
    if (!cartes || bloquejat || obertes.includes(i) || trobades.includes(i)) return;
    const noves = [...obertes, i];
    setObertes(noves);
    if (noves.length === 2) {
      setBloquejat(true);
      const nousIntents = intents + 1;
      setIntents(nousIntents);
      const [a, b] = noves;
      setTimeout(() => {
        if (cartes[a] === cartes[b]) {
          const novesTrobades = [...trobades, a, b];
          setTrobades(novesTrobades);
          if (novesTrobades.length === cartes.length) {
            const premi = premiMemoria(nousIntents);
            setPremiFinal(premi);
            afegirDiners(premi);
          }
        }
        setObertes([]);
        setBloquejat(false);
      }, 700);
    }
  };

  return (
    <div className="card joc-card">
      <div className="joc-emoji">🧠</div>
      <div className="card-titol" style={{ justifyContent: 'center' }}><span>Memòria dels pavellons</span></div>
      <div className="joc-cost">Cost: {cost.toLocaleString('ca')}€</div>
      {!cartes ? (
        <button className="btn btn-primari btn-blok" onClick={comprar} disabled={!disponible || noPotPagar}>
          {disponible ? '🧠 Jugar' : 'Ja jugat aquesta setmana'}
        </button>
      ) : (
        <>
          <div className="memoria-graella">
            {cartes.map((c, i) => {
              const visible = obertes.includes(i) || trobades.includes(i);
              return (
                <div key={i} className={`memoria-carta ${visible ? (trobades.includes(i) ? 'trobada' : 'girada') : ''}`} onClick={() => clicar(i)}>
                  {visible ? c : '🏀'}
                </div>
              );
            })}
          </div>
          <div className="ruleta-resultat" style={{ marginTop: 10 }}>
            {premiFinal !== null ? `🎉 Completat en ${intents} intents: +${premiFinal.toLocaleString('ca')}€` : `Intents: ${intents}`}
          </div>
        </>
      )}
    </div>
  );
}
