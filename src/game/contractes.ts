// ── Contractes, salary cap i química d'equip ──────────────────────
import { Jugador, Llegat, Partida } from './types';
import { entre } from './dades';
import { mitjana } from './generador';
import { tePerk } from './llegat';

/** Sostre salarial orientatiu: creix amb el nivell del pavelló i la mitjana de la plantilla */
export function calcularSalaryCap(partida: Partida): number {
  const mitjanaEquip = partida.plantilla.reduce((s, j) => s + mitjana(j.atributs), 0) / Math.max(1, partida.plantilla.length);
  return Math.round(mitjanaEquip * 22000 + partida.pavello.nivell * 150000);
}

export function massaSalarialTotal(partida: Partida): number {
  return partida.plantilla.reduce((s, j) => s + j.sou, 0);
}

/** Impost de luxe setmanal si la massa salarial supera el sostre (percentatge de l'excés) */
export function calcularLuxuryTaxSetmanal(partida: Partida): number {
  const cap = calcularSalaryCap(partida);
  const massa = massaSalarialTotal(partida);
  if (massa <= cap) return 0;
  const excés = massa - cap;
  return Math.round((excés * 0.5) / 22); // repartit per jornada, 50% de penalització sobre l'excés
}

/** Probabilitat que un jugador accepti renovar (0-1): més alta amb moral alta, club fort i
 * pocs anys de contracte restants; més baixa com més estrella és el jugador i més humil el club */
export function probabilitatRenovacio(jugador: Jugador, partida: Partida): number {
  const nivellClub = partida.pavello.nivell; // 1-5
  const ambicio = mitjana(jugador.atributs) / 100; // 0-1, més estrella = més exigent
  const base = 0.55 + (jugador.moral - 50) / 200 + (nivellClub - 3) * 0.05 - ambicio * 0.25;
  return Math.max(0.1, Math.min(0.95, base));
}

/** Tira els daus per veure si el jugador accepta renovar */
export function intentaRenovacio(jugador: Jugador, partida: Partida): boolean {
  return Math.random() < probabilitatRenovacio(jugador, partida);
}

/** Descompte del perk Negociador sobre un cost de fitxatge/renovació */
export function aplicarDescompteNegociador(cost: number, llegat: Llegat): number {
  return tePerk(llegat, 'negociador') ? Math.round(cost * 0.9) : cost;
}

/** Química de vestidor (0-100): puja amb moral alta i homogènia, baixa amb massa fitxatges recents */
export function calcularQuimica(partida: Partida): number {
  const morals = partida.plantilla.map((j) => j.moral);
  if (morals.length === 0) return 50;
  const mitjanaMoral = morals.reduce((s, m) => s + m, 0) / morals.length;
  const variancia = morals.reduce((s, m) => s + Math.abs(m - mitjanaMoral), 0) / morals.length;
  const nouVinguts = partida.plantilla.filter((j) => j.preuFitxatge !== undefined).length;
  const quimica = mitjanaMoral - variancia * 0.4 - nouVinguts * 1.5;
  return Math.max(0, Math.min(100, Math.round(quimica)));
}

/** Genera un agent lliure (jugador sense club) a partir d'un jugador que no ha renovat */
export function convertirEnAgentLliure(jugador: Jugador): Jugador {
  return {
    ...jugador,
    sou: Math.round(jugador.sou * (0.75 + Math.random() * 0.2)),
    contracteAnys: entre(1, 3),
    preuFitxatge: 0,
  };
}
