// ── Lògica de temporada: lliga, calendari, finances ───────────
import { ClassificacioFila, Noticia, Partida, PartitSimulat } from './types';
import { entre } from './dades';
import { crearRivalsLliga, plantillaInicial, envellirPlantilla, generarMercat } from './generador';
import { EquipPartit, simularPartit, aplicarResultat } from './motor';
import { generarCantera } from './cantera';
import { crearLlegatInicial } from './llegat';
import { crearColleccioInicial } from './cromos';
import { crearEstatSalaInicial } from './jocs';

export const TOTAL_JORNADES = 22; // 12 equips, tots contra tots 2 voltes

export interface NovaPartidaConfig {
  clubNom: string;
  ciutat: string;
  comarca?: string;
  colorPrincipal: string;
  colorSecundari: string;
  nivell: number; // 1-99 força inicial del club
}

export function crearPartida(cfg: NovaPartidaConfig): Partida {
  const plantilla = plantillaInicial(cfg.nivell);
  const rivals = crearRivalsLliga(cfg.ciutat, cfg.nivell);
  const totsEquips = [
    { id: 'meu', nom: cfg.clubNom, nivell: cfg.nivell },
    ...rivals.map((r) => ({ id: r.id, nom: r.nom, nivell: r.nivell })),
  ];

  const classificacio: ClassificacioFila[] = totsEquips.map((e) => ({
    equipId: e.id,
    nom: e.nom,
    jugats: 0,
    guanyats: 0,
    perduts: 0,
    puntsFavor: 0,
    puntsContra: 0,
    ratxa: [],
    punts: 0,
  }));

  const calendari = generarCalendari(totsEquips);

  return {
    versio: 1,
    clubNom: cfg.clubNom,
    ciutat: cfg.ciutat,
    comarca: cfg.comarca,
    colorPrincipal: cfg.colorPrincipal,
    colorSecundari: cfg.colorSecundari,
    pavello: { nom: `Pavelló Municipal de ${cfg.ciutat}`, capacitat: 1800, nivell: 1, preuPerNivell: 50000 },
    plantilla,
    alineacio: {
      titulars: plantilla.slice(0, 5).map((j) => j.id),
      banqueta: plantilla.slice(5).map((j) => j.id),
      esquema: 'clasica',
      rotacio: true,
      defensaPressing: false,
    },
    finanzas: {
      pressupost: 60000,
      ingressosTemporada: 0,
      despesesTemporada: 0,
      taquillaPerPartit: 2500,
      patrociniAnual: 18000,
      objectiu: 'permanencia',
    },
    temporada: 1,
    jornadaActual: 0,
    setmana: 1,
    classificacio,
    rivals,
    calendari,
    darrersPartits: [],
    noticies: [],
    història: [],
    objectiuTemporada: 'permanencia',
    rachaVictories: 0,
    llegat: crearLlegatInicial(),
    cromos: crearColleccioInicial(),
    assolimentsDesbloquejats: [],
    entrenamentSetmana: { setmana: 1, sessionsFetes: 0 },
    salaJocs: crearEstatSalaInicial(),
    cantera: generarCantera(cfg.nivell),
    mercat: generarMercat(cfg.nivell),
    copa: null,
    playoffs: null,
    instalacions: { nivell: 1, preuPerNivell: 40000 },
  };
}

/** Comença una nova temporada mantenint el mateix club: envelleix la plantilla, reinicia
 * la lliga (calendari, classificació, rivals) i registra el resum de la temporada anterior. */
