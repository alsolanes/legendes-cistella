// ── Tipus del joc ─────────────────────────────────────────────

export type Posicio = 'Base' | 'Escorta' | 'Aler' | 'Ala-pivot' | 'Pivot';
export type EstatJugador = 'actiu' | 'lesionat' | 'sancionat';

export interface Atributs {
  /** Capacitat d'anotar prop de la cistella */
  anotacio: number; // 0-99
  /** Precisió des de la línia de triple */
  triple: number; // 0-99
  /** Defensa individual i en equip */
  defensa: number; // 0-99
  /** Rebots defensius i ofensius */
  rebot: number; // 0-99
  /** Ritme, canvi de ritme, atac en transició */
  velocitat: number; // 0-99
  /** Capacitat de jugar molts minuts sense baixar el rendiment */
  resistencia: number; // 0-99
}

export interface Jugador {
  id: string;
  nom: string;
  cognom: string;
  posicio: Posicio;
  edat: number;
  nacionalitat: string;
  atributs: Atributs;
  /** 0-100 forma actual, decau amb partits jugats i puja amb descans */
  forma: number;
  moral: number; // 0-100
  sou: number; // €/temporada
  contracteAnys: number;
  estrelles: number; // 1-5 valoració global per a la UI
  estat: EstatJugador;
  lesioSetmanes: number; // setmanes restants de baixa
  sancionSetmanes: number;
  minutsJugats: number;
  punts: number;
  rebots: number;
  assistencies: number;
  /** Potencial ocult (16-99): només visible amb el perk Ojeador. Jugadors joves de cantera en tenen. */
  potencial?: number;
  /** Preu de traspàs si ve del mercat (diferent del sou) */
  preuFitxatge?: number;
}

export type FormacioEsquema = 'clasica' | 'exterior' | 'interior' | 'transicio' | 'zona23';

export interface Alineacio {
  /** 5 titulars, ordre = posicions Base→Pivot */
  titulars: string[];
  banqueta: string[];
  esquema: FormacioEsquema;
  rotacio: boolean;
  defensaPressing: boolean; // pressió a tota la pista (més cansament, més robatoris)
}

export interface Rival {
  id: string;
  nom: string;
  ciutat: string;
  color: string;
  colorSecundari: string;
  nivell: number; // 1-99 força global
  plantilla: Jugador[];
}

export interface PartitEvent {
  minut: number; // 0-40 de joc real (2 quarts x 20)
  tipus: 'cistella' | 'triple' | 'tirLliure' | 'rebot' | 'assistencia' | 'robatori' | 'falta' | 'tempsMort' | 'canvi' | 'inici' | 'final';
  equip: 'local' | 'visitant';
  jugador?: string;
  descripcio: string;
  punts?: number;
}

export interface EstadistiquesPartit {
  local: {
    punts: number;
    tirs2: { anotats: number; intentats: number };
    tirs3: { anotats: number; intentats: number };
    tirsLliures: { anotats: number; intentats: number };
    rebots: number;
    assistencies: number;
    robatoris: number;
    perdudes: number;
    faltes: number;
  };
  visitant: EstadistiquesPartit['local'];
}

export interface PartitSimulat {
  id: string;
  jornada: number;
  local: string;
  visitant: string;
  puntsLocal: number;
  puntsVisitant: number;
  events: PartitEvent[];
  stats: EstadistiquesPartit;
  mvp: string;
  crònica: string[];
  jugat: boolean;
}

export interface ClassificacioFila {
  equipId: string;
  nom: string;
  jugats: number;
  guanyats: number;
  perduts: number;
  puntsFavor: number;
  puntsContra: number;
  ratxa: string[]; // ['V','D','V','V','V']
  punts: number; // classificació: 2 victòria / 1 derrota
}

export interface Pavello {
  nom: string;
  capacitat: number;
  nivell: number; // 1-5
  preuPerNivell: number;
}

export interface Finances {
  pressupost: number; // caixa disponible
  ingressosTemporada: number;
  despesesTemporada: number;
  taquillaPerPartit: number;
  patrociniAnual: number;
  objectiu: 'ascens' | 'playoffs' | 'permanencia' | 'titulo';
}

export interface Noticia {
  id: string;
  setmana: number;
  titol: string;
  text: string;
  tipus: 'positiu' | 'negatiu' | 'neutre';
}

