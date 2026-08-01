// ── Motor de simulació de partits ─────────────────────────────
// Genera una crònica llegible, estadístiques realistes i un resultat
// que depèn de la força dels equips, la forma i la moral.
import { EstadistiquesPartit, FormacioEsquema, Jugador, PartitEvent, PartitSimulat, Posicio } from './types';
import { entre } from './dades';

export interface EquipPartit {
  id: string;
  nom: string;
  jugadors: Jugador[]; // 12
  titulars: string[]; // ids
  esquema: FormacioEsquema;
  pressing: boolean;
}

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function novaEstadistica(): EstadistiquesPartit['local'] {
  return { punts: 0, tirs2: { anotats: 0, intentats: 0 }, tirs3: { anotats: 0, intentats: 0 }, tirsLliures: { anotats: 0, intentats: 0 }, rebots: 0, assistencies: 0, robatoris: 0, perdudes: 0, faltes: 0 };
}

/** Força efectiva d'un equip: mitjana de titulars + esquema + forma/moral */
export function forcaEquip(equip: EquipPartit): number {
  const titulars = equip.titulars.map((id) => equip.jugadors.find((j) => j.id === id)).filter(Boolean) as Jugador[];
  if (titulars.length === 0) return 50;
  let total = 0;
  for (const j of titulars) {
    const m = (j.atributs.anotacio + j.atributs.triple + j.atributs.defensa + j.atributs.rebot + j.atributs.velocitat) / 5;
    const formaPes = (j.forma - 50) / 100;
    const moralPes = (j.moral - 50) / 150;
    total += m * (1 + formaPes + moralPes);
  }
  let bonus = 0;
  if (equip.esquema === 'exterior') bonus = titulars.reduce((s, j) => s + j.atributs.triple, 0) / titulars.length - 60;
  if (equip.esquema === 'interior') bonus = titulars.reduce((s, j) => s + j.atributs.rebot, 0) / titulars.length - 60;
  if (equip.esquema === 'transicio') bonus = titulars.reduce((s, j) => s + j.atributs.velocitat, 0) / titulars.length - 60;
  if (equip.esquema === 'zona23') bonus = titulars.reduce((s, j) => s + j.atributs.defensa, 0) / titulars.length - 60;
  if (equip.pressing) bonus += 2;
  return Math.max(35, Math.min(95, total / titulars.length + bonus * 0.3));
}

const FRASES_CISTELLA = [
  (n: string) => `${n} finalitza prop del cèrcol amb una entrada llegant`,
  (n: string) => `${n} rep dins la pintura i es gira per anotar fàcil`,
  (n: string) => `${n} aprofita un rebot ofensiu i posa els dos punts`,
  (n: string) => `${n} castiga la defensa amb una entrada en contraatac`,
  (n: string) => `${n} es llueix amb un moviment d esquena a la pintura`,
  (n: string) => `${n} recull un passi filtrat i anota sol sota cistella`,
];

const FRASES_TRIPLE = [
  (n: string) => `${n} clava un triple des de la cantonada`,
  (n: string) => `${n} s atura en transició i anota de tres amb naturalitat`,
  (n: string) => `${n} castiga el bloqueig amb un triple sense mirar`,
  (n: string) => `${n} bombolla des de més enllà de la línia de 6,75`,
  (n: string) => `${n} anota un triple amb la defensa a sobre`,
];

const FRASES_TL = [
  (n: string) => `${n} anota els dos tirs lliures amb fredor`,
  (n: string) => `${n} encerta un dels dos tirs lliures`,
  (n: string) => `${n} anota un tir lliure, falla l altre`,
];

const FRASES_FALTA = [
  (n: string) => `Falta personal de ${n} en defensa`,
  (n: string) => `${n} comet falta per aturar la transició`,
  (n: string) => `Falta de ${n}, que s ha de calmar`,
];

