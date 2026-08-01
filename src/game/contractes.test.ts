import { describe, it, expect } from 'vitest';
import { aplicarDescompteNegociador, calcularLuxuryTaxSetmanal, calcularQuimica, calcularSalaryCap, convertirEnAgentLliure, probabilitatRenovacio } from './contractes';
import { crearPartida } from './temporada';
import { crearLlegatInicial, afegirXp } from './llegat';

function partidaBase() {
  return crearPartida({ clubNom: 'CB Solsona', ciutat: 'Solsona', colorPrincipal: '#ff8c42', colorSecundari: '#b83a1e', nivell: 50 });
}

describe('Contractes i química', () => {
  it('el salary cap creix amb el nivell del pavelló', () => {
    const p1 = partidaBase();
    const p2 = { ...p1, pavello: { ...p1.pavello, nivell: 5 } };
    expect(calcularSalaryCap(p2)).toBeGreaterThan(calcularSalaryCap(p1));
  });

  it('sense superar el sostre no hi ha luxury tax', () => {
    const p = partidaBase();
    expect(calcularLuxuryTaxSetmanal(p)).toBe(0);
  });

  it('superar molt el sostre salarial genera luxury tax', () => {
    const p = partidaBase();
    const plantillaCara = p.plantilla.map((j) => ({ ...j, sou: j.sou + 5_000_000 }));
    const pCar = { ...p, plantilla: plantillaCara };
    expect(calcularLuxuryTaxSetmanal(pCar)).toBeGreaterThan(0);
  });

  it('la probabilitat de renovació és sempre entre 0.1 i 0.95', () => {
    const p = partidaBase();
    for (const j of p.plantilla) {
      const prob = probabilitatRenovacio(j, p);
      expect(prob).toBeGreaterThanOrEqual(0.1);
      expect(prob).toBeLessThanOrEqual(0.95);
    }
  });

  it('el perk negociador aplica un 10% de descompte', () => {
    let llegat = crearLlegatInicial();
    llegat = afegirXp(llegat, 1000).llegat; // suficient per arribar a nivell 5 (negociador)
    expect(llegat.perks).toContain('negociador');
    expect(aplicarDescompteNegociador(1000, llegat)).toBe(900);
    expect(aplicarDescompteNegociador(1000, crearLlegatInicial())).toBe(1000);
  });

  it('convertirEnAgentLliure posa preuFitxatge a 0', () => {
    const p = partidaBase();
    const agent = convertirEnAgentLliure(p.plantilla[0]);
    expect(agent.preuFitxatge).toBe(0);
  });

  it('calcularQuimica torna un valor entre 0 i 100', () => {
    const p = partidaBase();
    const q = calcularQuimica(p);
    expect(q).toBeGreaterThanOrEqual(0);
    expect(q).toBeLessThanOrEqual(100);
  });
});
