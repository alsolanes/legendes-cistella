import { describe, it, expect } from 'vitest';
import { avaluarParada, avaluarRobatori, bonusPerMinijoc, decidirOcasioMinijoc, generarFinestraRobatori, generarZonaOptima } from './minijocs';
import { simularPartit } from './motor';
import { plantillaInicial } from './generador';

function equip(nom: string, nivell: number) {
  const jugadors = plantillaInicial(nivell);
  return { id: nom, nom, jugadors, titulars: jugadors.slice(0, 5).map((j) => j.id), esquema: 'clasica' as const, pressing: false };
}

describe('Minijocs de partit', () => {
  it('avaluarParada detecta si la posició cau dins la zona verda', () => {
    expect(avaluarParada(50, [40, 60])).toBe(true);
    expect(avaluarParada(20, [40, 60])).toBe(false);
  });

  it('una dificultat més alta redueix l amplada de la zona òptima', () => {
    const [a1, b1] = generarZonaOptima(1);
    const [a2, b2] = generarZonaOptima(20);
    expect(b2 - a2).toBeLessThan(b1 - a1);
  });

  it('avaluarRobatori depèn de la finestra de reacció', () => {
    expect(avaluarRobatori(100, 300)).toBe(true);
    expect(avaluarRobatori(500, 300)).toBe(false);
    expect(avaluarRobatori(-10, 300)).toBe(false);
  });

  it('generarFinestraRobatori és més curta amb més dificultat', () => {
    expect(generarFinestraRobatori(20)).toBeLessThan(generarFinestraRobatori(1));
  });

  it('el bonus de tir lliure depèn dels encerts (0, 1 o 2)', () => {
    expect(bonusPerMinijoc('tirLliure', 0)).toBe(0);
    expect(bonusPerMinijoc('tirLliure', 1)).toBe(1);
    expect(bonusPerMinijoc('tirLliure', 2)).toBe(2);
  });

  it('el bonus de triple és 3 si encerta, 0 si falla', () => {
    expect(bonusPerMinijoc('tirTriple', 1)).toBe(3);
    expect(bonusPerMinijoc('tirTriple', 0)).toBe(0);
  });

  it('un partit molt ajustat té una ocasió de minijoc molt probable', () => {
    const a = equip('A', 60);
    const b = equip('B', 60);
    let trobats = 0;
    for (let i = 0; i < 40; i++) {
      const sim = simularPartit(a, b, 1);
      sim.puntsVisitant = sim.puntsLocal + 2; // forcem un marge ajustat
      const ocasio = decidirOcasioMinijoc(sim, 'A');
      if (ocasio) trobats++;
    }
    expect(trobats).toBeGreaterThan(20);
  });

  it('decidirOcasioMinijoc retorna null si el club no juga aquest partit', () => {
    const a = equip('A', 60);
    const b = equip('B', 60);
    const sim = simularPartit(a, b, 1);
    expect(decidirOcasioMinijoc(sim, 'Un altre club')).toBeNull();
  });
});
