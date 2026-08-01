import { useEffect, useMemo, useState } from 'react';
import { useJoc } from '../game/store';

const COLORS_CONFETTI = ['#ff8c42', '#5aa9ff', '#3ddc97', '#ffd166', '#ff5d73', '#c77dff'];

interface Peca {
  id: number;
  left: number;
  delay: number;
  durada: number;
  color: string;
  rotacio: number;
  mida: number;
}

function generarPeces(n: number): Peca[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.4,
    durada: 2.2 + Math.random() * 1.6,
    color: COLORS_CONFETTI[i % COLORS_CONFETTI.length],
    rotacio: Math.random() * 360,
    mida: 6 + Math.random() * 6,
  }));
}

const MISSATGES: Record<string, { titol: string; emoji: string }> = {
  victoria: { titol: 'Victòria!', emoji: '🎉' },
  titol: { titol: 'Campions de lliga!', emoji: '🏆' },
  campio: { titol: 'Campions dels Playoffs!', emoji: '🏆' },
};

export function Celebracio() {
  const celebracio = useJoc((s) => s.celebracio);
  const set = useJoc.setState;
  const peces = useMemo(() => generarPeces(celebracio ? (celebracio === 'victoria' ? 40 : 90) : 0), [celebracio]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!celebracio) return;
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      set({ celebracio: null });
    }, celebracio === 'victoria' ? 2200 : 3600);
    return () => clearTimeout(t);
  }, [celebracio, set]);

  if (!celebracio || !visible) return null;
  const info = MISSATGES[celebracio];

  return (
    <div className="confetti-capa" aria-hidden>
      {peces.map((p) => (
        <span
          key={p.id}
          className="confetti-peca"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.durada}s`,
            background: p.color,
            width: p.mida,
            height: p.mida * 1.6,
            transform: `rotate(${p.rotacio}deg)`,
          }}
        />
      ))}
      {info && (
        <div className="celebracio-missatge">
          <span className="celebracio-emoji">{info.emoji}</span>
          <span>{info.titol}</span>
        </div>
      )}
    </div>
  );
}