export interface Partida {
  versio: number;
  clubNom: string;
  ciutat: string;
  /** Comarca real del poble/ciutat triat al mapa de Catalunya (si es coneix) */
  comarca?: string;
  colorPrincipal: string;
  colorSecundari: string;
  pavello: Pavello;
  plantilla: Jugador[];
  alineacio: Alineacio;
  finanzas: Finances;
  temporada: number;
  jornadaActual: number; // 0 = pre-temporada, 1..22 = lliga
  setmana: number;
  classificacio: ClassificacioFila[];
  rivals: Rival[];
  calendari: Array<{ jornada: number; local: string; visitant: string; jugat: boolean; resultat?: { local: number; visitant: number } }>;
  darrersPartits: PartitSimulat[];
  noticies: Noticia[];
  història: Array<{ temporada: number; posicio: number; total: number; puntsFavor: number; puntsContra: number }>;
  objectiuTemporada: string;
  /** Victòries consecutives actuals de l'usuari (per assoliments de ratxa) */
  rachaVictories: number;

  llegat: Llegat;
  cromos: ColleccioCromos;
  assolimentsDesbloquejats: string[];
  entrenamentSetmana: EstatEntrenamentSetmana;
  salaJocs: EstatSalaJocs;
  cantera: JugadorCantera[];
  mercat: Jugador[];
  copa: EstatCopa | null;
  playoffs: EstatPlayoffs | null;
  instalacions: Instalacions;
}

export interface Instalacions {
  nivell: number; // 1-5
  preuPerNivell: number;
}

// ── Llegat de l'entrenador ──────────────────────────────────────

export interface Titol {
  temporada: number;
  tipus: 'ascens' | 'títol' | 'copa';
  descripcio: string;
}

export interface MillorTemporada {
  temporada: number;
  posicio: number;
  victories: number;
}

export interface Llegat {
  xp: number;
  nivell: number;
  perks: string[]; // ids dels perks desbloquejats
  titols: Titol[];
  millorsTemporades: MillorTemporada[];
  /** Els millors jugadors que han passat pel club (per triar l'equip ideal històric) */
  llegendes: LlegendaJugador[];
}

export interface LlegendaJugador {
  nom: string;
  cognom: string;
  posicio: Posicio;
  temporada: number;
  punts: number;
  rebots: number;
  assistencies: number;
  mitjanaAtributs: number;
}

// ── Cromos ──────────────────────────────────────────────────────

export type Rareza = 'comú' | 'rar' | 'èpic' | 'llegendari';

export interface Cromo {
  id: string;
  nom: string;
  cognom: string;
  posicio: Posicio;
  rareza: Rareza;
  mitjana: number;
  especial: boolean; // cromo de rival famós
  clubOrigen?: string;
}

export interface ColleccioCromos {
  /** id de cromo -> nombre que en tens */
  posseits: Record<string, number>;
  sobresOberts: number;
}

// ── Entrenament ─────────────────────────────────────────────────

export type TipusSessio = 'tir' | 'defensa' | 'fisic' | 'tactic';

export interface EstatEntrenamentSetmana {
  setmana: number;
  sessionsFetes: number;
}

// ── Sala de jocs (Bar dels Pavellons) ──────────────────────────

export type JocSala = 'ruleta' | 'rasca' | 'memoria';

export interface EstatSalaJocs {
  ultimaSetmana: Record<JocSala, number>; // 0 = mai jugat
}

// ── Cantera ─────────────────────────────────────────────────────

export type JugadorCantera = Jugador;

// ── Copa Catalunya (eliminatòries) ─────────────────────────────

export interface EstatCopa {
  ronda: number; // 1 = vuitens (16 equips), ... 4 = final
  eliminat: boolean;
  campio: boolean;
  rivalsRestants: string[]; // noms dels rivals encara vius a l'eliminatòria de l'usuari
  historial: Array<{ ronda: string; rival: string; golsLocal: number; golsVisitant: number; guanyat: boolean }>;
}

// ── Playoffs de lliga (top 6, bracket eliminatori) ─────────────

export type NomRondaPlayoff = 'quarts' | 'semis' | 'final' | 'acabats';

export interface EnfrontamentPlayoff {
  ronda: NomRondaPlayoff;
  local: string; // equipId
  visitant: string; // equipId
  puntsLocal?: number;
  puntsVisitant?: number;
  jugat: boolean;
}

export interface EstatPlayoffs {
  classificats: string[]; // 6 equipIds per ordre de classificació
  eliminatoria: EnfrontamentPlayoff[];
  rondaActual: NomRondaPlayoff;
  meuEliminat: boolean;
  campio: string | null; // equipId campió, si ja hi ha
}
