import { useMemo, useState } from 'react';
import { Rocket, Map as IconMap, Calendar, Wallet, TrendingUp } from 'lucide-react';
import { useJoc } from '../game/store';
import { MapaCatalunya } from './MapaCatalunya';
import { formatNomPoble, getTownPointFlexible, poblesDeComarca } from '../utils/catalunyaMap';
import { IconPilota, IconSobre } from './icones';
import fonsNovaPartida from '../assets/fons-nova-partida.webp';

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
  const [nomTocat, setNomTocat] = useState(false);
  const [comarca, setComarca] = useState<string | null>(null);
  const [poble, setPoble] = useState<string | null>(null);
  const [nivell, setNivell] = useState(50);
  const [color, setColor] = useState(0);

  const pobles = useMemo(() => (comarca ? poblesDeComarca(comarca) : []), [comarca]);
  const puntPoble = useMemo(() => (poble ? getTownPointFlexible(poble) : null), [poble]);

  const potCrear = nom.trim().length >= 2 && !!poble;

  const triarComarca = (nomComarca: string) => {
    setComarca(nomComarca);
    setPoble(null);
  };

  const triarPoble = (nomPoble: string) => {
    setPoble(nomPoble);
    if (!nomTocat) setNom(`CB ${formatNomPoble(nomPoble)}`);
  };

  const crear = () => {
    if (!potCrear || !poble) return;
    novaPartida({
      clubNom: nom.trim(),
      ciutat: poble,
      comarca: comarca ?? undefined,
      colorPrincipal: COLORS[color][0],
      colorSecundari: COLORS[color][1],
      nivell,
    });
  };

  return (
    <div className="app">
      <div
        style={{
          textAlign: 'center', padding: '48px 16px', margin: '0 0 16px', borderRadius: 16,
          backgroundImage: `linear-gradient(rgba(11,14,20,0.55), rgba(11,14,20,0.85)), url(${fonsNovaPartida})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center' }}><IconPilota size={56} /></div>
        <h1 style={{ fontSize: 24, margin: '8px 0 4px' }}>Llegendes de la Cistella</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>Converteix un club de barri en una llegenda del bàsquet català</p>
      </div>

      <div className="card">
        <div className="card-titol">
          <span>Escull el teu poble</span>
          <span>{comarca ?? 'Clica una comarca'}</span>
        </div>
        <MapaCatalunya
          comarcaSeleccionada={comarca}
          onSeleccionarComarca={triarComarca}
          marcadors={puntPoble ? [{ x: puntPoble.x, y: puntPoble.y, color: COLORS[color][0], label: formatNomPoble(poble!), mida: 5.5 }] : []}
        />
        {comarca && (
          <div className="pobles-llista">
            {pobles.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Sense pobles per aquesta comarca.</div>}
            {pobles.map((p) => (
              <button
                key={p}
                className={`btn ${poble === p ? 'btn-primari' : 'btn-secundari'}`}
                style={{ padding: '6px 10px', fontSize: 12 }}
                onClick={() => triarPoble(p)}
              >
                {formatNomPoble(p)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="form-grup">
          <label>Nom del club</label>
          <input
            className="input"
            placeholder="CB Solsona, Bàsquet Artés..."
            value={nom}
            onChange={(e) => { setNom(e.target.value); setNomTocat(true); }}
            maxLength={30}
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
          <Rocket size={16} /> Començar temporada
        </button>
        {!potCrear && (
          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-dim)', marginTop: 8 }}>
            {!poble ? 'Tria un poble al mapa i posa un nom al club per començar' : 'Posa un nom al club per començar'}
          </div>
        )}
      </div>

      <div className="card" style={{ background: 'transparent', borderStyle: 'dashed' }}>
        <div className="card-titol"><span>Com funciona</span></div>
        <ul style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.8, paddingLeft: 18 }}>
          <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}><IconMap size={16} /> Tria un poble real al mapa de Catalunya: hi tindràs rivals catalans propers</li>
          <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}><IconPilota size={16} /> Gestiona la plantilla: tria el quintet inicial i l'esquema tàctic</li>
          <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={16} /> 22 jornades de lliga contra 11 rivals, playoffs pels 6 primers i cantera pròpia</li>
          <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Wallet size={16} /> Cuida les finances: taquilla, patrocini, fitxatges, sostre salarial i millores del pavelló</li>
          <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}><IconSobre size={16} /> Obre sobres de cromos, entrena la plantilla i visita el Bar dels Pavellons</li>
          <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}><TrendingUp size={16} /> Els resultats de la teva gestió es guarden automàticament</li>
        </ul>
      </div>
    </div>
  );
}