export function simularPartit(
  local: EquipPartit,
  visitant: EquipPartit,
  jornada: number,
): PartitSimulat {
  const fl = forcaEquip(local);
  const fv = forcaEquip(visitant);

  // Nombre de possessions: 62-74 per equip (realista per 40 minuts)
  const possessionsLocal = entre(62, 74);
  const possessionsVisitant = entre(62, 74);

  const stats: EstadistiquesPartit = { local: novaEstadistica(), visitant: novaEstadistica() };
  const minutsJugats = new Map<string, number>();

  // Titulars juguen més (28-36 min), banqueta menys
  const localTitulars = local.titulars;
  const visitantTitulars = visitant.titulars;

  // Eficiència per tir segons força: un equip de 70 punts de força anota ~ (70/100) * 1.05 punts per possessió
  const eficLocal = 0.95 + (fl - 60) / 160 + (local.pressing ? 0.02 : 0);
  const eficVisitant = 0.95 + (fv - 60) / 160 + (visitant.pressing ? 0.02 : 0);

  let puntsL = 0;
  let puntsV = 0;
  const minutInici = 1;

  // Repartim els punts per possessions: cada possessió → 0-4 punts (2 o 3 majoritàriament)
  const cistelles: Array<{ equip: 'local' | 'visitant'; punts: number; minut: number }> = [];

  for (let i = 0; i < possessionsLocal; i++) {
    const p = puntsPerPossessio(eficLocal, fl, fv, stats.local);
    puntsL += p;
    if (p > 0) cistelles.push({ equip: 'local', punts: p, minut: entre(minutInici, 40) });
  }
  for (let i = 0; i < possessionsVisitant; i++) {
    const p = puntsPerPossessio(eficVisitant, fv, fl, stats.visitant);
    puntsV += p;
    if (p > 0) cistelles.push({ equip: 'visitant', punts: p, minut: entre(minutInici, 40) });
  }

  // Ordenem els cistelles per minut
  cistelles.sort((a, b) => a.minut - b.minut);

  // Generem els events de crònica (una mostra llegible, no tots)
  const eventsMostra: Array<{ equip: 'local' | 'visitant'; minut: number; tipus: 'cistella' | 'triple' | 'tirLliure'; punts: number }> = [];
  for (const c of cistelles) {
    const tipus = c.punts === 3 ? 'triple' : c.punts === 2 ? 'cistella' : 'tirLliure';
    eventsMostra.push({ equip: c.equip, minut: c.minut, tipus, punts: c.punts });
  }

  // Crònica: seleccionem ~14-18 events rellevants i els convertim en frases
  const totalEvents = eventsMostra.length;
  const pas = Math.max(1, Math.floor(totalEvents / entre(14, 18)));
  const crònica: string[] = [];
  const cronEvents: PartitEvent[] = [];

  // Faltes i robatoris repartits
  const faltesLocals = entre(14, 22);
  const faltesVisitants = entre(14, 22);
  stats.local.faltes = faltesLocals;
  stats.visitant.faltes = faltesVisitants;

  const robatorisL = Math.round((fl - 50) / 12 + entre(2, 6));
  const robatorisV = Math.round((fv - 50) / 12 + entre(2, 6));
  stats.local.robatoris = Math.max(0, robatorisL);
  stats.visitant.robatoris = Math.max(0, robatorisV);

  // Rebots: ~ 38-48 per equip
  stats.local.rebots = entre(34, 46);
  stats.visitant.rebots = entre(34, 46);

  // Assistències: correlacionades amb punts
  stats.local.assistencies = Math.max(8, Math.round(puntsL / 3.4));
  stats.visitant.assistencies = Math.max(8, Math.round(puntsV / 3.4));

  // Perdudes
  stats.local.perdudes = entre(9, 16);
  stats.visitant.perdudes = entre(9, 16);

  // Construïm la crònica amb frases
  const jugadorLocal = () => {
    const titulars = localTitulars.map((id) => local.jugadors.find((j) => j.id === id)).filter(Boolean) as Jugador[];
    return titulars[Math.floor(Math.random() * titulars.length)];
  };
  const jugadorVisitant = () => {
    const titulars = visitantTitulars.map((id) => visitant.jugadors.find((j) => j.id === id)).filter(Boolean) as Jugador[];
    return titulars[Math.floor(Math.random() * titulars.length)];
  };

  let marcadorL = 0;
  let marcadorV = 0;
  let nCron = 0;
  for (let i = 0; i < eventsMostra.length; i++) {
    const ev = eventsMostra[i];
    if (ev.equip === 'local') marcadorL += ev.punts;
    else marcadorV += ev.punts;

    if (i % pas === 0 && nCron < 16) {
      const j = ev.equip === 'local' ? jugadorLocal() : jugadorVisitant();
      const frase = ev.tipus === 'triple'
        ? FRASES_TRIPLE[Math.floor(Math.random() * FRASES_TRIPLE.length)]
        : ev.tipus === 'tirLliure'
          ? FRASES_TL[Math.floor(Math.random() * FRASES_TL.length)]
          : FRASES_CISTELLA[Math.floor(Math.random() * FRASES_CISTELLA.length)];
      const nom = `${j.nom} ${j.cognom}`;
      const desc = `${frase(nom)} (${marcadorL}-${marcadorV})`;
      crònica.push(`[${ev.minut}'] ${desc}`);
      cronEvents.push({ minut: ev.minut, tipus: ev.tipus, equip: ev.equip, jugador: nom, descripcio: desc, punts: ev.punts });
      nCron++;
    }
  }

  // Afegim moments de falten/robatoris intercalats
  const nFaltes = Math.min(faltesLocals, 3);
  for (let i = 0; i < nFaltes; i++) {
    const j = Math.random() < 0.5 ? jugadorLocal() : jugadorVisitant();
    const equip = Math.random() < 0.5 ? 'local' : 'visitant';
    const minut = entre(5, 39);
    const desc = FRASES_FALTA[Math.floor(Math.random() * FRASES_FALTA.length)](`${j.nom} ${j.cognom}`);
    crònica.push(`[${minut}'] ${desc}`);
    cronEvents.push({ minut, tipus: 'falta', equip, jugador: `${j.nom} ${j.cognom}`, descripcio: desc });
  }

  crònica.sort((a, b) => {
    const ma = parseInt(a.slice(1, a.indexOf("'")), 10);
    const mb = parseInt(b.slice(1, b.indexOf("'")), 10);
    return ma - mb;
  });

  // MVP: jugador del guanyador amb més punts estimats
  const guanyador = puntsL >= puntsV ? local : visitant;
  const mvpJugador = guanyador === local ? jugadorLocal() : jugadorVisitant();
  const mvp = `${mvpJugador.nom} ${mvpJugador.cognom}`;

  // Actualitzem minuts jugats dels titulars (30-36 min)
  for (const id of localTitulars) minutsJugats.set(id, entre(28, 36));
  for (const id of visitantTitulars) minutsJugats.set(id, entre(28, 36));

  // Els stats de tirs: derivem de punts amb percentatges realistes
  const tirs3L = Math.round(puntsL * 0.35 / 3);
  const tirs3V = Math.round(puntsV * 0.35 / 3);
  const tirs2L = Math.round(puntsL * 0.55 / 2);
  const tirs2V = Math.round(puntsV * 0.55 / 2);
  stats.local.tirs3 = { anotats: tirs3L, intentats: Math.round(tirs3L / 0.36) };
  stats.visitant.tirs3 = { anotats: tirs3V, intentats: Math.round(tirs3V / 0.36) };
  stats.local.tirs2 = { anotats: tirs2L, intentats: Math.round(tirs2L / 0.52) };
  stats.visitant.tirs2 = { anotats: tirs2V, intentats: Math.round(tirs2V / 0.52) };
  stats.local.tirsLliures = { anotats: puntsL - tirs3L * 3 - tirs2L * 2, intentats: Math.round((puntsL - tirs3L * 3 - tirs2L * 2) / 0.75) };
  stats.visitant.tirsLliures = { anotats: puntsV - tirs3V * 3 - tirs2V * 2, intentats: Math.round((puntsV - tirs3V * 3 - tirs2V * 2) / 0.75) };
  stats.local.punts = puntsL;
  stats.visitant.punts = puntsV;

  const eventInici: PartitEvent = { minut: 1, tipus: 'inici', equip: 'local', descripcio: `Salta la pilota a ${local.nom} - ${visitant.nom}` };
  const eventFinal: PartitEvent = { minut: 40, tipus: 'final', equip: 'local', descripcio: `Final: ${local.nom} ${puntsL}-${puntsV} ${visitant.nom}` };
  const eventsFinal: PartitEvent[] = [eventInici, ...cronEvents, eventFinal].sort((a, b) => a.minut - b.minut);
  return {
    id: uid('partit'),
    jornada,
    local: local.nom,
    visitant: visitant.nom,
    puntsLocal: puntsL,
    puntsVisitant: puntsV,
    events: eventsFinal,
    stats,
    mvp,
    crònica,
    jugat: true,
  };
}