export function novaTemporada(partida: Partida): Partida {
  const p = structuredClone(partida) as Partida;
  const posicioAnterior = posicioUsuari(p);
  const filaMeu = p.classificacio.find((f) => f.equipId === 'meu');

  p.història = [
    ...p.història,
    {
      temporada: p.temporada,
      posicio: posicioAnterior,
      total: p.classificacio.length,
      puntsFavor: filaMeu?.puntsFavor ?? 0,
      puntsContra: filaMeu?.puntsContra ?? 0,
    },
  ];

  const nivellClub = Math.round(p.plantilla.reduce((s, j) => s + mitjanaAtributs(j), 0) / Math.max(1, p.plantilla.length));
  p.plantilla = envellirPlantilla(p.plantilla);
  p.rivals = crearRivalsLliga(p.ciutat, nivellClub);

  const totsEquips = [
    { id: 'meu', nom: p.clubNom, nivell: nivellClub },
    ...p.rivals.map((r) => ({ id: r.id, nom: r.nom, nivell: r.nivell })),
  ];
  p.classificacio = totsEquips.map((e) => ({
    equipId: e.id, nom: e.nom, jugats: 0, guanyats: 0, perduts: 0, puntsFavor: 0, puntsContra: 0, ratxa: [], punts: 0,
  }));
  p.calendari = generarCalendari(totsEquips);

  p.temporada += 1;
  p.jornadaActual = 0;
  p.setmana = 1;
  p.darrersPartits = [];
  p.noticies = [];
  p.rachaVictories = 0;
  p.entrenamentSetmana = { setmana: 1, sessionsFetes: 0 };
  p.cantera = generarCantera(nivellClub, posicioAnterior);
  p.mercat = generarMercat(nivellClub);
  p.playoffs = null;
  p.copa = null;
  p.finanzas = { ...p.finanzas, ingressosTemporada: 0, despesesTemporada: 0 };
  p.objectiuTemporada = posicioAnterior === 1 ? 'titulo' : posicioAnterior <= 6 ? 'playoffs' : 'permanencia';

  return p;
}

function mitjanaAtributs(j: Partida['plantilla'][number]): number {
  const a = j.atributs;
  return (a.anotacio + a.triple + a.defensa + a.rebot + a.velocitat + a.resistencia) / 6;
}

function generarCalendari(equips: Array<{ id: string; nom: string }>): Partida['calendari'] {
  // Round-robin (algorisme de cercle) per 12 equips → 22 jornades
  const n = equips.length;
  const ids = equips.map((e) => e.id);
  const result: Partida['calendari'] = [];

  const llista = [...ids];
  for (let ronda = 0; ronda < n - 1; ronda++) {
    const parelles: Array<[string, string]> = [];
    for (let i = 0; i < n / 2; i++) {
      parelles.push([llista[i], llista[n - 1 - i]]);
    }
    // Alterna local/visitant cada ronda per simetria
    for (const [a, b] of parelles) {
      const local = ronda % 2 === 0 ? a : b;
      const visitant = ronda % 2 === 0 ? b : a;
      result.push({ jornada: ronda + 1, local, visitant, jugat: false });
    }
    // Rota (fixa el primer, mou la resta)
    llista.splice(1, 0, llista.pop()!);
  }
  // Segona volta (invertim locals/visitants) — jornades n..2n-1
  const segona: Partida['calendari'] = result.map((p, i) => ({
    jornada: (i % (n - 1)) + n,
    local: p.visitant,
    visitant: p.local,
    jugat: false,
  }));
  return [...result, ...segona];
}

export interface ResultatJornada {
  partits: PartitSimulat[];
  taquilla: number;
  despesaPlantilla: number;
  noticies: Noticia[];
}

