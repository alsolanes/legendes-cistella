// ── Minijocs interactius durant el partit ─────────────────────────
import { entre } from './dades';
import { PartitSimulat } from './types';

export type TipusMinijoc = 'tirLliure' | 'tirTriple' | 'robatori';

export interface OcasioMinijoc {
  tipus: TipusMinijoc;
  meuLocal: boolean;
  marge: number;
  context: string; // frase per contextualitzar el moment ("últims segons", "possessió decisiva"...)
}

const CONTEXTOS_AJUSTAT = ['Final igualat!', 'Últims segons del partit!', 'Possessió decisiva!'];
const CONTEXTOS_NORMAL = ['Moment clau del partit', 'El públic conté la respiració', 'Ocasió per estirar el marcador'];

/** Decideix si, després de simular la jornada, apareix un minijoc pel partit de l'usuari.
 * Més probable com més ajustat sigui el resultat (moments clau). */
export function decidirOcasioMinijoc(partit: PartitSimulat, clubNom: string): OcasioMinijoc | null {
  const esLocal = partit.local === clubNom;
  const esVisitant = partit.visitant === clubNom;
  if (!esLocal && !esVisitant) return null;
  const marge = Math.abs(partit.puntsLocal - partit.puntsVisitant);

  let probabilitat: number;
  if (marge <= 4) probabilitat = 0.95;
  else if (marge <= 10) probabilitat = 0.55;
  else probabilitat = 0.2;

  if (Math.random() > probabilitat) return null;

  const tipus: TipusMinijoc = aleatoriTipus();
  const context = marge <= 4 ? CONTEXTOS_AJUSTAT[entre(0, CONTEXTOS_AJUSTAT.length - 1)] : CONTEXTOS_NORMAL[entre(0, CONTEXTOS_NORMAL.length - 1)];
  return { tipus, meuLocal: esLocal, marge, context };
}

function aleatoriTipus(): TipusMinijoc {
  const r = Math.random();
  if (r < 0.4) return 'tirLliure';
  if (r < 0.75) return 'tirTriple';
  return 'robatori';
}

/** Bonus de punts (per l'equip de l'usuari) si l'usuari té èxit al minijoc */
export function bonusPerMinijoc(tipus: TipusMinijoc, encerts: number): number {
  if (tipus === 'tirLliure') return encerts; // 0, 1 o 2 tirs lliures
  if (tipus === 'tirTriple') return encerts > 0 ? 3 : 0;
  return encerts > 0 ? 2 : 0; // robatori -> cistella ràpida
}

// ── Tir lliure / tir de tres: barra de potència ──
/** Genera la zona verda (òptima) d'una barra 0-100. Dificultat: com més alta, més estreta. */
export function generarZonaOptima(dificultat: number): [number, number] {
  const amplada = Math.max(10, 26 - dificultat * 1.4);
  const centre = entre(35, 65);
  return [Math.max(0, centre - amplada / 2), Math.min(100, centre + amplada / 2)];
}

export function avaluarParada(posicio: number, zona: [number, number]): boolean {
  return posicio >= zona[0] && posicio <= zona[1];
}

// ── Robatori: finestra de reacció ──
export function generarFinestraRobatori(dificultat: number): number {
  return Math.max(220, 620 - dificultat * 20); // ms disponibles per clicar
}

export function avaluarRobatori(tempsReaccioMs: number, finestraMs: number): boolean {
  return tempsReaccioMs >= 0 && tempsReaccioMs <= finestraMs;
}
