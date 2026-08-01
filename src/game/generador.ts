// ── Generació de jugadors, plantilles i rivals ────────────────
import { Atributs, Jugador, Posicio, Rival } from './types';
import { aleatori, entre, nomAleatori, POBLES, NOMS_RIVALS, CIUTATS_RIVALS } from './dades';

let seq = 0;
function uid(prefix: string): string {
  seq += 1;
  return `${prefix}-${Date.now().toString(36)}-${seq}`;
}

export function mitjana(atributs: Atributs): number {
  return Math.round((atributs.anotacio + atributs.triple + atributs.defensa + atributs.rebot + atributs.velocitat + atributs.resistencia) / 6);
}

export function estrellesDe(atributs: Atributs): number {
  const m = mitjana(atributs);
  if (m >= 82) return 5;
  if (m >= 74) return 4;
  if (m >= 66) return 3;
  if (m >= 58) return 2;
  return 1;
}

/** Genera atributs per un nivell de força 0-99 (0 = molt fluix, 99 = estrella) */
export function atributsPerNivell(nivell: number, posicio: Posicio, edat: number): Atributs {
  const base = Math.max(35, Math.min(92, nivell + entre(-6, 6)));
  const jove = Math.max(0, 25 - edat) * 0.4; // els joves tenen menys pic
  const vetera = Math.max(0, edat - 30) * 0.8; // els veterans perden pic
  const matis = jove + vetera;

  // Perfil per posició
  const perfils: Record<Posicio, Partial<Atributs>> = {
    Base: { triple: 0.9, velocitat: 1.0, anotacio: 0.75, defensa: 0.8, rebot: 0.4, resistencia: 0.85 },
    Escorta: { triple: 1.0, anotacio: 0.95, velocitat: 0.9, defensa: 0.85, rebot: 0.5, resistencia: 0.9 },
    Aler: { anotacio: 0.95, triple: 0.8, defensa: 0.9, rebot: 0.75, velocitat: 0.85, resistencia: 0.8 },
    'Ala-pivot': { rebot: 1.0, anotacio: 0.85, defensa: 0.95, velocitat: 0.6, triple: 0.45, resistencia: 0.75 },
    Pivot: { rebot: 1.1, anotacio: 0.9, defensa: 0.95, triple: 0.2, velocitat: 0.5, resistencia: 0.7 },
  };
  const p = perfils[posicio];

  const clamp = (v: number) => Math.max(30, Math.min(97, Math.round(v)));
  return {
    anotacio: clamp(base * (p.anotacio ?? 0.8) + entre(-4, 4) - matis),
    triple: clamp(base * (p.triple ?? 0.5) + entre(-4, 4) - matis),
    defensa: clamp(base * (p.defensa ?? 0.8) + entre(-4, 4)),
    rebot: clamp(base * (p.rebot ?? 0.5) + entre(-4, 4)),
    velocitat: clamp(base * (p.velocitat ?? 0.7) + entre(-4, 4) - matis),
    resistencia: clamp(base * (p.resistencia ?? 0.75) + entre(-4, 4)),
  };
}

export function generarJugador(nivell: number, posicio?: Posicio): Jugador {
  const pos: Posicio = posicio ?? (['Base', 'Escorta', 'Aler', 'Ala-pivot', 'Pivot'] as Posicio[])[entre(0, 4)];
  const edat = entre(18, 34);
  const atributs = atributsPerNivell(nivell, pos, edat);
  const [nom, cognom] = nomAleatori().split(' ');
  return {
    id: uid('j'),
    nom,
    cognom,
    posicio: pos,
    edat,
    nacionalitat: Math.random() < 0.75 ? 'Catalunya' : aleatori(['Espanya', 'Estats Units', 'Sèrbia', 'Croàcia', 'Lituània', 'Montenegro', 'Argentina', 'França']),
    atributs,
    forma: entre(62, 88),
    moral: entre(55, 85),
    sou: Math.round(mitjana(atributs) * 1400 + entre(-5000, 12000)),
    contracteAnys: entre(1, 3),
    estrelles: estrellesDe(atributs),
    estat: 'actiu',
    lesioSetmanes: 0,
    sancionSetmanes: 0,
    minutsJugats: 0,
    punts: 0,
    rebots: 0,
    assistencies: 0,
  };
}

