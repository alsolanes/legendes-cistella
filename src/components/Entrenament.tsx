import { useState } from 'react';
import { Dumbbell, Target, Shield, ClipboardList } from 'lucide-react';
import { useJoc } from '../game/store';
import { SESSIONS, SESSIONS_PER_SETMANA } from '../game/entrenament';
import { TipusSessio } from '../game/types';
import { mitjana } from '../game/generador';

const ICONA_SESSIO: Record<TipusSessio, typeof Target> = {
  tir: Target,
  defensa: Shield,
  fisic: Dumbbell,
  tactic: ClipboardList,
};

export function Entrenament() {
  const partida = useJoc((s) => s.partida);
  const entrenar = useJoc((s) => s.entrenar);
  const [tipus, setTipus] = useState<TipusSessio>('tir');
  const [seleccionats, setSeleccionats] = useState<string[]>([]);
  if (!partida) return null;

  const restants = SESSIONS_PER_SETMANA - partida.entrenamentSetmana.sessionsFetes;
  const actius = partida.plantilla.filter((j) => j.estat === 'actiu');
  const multiplicador = 1 + (partida.instalacions.nivell - 1) * 0.15;

  const toggle = (id: string) => {
    setSeleccionats((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const fer = () => {
    if (seleccionats.length === 0 || restants <= 0) return;
    entrenar(tipus, seleccionats);
    setSeleccionats([]);
  };

  return (
    <>
      <div className="card">
        <div className="card-titol">
          <span>Entrenament setmanal</span>
          <span>{restants}/{SESSIONS_PER_SETMANA} sessions restants</span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {SESSIONS.map((s) => {
            const IconaSessio = ICONA_SESSIO[s.tipus];
            return (
              <button
                key={s.tipus}
                className={`sessio-card ${tipus === s.tipus ? 'sel' : ''}`}
                style={{ flex: '1 1 100px', textAlign: 'center', border: undefined }}
                onClick={() => setTipus(s.tipus)}
              >
                <div style={{ display: 'flex', justifyContent: 'center' }}><IconaSessio size={22} /></div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{s.nom}</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{s.descripcio}</div>
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 10 }}>
          Instal·lacions nivell {partida.instalacions.nivell}: multiplicador d&apos;efectivitat x{multiplicador.toFixed(2)}
        </div>
        <button className="btn btn-primari btn-blok" onClick={fer} disabled={seleccionats.length === 0 || restants <= 0}>
          <Dumbbell size={18} /> Entrenar {seleccionats.length > 0 ? `(${seleccionats.length} jugadors)` : ''}
        </button>
      </div>

      <div className="card">
        <div className="card-titol"><span>Tria participants</span><span>{seleccionats.length} seleccionats</span></div>
        {actius.map((j) => (
          <label key={j.id} className="jugador-check">
            <input type="checkbox" checked={seleccionats.includes(j.id)} onChange={() => toggle(j.id)} />
            <span style={{ flex: 1 }}>{j.nom} {j.cognom} · {j.posicio} · {mitjana(j.atributs)}</span>
            <span style={{ color: j.forma < 45 ? 'var(--vermell)' : 'var(--text-dim)', fontSize: 11 }}>FOR {Math.round(j.forma)}</span>
          </label>
        ))}
      </div>
    </>
  );
}