/** Juga la jornada actual de l'usuari (i els partits de la resta de rivals) */
export function jugarJornada(partida: Partida): { partida: Partida; resultat: ResultatJornada } {
  const p = structuredClone(partida) as Partida;
  const jornada = p.jornadaActual + 1;
  if (jornada > TOTAL_JORNADES) {
    throw new Error('Temporada acabada');
  }
  const partitsDeJornada = p.calendari.filter((c) => c.jornada === jornada);

  // El partit de l'usuari
  const meuPartit = partitsDeJornada.find((c) => c.local === 'meu' || c.visitant === 'meu');
  const rivalsPerId = new Map(p.rivals.map((r) => [r.id, r]));
  const alineacio = p.alineacio;

  // Construïm l'equip de l'usuari per al motor
  const meuEquip: EquipPartit = {
    id: 'meu',
    nom: p.clubNom,
    jugadors: p.plantilla,
    titulars: alineacio.titulars,
    esquema: alineacio.esquema,
    pressing: alineacio.defensaPressing,
  };

  const resultats: PartitSimulat[] = [];
  const noticies: Noticia[] = [];

  // Simulem TOTS els partits de la jornada (inclòs el del rival per al calendari de lliga)
  for (const c of partitsDeJornada) {
    let sim: PartitSimulat;
    if (c.local === 'meu' || c.visitant === 'meu') {
      const rival = rivalsPerId.get(c.local === 'meu' ? c.visitant : c.local);
      if (!rival) continue;
      const rivalEquip: EquipPartit = {
        id: rival.id,
        nom: rival.nom,
        jugadors: rival.plantilla,
        titulars: rival.plantilla.slice(0, 5).map((j) => j.id),
        esquema: 'clasica',
        pressing: false,
      };
      sim = c.local === 'meu'
        ? simularPartit(meuEquip, rivalEquip, jornada)
        : simularPartit(rivalEquip, meuEquip, jornada);
      // Aplica resultat als jugadors de l'usuari
      aplicarResultat(p.plantilla, sim, c.local === 'meu');
    } else {
      // Partit entre rivals: simula ràpid
      const a = rivalsPerId.get(c.local);
      const b = rivalsPerId.get(c.visitant);
      if (!a || !b) continue;
      const ea: EquipPartit = { id: a.id, nom: a.nom, jugadors: a.plantilla, titulars: a.plantilla.slice(0, 5).map((j) => j.id), esquema: 'clasica', pressing: false };
      const eb: EquipPartit = { id: b.id, nom: b.nom, jugadors: b.plantilla, titulars: b.plantilla.slice(0, 5).map((j) => j.id), esquema: 'clasica', pressing: false };
      sim = simularPartit(ea, eb, jornada);
      aplicarResultat(a.plantilla, sim, true);
      aplicarResultat(b.plantilla, sim, false);
    }
    // Guardem resultat al calendari
    const partitCal = p.calendari.find((cc) => cc.jornada === jornada && ((cc.local === c.local && cc.visitant === c.visitant)));
    if (partitCal) {
      partitCal.jugat = true;
      partitCal.resultat = { local: sim.puntsLocal, visitant: sim.puntsVisitant };
    }
    resultats.push(sim);

    // Actualitza classificació
    const filaLocal = p.classificacio.find((f) => f.equipId === c.local);
    const filaVisitant = p.classificacio.find((f) => f.equipId === c.visitant);
    if (filaLocal && filaVisitant) {
      const guanyaLocal = sim.puntsLocal > sim.puntsVisitant;
      filaLocal.jugats++;
      filaVisitant.jugats++;
      filaLocal.puntsFavor += sim.puntsLocal;
      filaLocal.puntsContra += sim.puntsVisitant;
      filaVisitant.puntsFavor += sim.puntsVisitant;
      filaVisitant.puntsContra += sim.puntsLocal;
      if (guanyaLocal) {
        filaLocal.guanyats++; filaVisitant.perduts++;
        filaLocal.punts += 2; filaVisitant.punts += 1;
        filaLocal.ratxa.push('V'); filaVisitant.ratxa.push('D');
      } else {
        filaVisitant.guanyats++; filaLocal.perduts++;
        filaVisitant.punts += 2; filaLocal.punts += 1;
        filaVisitant.ratxa.push('V'); filaLocal.ratxa.push('D');
      }
      filaLocal.ratxa = filaLocal.ratxa.slice(-5);
      filaVisitant.ratxa = filaVisitant.ratxa.slice(-5);
    }
  }

  // Ordena classificació
  p.classificacio.sort((a, b) => b.punts - a.punts || (b.puntsFavor - b.puntsContra) - (a.puntsFavor - a.puntsContra) || b.puntsFavor - a.puntsFavor);

  // Taquilla i finances
  const capacitat = p.pavello.capacitat * (0.7 + Math.random() * 0.2);
  const taquilla = meuPartit ? Math.round(capacitat * 9 + p.pavello.nivell * 600 + entre(0, 800)) : 0;
  p.finanzas.ingressosTemporada += taquilla + (p.finanzas.patrociniAnual / TOTAL_JORNADES);
  const despesaPlantilla = Math.round(p.plantilla.reduce((s, j) => s + j.sou, 0) / TOTAL_JORNADES);
  p.finanzas.despesesTemporada += despesaPlantilla + 1200;
  p.finanzas.pressupost += taquilla + (p.finanzas.patrociniAnual / TOTAL_JORNADES) - despesaPlantilla - 1200;

  // Notícies de la jornada
  const meuPartitSim = meuPartit ? resultats.find((r) => (r.local === p.clubNom || r.visitant === p.clubNom)) : undefined;
  if (meuPartitSim && meuPartit) {
    const victoria = cLocalMeu(meuPartit, meuPartitSim);
    p.rachaVictories = victoria ? p.rachaVictories + 1 : 0;
    const margin = Math.abs(meuPartitSim.puntsLocal - meuPartitSim.puntsVisitant);
    if (victoria && margin >= 20) {
      noticies.push({ id: `n-${Date.now()}-1`, setmana: p.setmana, titol: `Palissa històrica`, text: `${p.clubNom} destrossa ${rivalNom(meuPartit, p)} per ${margin} punts de diferència. La gent comença a somiar.`, tipus: 'positiu' });
    } else if (victoria) {
      noticies.push({ id: `n-${Date.now()}-2`, setmana: p.setmana, titol: `Victòria a la jornada ${jornada}`, text: `${p.clubNom} supera ${rivalNom(meuPartit, p)} en un partit intens.`, tipus: 'positiu' });
    } else if (margin <= 5) {
      noticies.push({ id: `n-${Date.now()}-3`, setmana: p.setmana, titol: `Derrota ajustada`, text: `${p.clubNom} cau per la mínima contra ${rivalNom(meuPartit, p)}. S'escapa la victòria per poc.`, tipus: 'negatiu' });
    } else {
      noticies.push({ id: `n-${Date.now()}-4`, setmana: p.setmana, titol: `Derrota clara`, text: `${p.clubNom} no pot amb ${rivalNom(meuPartit, p)} i perd clarament.`, tipus: 'negatiu' });
    }
  }

  // Avança jornada i setmana
  p.jornadaActual = jornada;
  p.setmana += 1;
  p.darrersPartits = [...p.darrersPartits.slice(-4), meuPartitSim ? meuPartitSim : resultats[0]].filter(Boolean) as PartitSimulated[];

  return { partida: p, resultat: { partits: resultats, taquilla, despesaPlantilla, noticies } };
}

