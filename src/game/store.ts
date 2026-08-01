// ── Estat global (Zustand) ────────────────────────────────────
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cromo, FormacioEsquema, Jugador, Partida, PartitSimulat, TipusSessio } from './types';
import {
  crearPartida, jugarJornada, recuperacioSetmanal, temporadaAcabada, novaTemporada,
  aplicarBonusPartit, posicioUsuari, sanejarAlineacio, NovaPartidaConfig, TOTAL_JORNADES,
} from './temporada';
import { mitjana, generarMercat } from './generador';
import { afegirXp, afegirTitol, registrarTemporada, capturarLlegendes, XP_GUANYAR, XP_PERDRE, XP_JUGAR_BE, XP_TITOL, Perk } from './llegat';
import { generarSobre, afegirCromosAColleccio, PREU_SOBRE, xpAleatoriaSobre } from './cromos';
import { aplicarEntrenament, SESSIONS_PER_SETMANA } from './entrenament';
import { comprovarAssolimentsNous } from './assoliments';
import { decidirOcasioMinijoc, bonusPerMinijoc, OcasioMinijoc, TipusMinijoc } from './minijocs';
import { potJugar, marcarJugat, costJoc, PremiRuleta, ResultatRasca } from './jocs';
import { JocSala } from './types';
import { calcularLuxuryTaxSetmanal, intentaRenovacio, aplicarDescompteNegociador, convertirEnAgentLliure } from './contractes';
import { generarPlayoffs, jugarRondaPlayoffs } from './playoffs';
import { anecdotaAleatoria } from './anecdotes';

export interface Toast {
  id: string;
  text: string;
  emoji?: string;
}

export type Celebracio = 'victoria' | 'titol' | 'campio' | null;

/** Mai es pot deixar la plantilla per sota d'aquest nombre: cal un quintet titular sencer sempre disponible */
const PLANTILLA_MINIMA = 6; // mai per sota d'aquest nombre (5 titulars + almenys 1 suplent)

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function resultatMeu(partit: PartitSimulat, clubNom: string) {
  const esLocal = partit.local === clubNom;
  const guanya = esLocal ? partit.puntsLocal > partit.puntsVisitant : partit.puntsVisitant > partit.puntsLocal;
  const marge = Math.abs(partit.puntsLocal - partit.puntsVisitant);
  return { esLocal, guanya, marge };
}

function aplicarPremiRuletaAPartida(partida: Partida, premi: PremiRuleta): Partida {
  if (premi.tipus === 'diners') {
    return { ...partida, finanzas: { ...partida.finanzas, pressupost: partida.finanzas.pressupost + premi.valor } };
  }
  if (premi.tipus === 'moral') {
    return { ...partida, plantilla: partida.plantilla.map((j) => ({ ...j, moral: Math.min(100, j.moral + premi.valor) })) };
  }
  if (premi.tipus === 'forma') {
    return { ...partida, plantilla: partida.plantilla.map((j) => ({ ...j, forma: Math.min(100, j.forma + premi.valor) })) };
  }
  if (premi.tipus === 'xp') {
    const { llegat } = afegirXp(partida.llegat, premi.valor);
    return { ...partida, llegat };
  }
  return partida;
}

function ambAssolimentsNous(p: Partida, afegirToast: (text: string, emoji?: string) => void): Partida {
  const nous = comprovarAssolimentsNous(p);
  if (nous.length === 0) return p;
  for (const a of nous) afegirToast(`${a.emoji} Assoliment: ${a.nom}`, a.emoji);
  return { ...p, assolimentsDesbloquejats: [...p.assolimentsDesbloquejats, ...nous.map((a) => a.id)] };
}


interface JocState {
  partida: Partida | null;
  ultimaJornada: { partits: PartitSimulat[]; taquilla: number; despesaPlantilla: number } | null;
  pestanya: string;
  toasts: Toast[];
  minijocPendent: OcasioMinijoc | null;
  celebracio: Celebracio;
  anecdotaPendent: string | null;
  darrerSobre: Cromo[] | null;

