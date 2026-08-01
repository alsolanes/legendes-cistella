// ── Bar dels Pavellons: minijocs de sort ──────────────────────────
import { entre } from './dades';
import { EstatSalaJocs, JocSala } from './types';

export const COST_RULETA = 1500;
export const COST_RASCA = 1200;
export const COST_MEMORIA = 1000;

export function costJoc(joc: JocSala): number {
  if (joc === 'ruleta') return COST_RULETA;
  if (joc === 'rasca') return COST_RASCA;
  return COST_MEMORIA;
}

export function crearEstatSalaInicial(): EstatSalaJocs {
  return { ultimaSetmana: { ruleta: 0, rasca: 0, memoria: 0 } };
}

export function potJugar(estat: EstatSalaJocs, joc: JocSala, setmanaActual: number): boolean {
  return estat.ultimaSetmana[joc] < setmanaActual;
}

export function marcarJugat(estat: EstatSalaJocs, joc: JocSala, setmanaActual: number): EstatSalaJocs {
  return { ultimaSetmana: { ...estat.ultimaSetmana, [joc]: setmanaActual } };
}

// ── Ruleta del triple ──
export interface PremiRuleta {
  id: string;
  etiqueta: string;
  emoji: string;
  tipus: 'diners' | 'moral' | 'forma' | 'xp' | 'res';
  valor: number;
  probabilitat: number; // pes relatiu
}

export const PREMIS_RULETA: PremiRuleta[] = [
  { id: 'gran', etiqueta: 'Gran premi', emoji: '💰', tipus: 'diners', valor: 12000, probabilitat: 4 },
  { id: 'mitja', etiqueta: 'Premi', emoji: '💵', tipus: 'diners', valor: 5000, probabilitat: 14 },
  { id: 'petit', etiqueta: 'Premiet', emoji: '🪙', tipus: 'diners', valor: 2000, probabilitat: 22 },
  { id: 'moral', etiqueta: 'Moral de l\'equip', emoji: '🎉', tipus: 'moral', valor: 8, probabilitat: 18 },
  { id: 'forma', etiqueta: 'Descans extra', emoji: '💤', tipus: 'forma', valor: 6, probabilitat: 18 },
  { id: 'xp', etiqueta: 'Experiència', emoji: '⭐', tipus: 'xp', valor: 20, probabilitat: 16 },
  { id: 'res', etiqueta: 'Res, per poc!', emoji: '😅', tipus: 'res', valor: 0, probabilitat: 8 },
];

export function girarRuleta(): PremiRuleta {
  const total = PREMIS_RULETA.reduce((s, p) => s + p.probabilitat, 0);
  let r = Math.random() * total;
  for (const p of PREMIS_RULETA) {
    if (r < p.probabilitat) return p;
    r -= p.probabilitat;
  }
  return PREMIS_RULETA[PREMIS_RULETA.length - 1];
}

/** Angle final (graus) perquè la roda s'aturi damunt el premi indicat, per animar-la */
export function angleDelPremi(premi: PremiRuleta): number {
  const idx = PREMIS_RULETA.findIndex((p) => p.id === premi.id);
  const mida = 360 / PREMIS_RULETA.length;
  return idx * mida + mida / 2;
}

// ── Rasca i guanya ──
export const SIMBOLS_RASCA = ['🏀', '🧺', '🎯', '👟', '🏆', '⏱️'];

export interface ResultatRasca {
  graella: string[]; // 9 símbols
  guanya: boolean;
  premi: number;
  simbolGuanyador?: string;
}

/** Genera una graella 3x3; per fer-la guanyable de tant en tant, força 3 iguals ~30% de les vegades */
export function generarRasca(): ResultatRasca {
  const forcarVictoria = Math.random() < 0.3;
  const graella: string[] = new Array(9).fill('');
  if (forcarVictoria) {
    const simbol = SIMBOLS_RASCA[entre(0, SIMBOLS_RASCA.length - 1)];
    const linies = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    const linia = linies[entre(0, linies.length - 1)];
    for (const idx of linia) graella[idx] = simbol;
    for (let i = 0; i < 9; i++) {
      if (!graella[i]) graella[i] = SIMBOLS_RASCA[entre(0, SIMBOLS_RASCA.length - 1)];
    }
  } else {
    for (let i = 0; i < 9; i++) graella[i] = SIMBOLS_RASCA[entre(0, SIMBOLS_RASCA.length - 1)];
  }
  const resultat = comprovarRasca(graella);
  return { graella, ...resultat };
}

const LINIES_RASCA = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const PREMI_PER_SIMBOL: Record<string, number> = {
  '🏀': 1500, '🧺': 2200, '🎯': 3000, '👟': 1200, '🏆': 6000, '⏱️': 1800,
};

export function comprovarRasca(graella: string[]): { guanya: boolean; premi: number; simbolGuanyador?: string } {
  for (const [a, b, c] of LINIES_RASCA) {
    if (graella[a] && graella[a] === graella[b] && graella[b] === graella[c]) {
      return { guanya: true, premi: PREMI_PER_SIMBOL[graella[a]] ?? 1500, simbolGuanyador: graella[a] };
    }
  }
  return { guanya: false, premi: 0 };
}

// ── Memòria dels pavellons ──
export const ICONES_MEMORIA = ['🏀', '🏆', '👟', '🎯', '🧺', '⛹️', '🥇', '📣'];

/** Baralla les 16 cartes (8 parelles) */
export function barallarCartesMemoria(): string[] {
  const cartes = [...ICONES_MEMORIA, ...ICONES_MEMORIA];
  for (let i = cartes.length - 1; i > 0; i--) {
    const j = entre(0, i);
    [cartes[i], cartes[j]] = [cartes[j], cartes[i]];
  }
  return cartes;
}

/** Premi de la memòria en funció del nombre d'intents (menys intents = més diners) */
export function premiMemoria(intents: number): number {
  if (intents <= 8) return 6000;
  if (intents <= 10) return 4000;
  if (intents <= 13) return 2500;
  return 1000;
}