// ── Helpers ──
type PartitSimulated = PartitSimulat;

function cLocalMeu(c: { local: string; visitant: string }, sim: PartitSimulat): boolean {
  return c.local === 'meu' ? sim.puntsLocal > sim.puntsVisitant : sim.puntsVisitant > sim.puntsLocal;
}

function rivalNom(c: { local: string; visitant: string }, p: Partida): string {
  const id = c.local === 'meu' ? c.visitant : c.local;
  const rival = p.rivals.find((r) => r.id === id);
  return rival ? rival.nom : 'el rival';
}

/** Recuperació setmanal: forma i moral dels jugadors */
export function recuperacioSetmanal(partida: Partida): Partida {
  const p = structuredClone(partida) as Partida;
  for (const j of p.plantilla) {
    // forma es recupera una mica (0-3 punts), moral si estava baixa
    if (j.estat === 'actiu') {
      j.forma = Math.min(100, j.forma + (Math.random() < 0.7 ? 1 + Math.random() * 2 : 0));
      if (j.moral < 50) j.moral = Math.min(65, j.moral + 3 + Math.random() * 4);
    }
    // lesions
    if (j.lesioSetmanes > 0) {
      j.lesioSetmanes -= 1;
      if (j.lesioSetmanes === 0) j.estat = 'actiu';
    }
    if (j.sancionSetmanes > 0) {
      j.sancionSetmanes -= 1;
      if (j.sancionSetmanes === 0) j.estat = 'actiu';
    }
  }
  return p;
}