  novaPartida: (cfg: NovaPartidaConfig) => void;
  jugar: () => void;
  setEsquema: (e: FormacioEsquema) => void;
  setPressing: (on: boolean) => void;
  setTitulars: (titulars: string[]) => void;
  setPestanya: (p: string) => void;
  recuperar: () => void;
  fitxar: (jugador: Jugador, sou: number) => boolean;
  fitxarMercat: (id: string) => boolean;
  acomiadar: (id: string) => void;
  millorarPavello: () => boolean;
  millorarInstalacions: () => boolean;
  renovar: (id: string) => void;
  vendreJugador: (id: string) => void;
  pujarCantera: (id: string) => boolean;
  vendreCantera: (id: string) => void;
  entrenar: (tipus: TipusSessio, participantIds: string[]) => boolean;
  obrirSobre: () => boolean;
  pagarJocSala: (joc: JocSala) => boolean;
  aplicarPremiRuleta: (premi: PremiRuleta) => void;
  afegirDiners: (quantitat: number) => void;
  resoldreMinijoc: (encerts: number) => void;
  saltarMinijoc: () => void;
  jugarPlayoff: () => void;
  novaTemporadaClub: () => void;
  afegirToast: (text: string, emoji?: string) => void;
  eliminarToast: (id: string) => void;
  tancarAnecdota: () => void;
  netejarEfemers: () => void;
  reiniciar: () => void;
}

