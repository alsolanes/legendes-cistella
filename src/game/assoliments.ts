// ── Assoliments i trofeus ──────────────────────────────────────────
import { Partida } from './types';
import { colleccioCompleta } from './cromos';

export interface Assoliment {
  id: string;
  nom: string;
  descripcio: string;
  comprovar: (p: Partida) => boolean;
}

export const ASSOLIMENTS: Assoliment[] = [
  {
    id: 'primera-victoria',
    nom: 'Primera victòria',
    descripcio: 'Guanya el teu primer partit de lliga.',
    comprovar: (p) => (p.classificacio.find((f) => f.equipId === 'meu')?.guanyats ?? 0) >= 1,
  },
  {
    id: 'racha-10',
    nom: 'Ratxa imparable',
    descripcio: 'Encadena 10 victòries seguides.',
    comprovar: (p) => p.rachaVictories >= 10,
  },
  {
    id: 'triple-decisiu',
    nom: 'Fred com el gel',
    descripcio: 'Anota un triple a l\'últim minut que decideix el partit.',
    comprovar: (p) => {
      const ultim = p.darrersPartits[p.darrersPartits.length - 1];
      if (!ultim) return false;
      const marge = Math.abs(ultim.puntsLocal - ultim.puntsVisitant);
      if (marge > 3) return false;
      const esMeu = ultim.local === p.clubNom || ultim.visitant === p.clubNom;
      if (!esMeu) return false;
      return ultim.events.some((e) => e.tipus === 'triple' && e.minut >= 38 && ((e.equip === 'local') === (ultim.local === p.clubNom)));
    },
  },
  {
    id: 'campio-lliga',
    nom: 'Campions!',
    descripcio: 'Guanya la Lliga LEB Or.',
    comprovar: (p) => p.història.some((h) => h.posicio === 1),
  },
  {
    id: 'playoffs',
    nom: 'A dalt de tot',
    descripcio: 'Acaba una temporada entre els 6 primers.',
    comprovar: (p) => p.història.some((h) => h.posicio <= 6),
  },
  {
    id: 'album-complet',
    nom: 'Col·leccionista',
    descripcio: 'Completa l\'àlbum de cromos.',
    comprovar: (p) => colleccioCompleta(p.cromos, p.plantilla, p.rivals),
  },
  {
    id: 'primer-sobre',
    nom: 'Sobre estrenat',
    descripcio: 'Obre el teu primer sobre de cromos.',
    comprovar: (p) => p.cromos.sobresOberts >= 1,
  },
  {
    id: 'primer-fitxatge',
    nom: 'Nou fitxatge',
    descripcio: 'Fitxa el teu primer jugador del mercat.',
    comprovar: (p) => p.plantilla.some((j) => j.preuFitxatge !== undefined),
  },
  {
    id: 'entrenador-5',
    nom: 'Entrenador de nivell',
    descripcio: 'Arriba al nivell 5 com a entrenador.',
    comprovar: (p) => p.llegat.nivell >= 5,
  },
  {
    id: 'entrenador-10',
    nom: 'Tàctic reconegut',
    descripcio: 'Arriba al nivell 10 com a entrenador.',
    comprovar: (p) => p.llegat.nivell >= 10,
  },
  {
    id: 'entrenador-20',
    nom: 'Immortal de la banqueta',
    descripcio: 'Arriba al nivell 20 com a entrenador.',
    comprovar: (p) => p.llegat.nivell >= 20,
  },
  {
    id: 'pavello-maxim',
    nom: 'Casa plena',
    descripcio: 'Arriba al nivell 5 del pavelló.',
    comprovar: (p) => p.pavello.nivell >= 5,
  },
  {
    id: 'golejada',
    nom: 'Palissa històrica',
    descripcio: 'Guanya un partit per 30 punts o més de diferència.',
    comprovar: (p) =>
      p.darrersPartits.some((partit) => {
        const esMeu = partit.local === p.clubNom || partit.visitant === p.clubNom;
        if (!esMeu) return false;
        const guanyaLocal = partit.puntsLocal > partit.puntsVisitant;
        const esLocal = partit.local === p.clubNom;
        const victoria = esLocal ? guanyaLocal : !guanyaLocal;
        return victoria && Math.abs(partit.puntsLocal - partit.puntsVisitant) >= 30;
      }),
  },
  {
    id: 'joia-cantera',
    nom: 'Joia del planter',
    descripcio: 'Fes debutar un jugador vingut de la cantera.',
    comprovar: (p) => p.plantilla.some((j) => j.id.includes('-cant-') && j.minutsJugats > 0),
  },
];

/** Retorna els ids d'assoliments que compleixen condició ara però encara no estaven desbloquejats */
export function comprovarAssolimentsNous(partida: Partida): Assoliment[] {
  return ASSOLIMENTS.filter((a) => !partida.assolimentsDesbloquejats.includes(a.id) && a.comprovar(partida));
}