function puntsPerPossessio(_eficiencia: number, atac: number, defensa: number, statsAtac: EstadistiquesPartit['local']): number {
  // Probabilitat d'anotar: base 0.52 + avantatge d'atac vs defensa
  // 30 punts de diferència ≈ +23% d'encert; clampat perquè no es dispari
  const prob = Math.max(0.44, Math.min(0.64, 0.52 + (atac - defensa) / 130));
  if (Math.random() < prob) {
    // 2 punts ~55%, 3 punts ~25%, 1 punt (and-1) ~20%
    const r = Math.random();
    if (r < 0.22) return 3;
    if (r < 0.30) return 1;
    return 2;
  }
  // Fallo → rebot ofensiu (25%)
  if (Math.random() < 0.22) {
    statsAtac.rebots += 1;
  }
  return 0;
}

/** Aplica el resultat d'un partit als jugadors (forma, minuts, punts) i retorna el PartitSimulat */
export function aplicarResultat(equip: Jugador[], partit: PartitSimulat, esLocal: boolean): void {
  const stats = esLocal ? partit.stats.local : partit.stats.visitant;
  const titulars = equip.slice(0, 5);
  const banqueta = equip.slice(5);
  const nTitulars = titulars.length;

  for (let i = 0; i < nTitulars; i++) {
    const j = titulars[i];
    // minuts 28-36 repartits
    const min = 28 + Math.floor((i * 8) / nTitulars) + (Math.random() < 0.5 ? 1 : 0);
    j.minutsJugats += min;
    // punts individuals: repartim els punts de l'equip (60% titulars, 40% banqueta)
    const quota = 0.6 * stats.punts / nTitulars;
    j.punts += Math.round(quota * (0.7 + Math.random() * 0.6));
    j.rebots += Math.round((stats.rebots * 0.65) / nTitulars * (0.7 + Math.random() * 0.6));
    j.assistencies += Math.round((stats.assistencies * 0.7) / nTitulars * (0.7 + Math.random() * 0.6));
    // forma baixa una mica
    j.forma = Math.max(35, j.forma - (2 + Math.random() * 3));
  }
  for (const j of banqueta) {
    const min = Math.floor(Math.random() * 10) + 2;
    j.minutsJugats += min;
    j.punts += Math.round((0.4 * stats.punts * (0.4 + Math.random() * 0.5)) / Math.max(1, banqueta.length));
    j.forma = Math.max(35, j.forma - (1 + Math.random() * 2));
  }
  // Moral: puja amb victòria, baixa amb derrota
  const victoria = esLocal ? partit.puntsLocal > partit.puntsVisitant : partit.puntsVisitant > partit.puntsLocal;
  for (const j of equip) {
    j.moral = Math.max(20, Math.min(100, j.moral + (victoria ? 4 + Math.random() * 5 : -3 - Math.random() * 4)));
  }
}

export function jugadorPerPosicio(jugadors: Jugador[], posicio: Posicio): Jugador | undefined {
  return jugadors.find((j) => j.posicio === posicio && j.estat === 'actiu');
}
