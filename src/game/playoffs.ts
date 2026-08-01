// ── Playoffs de lliga: top 6, bracket eliminatori a partit únic ──
import { EnfrontamentPlayoff, EstatPlayoffs, NomRondaPlayoff, Partida, PartitSimulat } from './types';
import { EquipPartit, aplicarResultat, simularPartit } from './motor';

/** Genera el quadre de playoffs si l'usuari s'ha classificat entre els 6 primers */
export function generarPlayoffs(partida: Partida): EstatPlayoffs | null {
  const top6 = partida.classificacio.slice(0, 6).map((f) => f.equipId);
  if (!top6.includes('meu')) return null;
  const [, , s3, s4, s5, s6] = top6;
  const eliminatoria: EnfrontamentPlayoff[] = [
    { ronda: 'quarts', local: s3, visitant: s6, jugat: false },
    { ronda: 'quarts', local: s4, visitant: s5, jugat: false },
  ];
  return { classificats: top6, eliminatoria, rondaActual: 'quarts', meuEliminat: false, campio: null };
}

function nomEquip(partida: Partida, equipId: string): string {
  if (equipId === 'meu') return partida.clubNom;
  return partida.rivals.find((r) => r.id === equipId)?.nom ?? equipId;
}

function equipPartitDe(partida: Partida, equipId: string): EquipPartit {
  if (equipId === 'meu') {
    return {
      id: 'meu',
      nom: partida.clubNom,
      jugadors: partida.plantilla,
      titulars: partida.alineacio.titulars,
      esquema: partida.alineacio.esquema,
      pressing: partida.alineacio.defensaPressing,
    };
  }
  const rival = partida.rivals.find((r) => r.id === equipId)!;
  return {
    id: rival.id,
    nom: rival.nom,
    jugadors: rival.plantilla,
    titulars: rival.plantilla.slice(0, 5).map((j) => j.id),
    esquema: 'clasica',
    pressing: false,
  };
}

function guanyadorId(enf: EnfrontamentPlayoff): string {
  return (enf.puntsLocal ?? 0) > (enf.puntsVisitant ?? 0) ? enf.local : enf.visitant;
}

export interface ResultatPlayoff {
  partits: PartitSimulat[];
  meuPartit: PartitSimulat | null;
  meuGuanya: boolean | null;
}

const NOM_RONDA: Record<NomRondaPlayoff, string> = { quarts: 'Quarts de final', semis: 'Semifinals', final: 'Final', acabats: 'Acabats' };

/** Juga tots els partits de la ronda actual dels playoffs i avança a la següent (o corona el campió) */
export function jugarRondaPlayoffs(partida: Partida, jornadaBase: number): { partida: Partida; resultat: ResultatPlayoff } {
  const p = structuredClone(partida) as Partida;
  const estat = p.playoffs;
  if (!estat || estat.rondaActual === 'acabats') throw new Error('No hi ha playoffs actius');

  const pendents = estat.eliminatoria.filter((e) => e.ronda === estat.rondaActual && !e.jugat);
  const partits: PartitSimulat[] = [];
  let meuPartit: PartitSimulat | null = null;
  let meuGuanya: boolean | null = null;

  for (const enf of pendents) {
    const local = equipPartitDe(p, enf.local);
    const visitant = equipPartitDe(p, enf.visitant);
    const sim = simularPartit(local, visitant, jornadaBase);
    enf.puntsLocal = sim.puntsLocal;
    enf.puntsVisitant = sim.puntsVisitant;
    enf.jugat = true;
    partits.push(sim);

    if (enf.local === 'meu' || enf.visitant === 'meu') {
      aplicarResultat(p.plantilla, sim, enf.local === 'meu');
      meuPartit = sim;
      meuGuanya = guanyadorId(enf) === 'meu';
      if (!meuGuanya) estat.meuEliminat = true;
    }
  }

  // Avancem de ronda si tots els partits de la ronda actual estan jugats
  const totsJugats = estat.eliminatoria.filter((e) => e.ronda === estat.rondaActual).every((e) => e.jugat);
  if (totsJugats) {
    if (estat.rondaActual === 'quarts') {
      const q = estat.eliminatoria.filter((e) => e.ronda === 'quarts');
      const guanyadorQ1 = guanyadorId(q[0]);
      const guanyadorQ2 = guanyadorId(q[1]);
      const [s1, s2] = estat.classificats;
      estat.eliminatoria.push(
        { ronda: 'semis', local: s1, visitant: guanyadorQ1, jugat: false },
        { ronda: 'semis', local: s2, visitant: guanyadorQ2, jugat: false },
      );
      estat.rondaActual = 'semis';
    } else if (estat.rondaActual === 'semis') {
      const s = estat.eliminatoria.filter((e) => e.ronda === 'semis');
      const finalistes = [guanyadorId(s[0]), guanyadorId(s[1])];
      estat.eliminatoria.push({ ronda: 'final', local: finalistes[0], visitant: finalistes[1], jugat: false });
      estat.rondaActual = 'final';
    } else if (estat.rondaActual === 'final') {
      const f = estat.eliminatoria.find((e) => e.ronda === 'final')!;
      estat.campio = guanyadorId(f);
      estat.rondaActual = 'acabats';
    }
  }

  return { partida: p, resultat: { partits, meuPartit, meuGuanya } };
}

export function nomRonda(ronda: NomRondaPlayoff): string {
  return NOM_RONDA[ronda];
}

export function nomEquipPlayoff(partida: Partida, equipId: string): string {
  return nomEquip(partida, equipId);
}
