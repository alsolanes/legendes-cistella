// ── Col·lecció de cromos ─────────────────────────────────────────
import { ColleccioCromos, Cromo, Jugador, Rival } from './types';
import { aleatori, entre, NOMS_RIVALS } from './dades';
import { mitjana } from './generador';

export const PREU_SOBRE = 4500;
export const CROMOS_PER_SOBRE = 5;

export function raresaDe(m: number): Cromo['rareza'] {
  if (m >= 84) return 'llegendari';
  if (m >= 74) return 'èpic';
  if (m >= 64) return 'rar';
  return 'comú';
}

export function cromoDeJugador(j: Jugador): Cromo {
  const m = mitjana(j.atributs);
  return {
    id: j.id,
    nom: j.nom,
    cognom: j.cognom,
    posicio: j.posicio,
    rareza: raresaDe(m),
    mitjana: m,
    especial: false,
    avatar: j.avatar,
  };
}

export function cromoEspecialDe(rival: Rival): Cromo {
  const estrella = [...rival.plantilla].sort((a, b) => mitjana(b.atributs) - mitjana(a.atributs))[0];
  const m = mitjana(estrella.atributs);
  return {
    id: `especial-${rival.id}-${estrella.id}`,
    nom: estrella.nom,
    cognom: estrella.cognom,
    posicio: estrella.posicio,
    rareza: m >= 80 ? 'llegendari' : 'èpic',
    mitjana: m,
    especial: true,
    clubOrigen: rival.nom,
    avatar: estrella.avatar,
  };
}

/** Genera un sobre de CROMOS_PER_SOBRE cromos: majoritàriament de la teva plantilla, amb petita
 * probabilitat de cromo especial d'un rival famós. Permet repetits (com un sobre real). */
export function generarSobre(plantilla: Jugador[], rivals: Rival[]): Cromo[] {
  const sobre: Cromo[] = [];
  for (let i = 0; i < CROMOS_PER_SOBRE; i++) {
    if (rivals.length > 0 && Math.random() < 0.12) {
      sobre.push(cromoEspecialDe(aleatori(rivals)));
    } else {
      sobre.push(cromoDeJugador(aleatori(plantilla)));
    }
  }
  return sobre;
}

export function crearColleccioInicial(): ColleccioCromos {
  return { posseits: {}, sobresOberts: 0 };
}

export function afegirCromosAColleccio(col: ColleccioCromos, cromos: Cromo[]): ColleccioCromos {
  const posseits = { ...col.posseits };
  for (const c of cromos) posseits[c.id] = (posseits[c.id] ?? 0) + 1;
  return { posseits, sobresOberts: col.sobresOberts + 1 };
}

/** Nombre de cromos únics diferents que té el jugador */
export function cromosUnics(col: ColleccioCromos): number {
  return Object.keys(col.posseits).length;
}

/** Total de cromos possibles a l'àlbum actual (plantilla pròpia + un cromo especial per rival) */
export function totalColleccionable(plantilla: Jugador[], rivals: Rival[]): number {
  return plantilla.length + rivals.length;
}

export function colleccioCompleta(col: ColleccioCromos, plantilla: Jugador[], rivals: Rival[]): boolean {
  return cromosUnics(col) >= totalColleccionable(plantilla, rivals);
}

export function nomAleatoriRival(): string {
  return aleatori(NOMS_RIVALS);
}

export function xpAleatoriaSobre(): number {
  return entre(5, 15);
}