/** Aplica un bonus de punts al resultat del darrer partit de l'usuari (efecte d'un minijoc
 * de partit). Si el bonus canvia qui guanya, recalcula la classificació d'aquest enfrontament. */
export function aplicarBonusPartit(partida: Partida, bonus: number): Partida {
  if (bonus <= 0) return partida;
  const p = structuredClone(partida) as Partida;
  const idx = p.darrersPartits.length - 1;
  if (idx < 0) return p;
  const partit = p.darrersPartits[idx];
  const esLocal = partit.local === p.clubNom;
  const esVisitant = partit.visitant === p.clubNom;
  if (!esLocal && !esVisitant) return p;

  const guanyavaAbans = partit.puntsLocal > partit.puntsVisitant;
  if (esLocal) partit.puntsLocal += bonus; else partit.puntsVisitant += bonus;
  const guanyaAra = partit.puntsLocal > partit.puntsVisitant;

  const stats = esLocal ? partit.stats.local : partit.stats.visitant;
  stats.punts += bonus;

  const cal = p.calendari.find((c) => c.jornada === partit.jornada && ((c.local === 'meu' && esLocal) || (c.visitant === 'meu' && esVisitant)));
  if (cal?.resultat) {
    if (esLocal) cal.resultat.local += bonus; else cal.resultat.visitant += bonus;
  }

  const filaMeu = p.classificacio.find((f) => f.equipId === 'meu');
  const rivalId = cal ? (esLocal ? cal.visitant : cal.local) : undefined;
  const filaRival = rivalId ? p.classificacio.find((f) => f.equipId === rivalId) : undefined;
  if (filaMeu) filaMeu.puntsFavor += bonus;
  if (filaRival) filaRival.puntsContra += bonus;

  if (guanyavaAbans !== guanyaAra && filaMeu && filaRival) {
    if (guanyaAra) {
      filaMeu.guanyats++; filaMeu.perduts--; filaMeu.punts += 1;
      filaRival.perduts++; filaRival.guanyats--; filaRival.punts -= 1;
      if (filaMeu.ratxa.length) filaMeu.ratxa[filaMeu.ratxa.length - 1] = 'V';
      if (filaRival.ratxa.length) filaRival.ratxa[filaRival.ratxa.length - 1] = 'D';
      p.rachaVictories += 1;
    } else {
      filaMeu.perduts++; filaMeu.guanyats--; filaMeu.punts -= 1;
      filaRival.guanyats++; filaRival.perduts--; filaRival.punts += 1;
      if (filaMeu.ratxa.length) filaMeu.ratxa[filaMeu.ratxa.length - 1] = 'D';
      if (filaRival.ratxa.length) filaRival.ratxa[filaRival.ratxa.length - 1] = 'V';
      p.rachaVictories = 0;
    }
    p.classificacio.sort((a, b) => b.punts - a.punts || (b.puntsFavor - b.puntsContra) - (a.puntsFavor - a.puntsContra) || b.puntsFavor - a.puntsFavor);
  }

  return p;
}

/** Comprova si la temporada ha acabat */
export function temporadaAcabada(partida: Partida): boolean {
  return partida.jornadaActual >= TOTAL_JORNADES;
}

export function posicioUsuari(partida: Partida): number {
  const fila = partida.classificacio.find((f) => f.equipId === 'meu');
  return fila ? partida.classificacio.indexOf(fila) + 1 : -1;
}
