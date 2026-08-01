// ── Llegat de l'entrenador: XP, nivells i perks ──────────────────
import { Jugador, Llegat, LlegendaJugador, MillorTemporada, Posicio, Titol } from './types';
import { mitjana } from './generador';

export const XP_PERDRE = 10;
export const XP_JUGAR_BE = 25;
export const XP_GUANYAR = 50;
export const XP_TITOL = 200;

export interface Perk {
  id: string;
  nivell: number;
  nom: string;
  descripcio: string;
  emoji: string;
}

export const PERKS: Perk[] = [
  { id: 'ojeador', nivell: 2, nom: 'Ojeador', descripcio: 'Veus el potencial amagat dels jugadors del mercat i la cantera.', emoji: '🔎' },
  { id: 'negociador', nivell: 5, nom: 'Negociador', descripcio: 'Fitxatges i renovacions un 10% més barats.', emoji: '🤝' },
  { id: 'tactic', nivell: 10, nom: 'Tàctic', descripcio: 'Desbloqueja l\'esquema "Zona 2-3" (defensa zonal).', emoji: '📐' },
  { id: 'llegenda-viva', nivell: 15, nom: 'Llegenda viva', descripcio: 'El públic omple el pavelló: taquilla +20%.', emoji: '🌟' },
  { id: 'immortal', nivell: 20, nom: 'Immortal', descripcio: 'Els jugadors es lesionen menys.', emoji: '🛡️' },
];

/** XP acumulada necessària per assolir un nivell donat (corba creixent suau) */
export function xpPerNivell(nivell: number): number {
  return Math.round(100 * nivell * (1 + nivell * 0.12));
}

export function nivellPerXp(xp: number): number {
  let nivell = 1;
  while (xp >= xpPerNivell(nivell + 1)) nivell++;
  return nivell;
}

export function xpPerSeguentNivell(nivellActual: number): number {
  return xpPerNivell(nivellActual + 1);
}

export function perksDelNivell(nivell: number): Perk[] {
  return PERKS.filter((p) => p.nivell <= nivell);
}

export function tePerk(llegat: Llegat, perkId: string): boolean {
  return llegat.perks.includes(perkId);
}

export function crearLlegatInicial(): Llegat {
  return { xp: 0, nivell: 1, perks: [], titols: [], millorsTemporades: [], llegendes: [] };
}

/** Afegeix XP i retorna el llegat actualitzat + els perks nous desbloquejats en aquest pas */
export function afegirXp(llegat: Llegat, quantitat: number): { llegat: Llegat; perksNous: Perk[] } {
  const xp = llegat.xp + quantitat;
  const nivell = nivellPerXp(xp);
  const perksActius = perksDelNivell(nivell).map((p) => p.id);
  const perksNous = PERKS.filter((p) => perksActius.includes(p.id) && !llegat.perks.includes(p.id));
  return {
    llegat: { ...llegat, xp, nivell, perks: perksActius },
    perksNous,
  };
}

export function afegirTitol(llegat: Llegat, titol: Titol): Llegat {
  return { ...llegat, titols: [...llegat.titols, titol] };
}

/** Registra una temporada acabada (posició + victòries) al palmarès */
export function registrarTemporada(llegat: Llegat, temporada: MillorTemporada): Llegat {
  const millorsTemporades = [...llegat.millorsTemporades, temporada]
    .sort((a, b) => a.posicio - b.posicio || b.victories - a.victories)
    .slice(0, 10);
  return { ...llegat, millorsTemporades };
}

/** Captura els millors jugadors de la plantilla al tancament de temporada per l'equip ideal històric */
export function capturarLlegendes(llegat: Llegat, plantilla: Jugador[], temporada: number): Llegat {
  const candidats: LlegendaJugador[] = plantilla
    .filter((j) => j.punts > 0 || j.minutsJugats > 0)
    .map((j) => ({
      nom: j.nom,
      cognom: j.cognom,
      posicio: j.posicio,
      temporada,
      punts: j.punts,
      rebots: j.rebots,
      assistencies: j.assistencies,
      mitjanaAtributs: mitjana(j.atributs),
    }));
  const totes = [...llegat.llegendes, ...candidats];
  return { ...llegat, llegendes: totes };
}

function puntuacioLlegenda(l: LlegendaJugador): number {
  return l.punts + l.rebots * 1.2 + l.assistencies * 1.5 + l.mitjanaAtributs * 4;
}

/** Els 5 millors jugadors de tota la història del club, un per posició quan és possible */
export function equipIdealHistoric(llegat: Llegat): LlegendaJugador[] {
  if (llegat.llegendes.length === 0) return [];
  const ordenats = [...llegat.llegendes].sort((a, b) => puntuacioLlegenda(b) - puntuacioLlegenda(a));
  const posicions: Posicio[] = ['Base', 'Escorta', 'Aler', 'Ala-pivot', 'Pivot'];
  const equip: LlegendaJugador[] = [];
  for (const pos of posicions) {
    const millor = ordenats.find((l) => l.posicio === pos && !equip.includes(l));
    if (millor) equip.push(millor);
  }
  for (const l of ordenats) {
    if (equip.length >= 5) break;
    if (!equip.includes(l)) equip.push(l);
  }
  return equip.slice(0, 5);
}