export const useJoc = create<JocState>()(
  persist(
    (set, get) => ({
      partida: null,
      ultimaJornada: null,
      pestanya: 'tauler',
      toasts: [],
      minijocPendent: null,
      celebracio: null,
      anecdotaPendent: null,
      darrerSobre: null,

      novaPartida: (cfg) => {
        const partida = crearPartida(cfg);
        set({ partida, ultimaJornada: null, pestanya: 'tauler', toasts: [], minijocPendent: null, celebracio: null, anecdotaPendent: null, darrerSobre: null });
      },

      jugar: () => {
        const { partida } = get();
        if (!partida || temporadaAcabada(partida)) return;
        const { partida: partidaJornada, resultat } = jugarJornada(partida);
        let p = recuperacioSetmanal(partidaJornada);

        // Refresca el mercat de fitxatges setmanalment
        const nivellClub = Math.round(p.plantilla.reduce((s, j) => s + mitjana(j.atributs), 0) / Math.max(1, p.plantilla.length));
        p = { ...p, mercat: generarMercat(nivellClub) };

        // Reinicia el comptador d'entrenament de la setmana
        p = { ...p, entrenamentSetmana: { setmana: p.setmana, sessionsFetes: 0 } };

        // Impost de luxe si superem el sostre salarial
        const tax = calcularLuxuryTaxSetmanal(p);
        if (tax > 0) {
          p = { ...p, finanzas: { ...p.finanzas, pressupost: p.finanzas.pressupost - tax, despesesTemporada: p.finanzas.despesesTemporada + tax } };
        }

        // XP per la jornada jugada
        const meuPartitSim = resultat.partits.find((r) => r.local === p.clubNom || r.visitant === p.clubNom);
        let perksNous: Perk[] = [];
        let minijocPendent: OcasioMinijoc | null = null;
        let celebracio: Celebracio = null;
        if (meuPartitSim) {
          const { guanya, marge } = resultatMeu(meuPartitSim, p.clubNom);
          let xp = guanya ? XP_GUANYAR : XP_PERDRE;
          const jugaBe = marge >= 15 || (guanya && marge >= 8);
          if (jugaBe) xp += XP_JUGAR_BE;
          const afegit = afegirXp(p.llegat, xp);
          p = { ...p, llegat: afegit.llegat };
          perksNous = afegit.perksNous;
          minijocPendent = decidirOcasioMinijoc(meuPartitSim, p.clubNom);
          // Si hi ha un minijoc pendent evitem duplicar la celebració a sobre del modal:
          // ja se'n mostrarà una en resoldre'l si el bonus manté o assegura la victòria.
          if (guanya && marge >= 15 && !minijocPendent) celebracio = 'victoria';
        }

        // Genera els playoffs si la lliga regular s'acaba
        if (temporadaAcabada(p) && !p.playoffs) {
          p = { ...p, playoffs: generarPlayoffs(p) };
        }

        const toasts: Toast[] = [...get().toasts, ...perksNous.map((perk) => ({ id: uid(), text: `${perk.emoji} Nou perk desbloquejat: ${perk.nom}`, emoji: perk.emoji }))];
        p = ambAssolimentsNous(p, (text, emoji) => toasts.push({ id: uid(), text, emoji }));

        const anecdota = Math.random() < 0.35 ? anecdotaAleatoria(p) : null;

        set({
          partida: p,
          ultimaJornada: { partits: resultat.partits, taquilla: resultat.taquilla, despesaPlantilla: resultat.despesaPlantilla },
          minijocPendent,
          celebracio,
          toasts,
          anecdotaPendent: anecdota,
        });
      },

      resoldreMinijoc: (encerts) => {
        const { partida, minijocPendent } = get();
        if (!partida || !minijocPendent) return;
        const bonus = bonusPerMinijoc(minijocPendent.tipus, encerts);
        let p = bonus > 0 ? aplicarBonusPartit(partida, bonus) : partida;
        const toasts = [...get().toasts];
        p = ambAssolimentsNous(p, (text, emoji) => toasts.push({ id: uid(), text, emoji }));
        set({ partida: p, minijocPendent: null, toasts, celebracio: bonus > 0 ? 'victoria' : get().celebracio });
      },

      saltarMinijoc: () => set({ minijocPendent: null }),

      recuperar: () => {
        const { partida } = get();
        if (!partida) return;
        set({ partida: recuperacioSetmanal(partida) });
      },

      setEsquema: (e) => {
        const { partida } = get();
        if (!partida) return;
        set({ partida: { ...partida, alineacio: { ...partida.alineacio, esquema: e } } });
      },

      setPressing: (on) => {
        const { partida } = get();
        if (!partida) return;
        set({ partida: { ...partida, alineacio: { ...partida.alineacio, defensaPressing: on } } });
      },

      setTitulars: (titulars) => {
        const { partida } = get();
        if (!partida) return;
        const banqueta = partida.plantilla.filter((j) => !titulars.includes(j.id)).map((j) => j.id);
        set({ partida: { ...partida, alineacio: { ...partida.alineacio, titulars, banqueta } } });
      },

      setPestanya: (p) => set({ pestanya: p }),

      fitxar: (jugador, sou) => {
        const { partida } = get();
        if (!partida || partida.plantilla.length >= 14) return false;
        if (partida.finanzas.pressupost < sou) return false;
        const fitxat = { ...jugador, sou, contracteAnys: 2 };
        set({
          partida: {
            ...partida,
            plantilla: [...partida.plantilla, fitxat],
            finanzas: { ...partida.finanzas, pressupost: partida.finanzas.pressupost - sou, despesesTemporada: partida.finanzas.despesesTemporada + sou },
          },
        });
        return true;
      },

      fitxarMercat: (id) => {
        const { partida } = get();
        if (!partida || partida.plantilla.length >= 14) return false;
        const jugador = partida.mercat.find((j) => j.id === id);
        if (!jugador) return false;
        const preu = aplicarDescompteNegociador(jugador.preuFitxatge ?? 0, partida.llegat);
        if (partida.finanzas.pressupost < preu) return false;
        let p: Partida = {
          ...partida,
          plantilla: [...partida.plantilla, { ...jugador, contracteAnys: 2 }],
          mercat: partida.mercat.filter((j) => j.id !== id),
          finanzas: { ...partida.finanzas, pressupost: partida.finanzas.pressupost - preu, despesesTemporada: partida.finanzas.despesesTemporada + preu },
        };
        const toasts = [...get().toasts, { id: uid(), text: `✍️ ${jugador.nom} ${jugador.cognom} fitxa pel club!`, emoji: '✍️' }];
        p = ambAssolimentsNous(p, (text, emoji) => toasts.push({ id: uid(), text, emoji }));
        set({ partida: p, toasts });
        return true;
      },

      acomiadar: (id) => {
        const { partida } = get();
        if (!partida) return;
        if (partida.plantilla.length <= PLANTILLA_MINIMA) return;
        const jugador = partida.plantilla.find((j) => j.id === id);
        if (!jugador) return;
        const indemnitzacio = Math.round(jugador.sou * 0.5);
        const base: Partida = {
          ...partida,
          plantilla: partida.plantilla.filter((j) => j.id !== id),
          finanzas: { ...partida.finanzas, pressupost: partida.finanzas.pressupost - indemnitzacio, despesesTemporada: partida.finanzas.despesesTemporada + indemnitzacio },
        };
        set({ partida: sanejarAlineacio(base) });
      },

      renovar: (id) => {
        const { partida } = get();
        if (!partida) return;
        const jugador = partida.plantilla.find((j) => j.id === id);
        if (!jugador) return;
        // Si la plantilla ja està al mínim, el club sempre troba la manera de retenir-lo
        const potRefusar = partida.plantilla.length > PLANTILLA_MINIMA;
        if (potRefusar && !intentaRenovacio(jugador, partida)) {
          const agentLliure = convertirEnAgentLliure(jugador);
          const base: Partida = {
            ...partida,
            plantilla: partida.plantilla.filter((j) => j.id !== id),
            mercat: [...partida.mercat, agentLliure],
          };
          set({
            partida: sanejarAlineacio(base),
            toasts: [...get().toasts, { id: uid(), text: `😤 ${jugador.nom} ${jugador.cognom} ha refusat renovar i ha quedat lliure`, emoji: '😤' }],
          });
          return;
        }
        const nouSou = aplicarDescompteNegociador(Math.round(jugador.sou * 1.1), partida.llegat);
        if (partida.finanzas.pressupost < nouSou) return;
        set({
          partida: {
            ...partida,
            plantilla: partida.plantilla.map((j) => (j.id === id ? { ...j, contracteAnys: 2, sou: nouSou } : j)),
            finanzas: { ...partida.finanzas, pressupost: partida.finanzas.pressupost - nouSou },
          },
          toasts: [...get().toasts, { id: uid(), text: `✍️ ${jugador.nom} ${jugador.cognom} ha renovat contracte`, emoji: '✍️' }],
        });
      },

      vendreJugador: (id) => {
        const { partida } = get();
        if (!partida) return;
        if (partida.plantilla.length <= PLANTILLA_MINIMA) return;
        const jugador = partida.plantilla.find((j) => j.id === id);
        if (!jugador) return;
        const preu = Math.round(jugador.sou * 2.2);
        const base: Partida = {
          ...partida,
          plantilla: partida.plantilla.filter((j) => j.id !== id),
          finanzas: { ...partida.finanzas, pressupost: partida.finanzas.pressupost + preu, ingressosTemporada: partida.finanzas.ingressosTemporada + preu },
        };
        set({ partida: sanejarAlineacio(base) });
      },

      pujarCantera: (id) => {
        const { partida } = get();
        if (!partida || partida.plantilla.length >= 14) return false;
        const jove = partida.cantera.find((j) => j.id === id);
        if (!jove) return false;
        set({
          partida: {
            ...partida,
            plantilla: [...partida.plantilla, { ...jove, contracteAnys: 3 }],
            cantera: partida.cantera.filter((j) => j.id !== id),
          },
          toasts: [...get().toasts, { id: uid(), text: `🌱 ${jove.nom} ${jove.cognom} puja al primer equip!`, emoji: '🌱' }],
        });
        return true;
      },

      vendreCantera: (id) => {
        const { partida } = get();
        if (!partida) return;
        const jove = partida.cantera.find((j) => j.id === id);
        if (!jove) return;
        const preu = Math.round((jove.potencial ?? 50) * 400);
        set({
          partida: {
            ...partida,
            cantera: partida.cantera.filter((j) => j.id !== id),
            finanzas: { ...partida.finanzas, pressupost: partida.finanzas.pressupost + preu, ingressosTemporada: partida.finanzas.ingressosTemporada + preu },
          },
        });
      },

      entrenar: (tipus, participantIds) => {
        const { partida } = get();
        if (!partida) return false;
        if (partida.entrenamentSetmana.sessionsFetes >= SESSIONS_PER_SETMANA) return false;
        const multiplicador = 1 + (partida.instalacions.nivell - 1) * 0.15;
        const plantilla = aplicarEntrenament(partida.plantilla, tipus, participantIds, multiplicador);
        set({
          partida: {
            ...partida,
            plantilla,
            entrenamentSetmana: { ...partida.entrenamentSetmana, sessionsFetes: partida.entrenamentSetmana.sessionsFetes + 1 },
          },
        });
        return true;
      },

      obrirSobre: () => {
        const { partida } = get();
        if (!partida) return false;
        if (partida.finanzas.pressupost < PREU_SOBRE) return false;
        const cromosNous = generarSobre(partida.plantilla, partida.rivals);
        const cromos = afegirCromosAColleccio(partida.cromos, cromosNous);
        const { llegat } = afegirXp(partida.llegat, xpAleatoriaSobre());
        let p: Partida = {
          ...partida,
          cromos,
          llegat,
          finanzas: { ...partida.finanzas, pressupost: partida.finanzas.pressupost - PREU_SOBRE },
        };
        const toasts = [...get().toasts];
        p = ambAssolimentsNous(p, (text, emoji) => toasts.push({ id: uid(), text, emoji }));
        set({ partida: p, darrerSobre: cromosNous, toasts });
        return true;
      },

      pagarJocSala: (joc) => {
        const { partida } = get();
        if (!partida) return false;
        if (!potJugar(partida.salaJocs, joc, partida.setmana)) return false;
        const cost = costJoc(joc);
        if (partida.finanzas.pressupost < cost) return false;
        set({
          partida: {
            ...partida,
            salaJocs: marcarJugat(partida.salaJocs, joc, partida.setmana),
            finanzas: { ...partida.finanzas, pressupost: partida.finanzas.pressupost - cost },
          },
        });
        return true;
      },

      aplicarPremiRuleta: (premi) => {
        const { partida } = get();
        if (!partida) return;
        set({ partida: aplicarPremiRuletaAPartida(partida, premi) });
      },

      afegirDiners: (quantitat) => {
        const { partida } = get();
        if (!partida) return;
        set({ partida: { ...partida, finanzas: { ...partida.finanzas, pressupost: partida.finanzas.pressupost + quantitat } } });
      },

      millorarPavello: () => {
        const { partida } = get();
        if (!partida || partida.pavello.nivell >= 5) return false;
        const cost = partida.pavello.preuPerNivell * partida.pavello.nivell;
        if (partida.finanzas.pressupost < cost) return false;
        set({
          partida: {
            ...partida,
            pavello: { ...partida.pavello, nivell: partida.pavello.nivell + 1, capacitat: partida.pavello.capacitat + 1200 },
            finanzas: { ...partida.finanzas, pressupost: partida.finanzas.pressupost - cost, despesesTemporada: partida.finanzas.despesesTemporada + cost },
          },
        });
        return true;
      },

      millorarInstalacions: () => {
        const { partida } = get();
        if (!partida || partida.instalacions.nivell >= 5) return false;
        const cost = partida.instalacions.preuPerNivell * partida.instalacions.nivell;
        if (partida.finanzas.pressupost < cost) return false;
        set({
          partida: {
            ...partida,
            instalacions: { ...partida.instalacions, nivell: partida.instalacions.nivell + 1 },
            finanzas: { ...partida.finanzas, pressupost: partida.finanzas.pressupost - cost, despesesTemporada: partida.finanzas.despesesTemporada + cost },
          },
        });
        return true;
      },

      jugarPlayoff: () => {
        const { partida } = get();
        if (!partida || !partida.playoffs || partida.playoffs.rondaActual === 'acabats') return;
        const { partida: p2, resultat } = jugarRondaPlayoffs(partida, TOTAL_JORNADES + 10);
        let p = p2;
        let celebracio: Celebracio = null;
        if (resultat.meuPartit) {
          p = { ...p, darrersPartits: [...p.darrersPartits.slice(-4), resultat.meuPartit] };
          if (resultat.meuGuanya) celebracio = 'victoria';
        }
        if (p.playoffs?.campio === 'meu') celebracio = 'campio';
        const toasts = [...get().toasts];
        p = ambAssolimentsNous(p, (text, emoji) => toasts.push({ id: uid(), text, emoji }));
        set({ partida: p, celebracio, toasts });
      },

      novaTemporadaClub: () => {
        const { partida } = get();
        if (!partida) return;
        const posicioFinal = posicioUsuari(partida);
        const filaMeu = partida.classificacio.find((f) => f.equipId === 'meu');
        let llegat = registrarTemporada(partida.llegat, { temporada: partida.temporada, posicio: posicioFinal, victories: filaMeu?.guanyats ?? 0 });
        llegat = capturarLlegendes(llegat, partida.plantilla, partida.temporada);
        const esCampio = partida.playoffs?.campio === 'meu' || posicioFinal === 1;
        if (esCampio) {
          llegat = afegirTitol(llegat, { temporada: partida.temporada, tipus: 'títol', descripcio: `Campions de la Lliga LEB Or (temporada ${partida.temporada})` });
          llegat = afegirXp(llegat, XP_TITOL).llegat;
        }
        const p = novaTemporada({ ...partida, llegat });
        set({ partida: p, ultimaJornada: null, minijocPendent: null, celebracio: esCampio ? 'titol' : null, pestanya: 'tauler' });
      },

      afegirToast: (text, emoji) => set((state) => ({ toasts: [...state.toasts, { id: uid(), text, emoji }] })),
      eliminarToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
      tancarAnecdota: () => set({ anecdotaPendent: null }),
      netejarEfemers: () => set({ toasts: [], minijocPendent: null, celebracio: null, anecdotaPendent: null, darrerSobre: null }),

      reiniciar: () => set({ partida: null, ultimaJornada: null, toasts: [], minijocPendent: null, celebracio: null, anecdotaPendent: null, darrerSobre: null }),
    }),
    { name: 'legendes-cistella-save' },
  ),
);

export function valorJugador(j: Jugador): number {
  return Math.round(j.sou * 2.2);
}

export { mitjana };
export type { OcasioMinijoc, TipusMinijoc, PremiRuleta, ResultatRasca, JocSala };
