import { useState } from 'react';
import { useJoc } from '../game/store';
import { aleatori, POBLES } from '../game/dades';

const COLORS = [
  ['#ff8c42', '#b83a1e'],
  ['#5aa9ff', '#1e4fa8'],
  ['#3ddc97', '#0f6e4f'],
  ['#ffd166', '#b8860b'],
  ['#ff5d73', '#a11b34'],
  ['#c77dff', '#5a189a'],
  ['#0d9488', '#134e4a'],
  ['#f472b6', '#9d174d'],
];

export function NovaPartida() {
  const novaPartida = useJoc((s) => s.novaPartida);
  const [nom, setNom] = useState('');
  const [ciutat, setCiutat] = useState(aleatori(POBLES));
  const [nivell, setNivell] = useState(50);
  const [color, setColor] = useState(0);

  const potCrear = nom.trim().length >= 2;

  const crear = () => {
    if (!potCrear) return;
    novaPartida({
      clubNom: nom.trim(),
      ciutat,
      colorPrincipal: COLORS[color][0],
      colorSecundari: COLORS[color][1],
      nivell,
    });
  };

  return (
    <div className="app">
      <div style={{ textAlign: 'center', padding: '40px 0 20px' }}>
        <div style={{ fontSize: 56 }}>🏀</div>
        <h1 style={{ fontSize: 24, margin: '8px 0 4px' }}>Llegendes de la Cistella</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>Converteix un club de barri en una llegenda del bàsquet català</p>
      </div>

      <div className="card">
        <div className="form-grup">
          <label>Nom del club</label>
          <input
            className="input"
            placeholder="CB Solsona, Bàsquet Artés..."
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            maxLength={30}
          />
        </div>

        <div className="form-grup">
          <label>Ciutat / Poble</label>
          <input
            className="input"
            value={ciutat}
            onChange={(e) => setCiutat(e.target.value)}
            maxLength={24}
          />
        </div>

        <div className="form-grup">
          <label>Nivell del club: <strong style={{ color: 'var(--taronja)' }}>{nivell}</strong></label>
          <input
            type="range"
            className="llisca"
            min={30}
            max={85}
            value={nivell}
            onChange={(e) => setNivell(Number(e.target.value))}
          />
          <div className="nivell-hint">
            <span>Humil · 30</span>
            <span>Mitjà · 55</span>
            <span>Favorit · 85</span>
          </div>
        </div>

        <div className="form-grup">
          <label>Colors del club</label>
          <div className="colors-row">
            {COLORS.map(([a, b], i) => (
              <button
                key={i}
                className={`color-swatch ${i === color ? 'sel' : ''}`}
                style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
                onClick={() => setColor(i)}
                aria-label={`Color ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <button className="btn btn-primari btn-blok" style={{ marginTop: 8 }} disabled={!potCrear} onClick={crear} >
          🚀 Començar temporada
        </button>
        {!potCrear && (
          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-dim)', marginTop: 8 }}>
            Posa un nom al club per començar
          </div>
        )}
      </div>

      <div className="card" style={{ background: 'transparent', borderStyle: 'dashed' }}>
        <div className="card-titol"><span>Com funciona</span></div>
        <ul style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.8, paddingLeft: 18 }}>
          <li>🏀 Gestiona la plantilla: tria el quintet inicial i l'esquema tàctic</li>
          <li>📅 22 jornades de lliga contra 11 rivals (catalans i de la resta de l'estat)</li>
          <li>💰 Cuida les finances: taquilla, patrocini, fitxatges i millores del pavelló</li>
          <li>⭐ Cada jugador té 6 atributs, forma i moral que canvien amb els resultats</li>
          <li>📈 Els resultats de la teva gestió es guarden automàticament</li>
        </ul>
      </div>
    </div>
  );
}