export function plantillaInicial(nivellGeneral: number): Jugador[] {
  // 12 jugadors: 3 Bases, 3 Escortes, 2 Alers, 2 Ala-pivots, 2 Pivots
  const distrib: Posicio[] = ['Base', 'Base', 'Base', 'Escorta', 'Escorta', 'Escorta', 'Aler', 'Aler', 'Ala-pivot', 'Ala-pivot', 'Pivot', 'Pivot'];
  return distrib.map((p, i) => {
    // 2 estrelles (les dues primeres), la resta repartides al voltant del nivell general
    const nivell = i < 2 ? nivellGeneral + 8 : nivellGeneral + entre(-6, 6);
    return generarJugador(Math.max(40, Math.min(88, nivell)), p);
  });
}

export function generarRival(nom: string, nivell: number, ciutat?: string): Rival {
  const distrib: Posicio[] = ['Base', 'Base', 'Escorta', 'Escorta', 'Aler', 'Aler', 'Ala-pivot', 'Pivot', 'Base', 'Escorta', 'Aler', 'Pivot'];
  const plantilla = distrib.map((p) => generarJugador(Math.max(40, Math.min(90, nivell + entre(-7, 7))), p));
  const colors = [
    ['#c8102e', '#1a1a2e'], ['#0057b7', '#ffd700'], ['#006b3f', '#000000'], ['#f05e23', '#231f20'],
    ['#7c2d92', '#f2c014'], ['#00a3e0', '#003da5'], ['#e63946', '#1d3557'], ['#2a9d8f', '#264653'],
    ['#9b2226', '#e9d8a6'], ['#0077b6', '#00b4d8'], ['#6d597a', '#b56576'], ['#355070', '#eaac8b'],
    ['#3a0ca3', '#f72585'], ['#0f4c5c', '#e36414'], ['#386641', '#a7c957'], ['#5f0f40', '#fb8b24'],
  ];
  const [prim, sec] = colors[Math.floor(Math.random() * colors.length)];
  return {
    id: uid('r'),
    nom,
    ciutat: ciutat ?? aleatori(CIUTATS_RIVALS),
    color: prim,
    colorSecundari: sec,
    nivell,
    plantilla,
  };
}

export function crearRivalsLliga(_nomPoble: string, _nivellClub: number): Rival[] {
  // 11 rivals amb nivells ABSOLUTS (no relatius al club):
  //   - 3 catalans: comarca, fluixos (42-62)
  //   - 2 favorits de la lliga: forts de veritat (72-92)
  //   - 6 mitjans: 45-70
  // Així un club de nivell 85 és el favorit clar i un de 40 lluita per sobreviure.
  const rivals: Rival[] = [];
  const usades = new Set<string>([_nomPoble]);
  for (let i = 0; i < 3; i++) {
    let ciutat = aleatori(POBLES);
    while (usades.has(ciutat)) ciutat = aleatori(POBLES);
    usades.add(ciutat);
    rivals.push(generarRival(`${ciutat} CB`, entre(42, 62), ciutat));
  }
  const favorits = [CIUTATS_RIVALS[0], CIUTATS_RIVALS[1]];
  for (let i = 0; i < 2; i++) {
    rivals.push(generarRival(`${aleatori(NOMS_RIVALS)} de ${favorits[i]}`, entre(72, 92), favorits[i]));
  }
  for (let i = 2; i < 8; i++) {
    const ciutat = CIUTATS_RIVALS[i];
    rivals.push(generarRival(`${aleatori(NOMS_RIVALS)} de ${ciutat}`, entre(45, 70), ciutat));
  }
  return rivals;
}
