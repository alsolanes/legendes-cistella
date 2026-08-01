// ── Estat global (Zustand) ────────────────────────────────────
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Jugador, Partida, PartitSimulat, FormacioEsquema } from './types';
import { crearPartida, jugarJornada, recuperacioSetmanal, temporadaAcabada, NovaPartidaConfig } from './temporada';
import { mitjana } from './generador';

interface JocState {
  partida: Partida | null;
  ultimaJornada: { partits: PartitSimulat[]; taquilla: number; despesaPlantilla: number } | null;
  pestanya: string;
  novaPartida: (cfg: NovaPartidaConfig) => void;
  jugar: () => void;
  setEsquema: (e: FormacioEsquema) => void;
  setPressing: (on: boolean) => void;
  setTitulars: (titulars: string[]) => void;
  setPestanya: (p: string) => void;
  recuperar: () => void;
  fitxar: (jugador: Jugador, sou: number) => boolean;
  acomiadar: (id: string) => void;
  millorarPavello: () => boolean;
  renovar: (id: string) => void;
  vendreJugador: (id: string) => void;
  reiniciar: () => void;
}

export const useJoc = create<JocState>()(
  persist(
    (set, get) => ({
      partida: null,
      ultimaJornada: null,
      pestanya: 'tauler',

      novaPartida: (cfg) => {
        const partida = crearPartida(cfg);
        set({ partida, ultimaJornada: null, pestanya: 'tauler' });
      },

      jugar: () => {
        const { partida } = get();
        if (!partida || temporadaAcabada(partida)) return;
        const { partida: nova, resultat } = jugarJornada(partida);
        set({ partida: nova, ultimaJornada: { partits: resultat.partits, taquilla: resultat.taquilla, despesaPlantilla: resultat.despesaPlantilla } });
      },

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

      acomiadar: (id) => {
        const { partida } = get();
        if (!partida) return;
        const jugador = partida.plantilla.find((j) => j.id === id);
        if (!jugador) return;
        const indemnitzacio = Math.round(jugador.sou * 0.5);
        set({
          partida: {
            ...partida,
            plantilla: partida.plantilla.filter((j) => j.id !== id),
            finanzas: { ...partida.finanzas, pressupost: partida.finanzas.pressupost - indemnitzacio, despesesTemporada: partida.finanzas.despesesTemporada + indemnitzacio },
          },
        });
      },

      renovar: (id) => {
        const { partida } = get();
        if (!partida) return;
        const jugador = partida.plantilla.find((j) => j.id === id);
        if (!jugador) return;
        const nouSou = Math.round(jugador.sou * 1.1);
        if (partida.finanzas.pressupost < nouSou) return;
        set({
          partida: {
            ...partida,
            plantilla: partida.plantilla.map((j) => (j.id === id ? { ...j, contracteAnys: 2, sou: nouSou } : j)),
            finanzas: { ...partida.finanzas, pressupost: partida.finanzas.pressupost - nouSou },
          },
        });
      },

      vendreJugador: (id) => {
        const { partida } = get();
        if (!partida) return;
        const jugador = partida.plantilla.find((j) => j.id === id);
        if (!jugador) return;
        const preu = Math.round(jugador.sou * 2.2);
        set({
          partida: {
            ...partida,
            plantilla: partida.plantilla.filter((j) => j.id !== id),
            finanzas: { ...partida.finanzas, pressupost: partida.finanzas.pressupost + preu, ingressosTemporada: partida.finanzas.ingressosTemporada + preu },
          },
        });
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

      reiniciar: () => set({ partida: null, ultimaJornada: null }),
    }),
    { name: 'legendes-cistella-save' },
  ),
);

export function valorJugador(j: Jugador): number {
  return Math.round(j.sou * 2.2);
}

export { mitjana };
