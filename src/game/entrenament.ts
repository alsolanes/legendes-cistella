// ── Entrenament setmanal ──────────────────────────────────────────
import { Atributs, Jugador, TipusSessio } from './types';
import { entre } from './dades';

export const SESSIONS_PER_SETMANA = 2;
export const COST_FORMA = 6; // cost d'energia (forma) per participar en una sessió

export interface SessioInfo {
  tipus: TipusSessio;
  nom: string;
  descripcio: string;
  atributs: Array<keyof Atributs>;
}

export const SESSIONS: SessioInfo[] = [
  { tipus: 'tir', nom: 'Tir', descripcio: 'Millora l\'anotació i el triple.', atributs: ['anotacio', 'triple'] },
  { tipus: 'defensa', nom: 'Defensa', descripcio: 'Millora la defensa i els rebots.', atributs: ['defensa', 'rebot'] },
  { tipus: 'fisic', nom: 'Físic', descripcio: 'Millora la velocitat i la resistència.', atributs: ['velocitat', 'resistencia'] },
  { tipus: 'tactic', nom: 'Tàctic', descripcio: 'Millora una mica de tot: la intel·ligència de joc.', atributs: ['anotacio', 'defensa', 'velocitat'] },
];

export function infoSessio(tipus: TipusSessio): SessioInfo {
  return SESSIONS.find((s) => s.tipus === tipus)!;
}

/** Aplica una sessió d'entrenament als jugadors participants: petita millora d'atributs,
 * cost d'energia (forma). Jugadors amb forma massa baixa milloren menys (van cansats). */
export function aplicarEntrenament(plantilla: Jugador[], tipus: TipusSessio, participantIds: string[], multiplicador = 1): Jugador[] {
  const info = infoSessio(tipus);
  return plantilla.map((j) => {
    if (!participantIds.includes(j.id)) return j;
    if (j.estat !== 'actiu') return j;
    const cansament = j.forma < 40 ? 0.4 : 1;
    const nousAtributs = { ...j.atributs };
    for (const atr of info.atributs) {
      const guany = ((entre(1, 3) * cansament) / info.atributs.length + 0.3) * multiplicador;
      nousAtributs[atr] = Math.min(99, Math.round(nousAtributs[atr] + guany));
    }
    return {
      ...j,
      atributs: nousAtributs,
      forma: Math.max(20, j.forma - COST_FORMA),
    };
  });
}
