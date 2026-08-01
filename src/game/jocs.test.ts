import { describe, it, expect } from 'vitest';
import {
  girarRuleta, PREMIS_RULETA, generarRasca, comprovarRasca, barallarCartesMemoria, ICONES_MEMORIA,
  premiMemoria, potJugar, marcarJugat, crearEstatSalaInicial, costJoc,
} from './jocs';

describe('Sala de jocs', () => {
  it('la ruleta sempre retorna un premi vàlid de la llista', () => {
    for (let i = 0; i < 30; i++) {
      const premi = girarRuleta();
      expect(PREMIS_RULETA.map((p) => p.id)).toContain(premi.id);
    }
  });

  it('comprovarRasca detecta una línia de 3 iguals', () => {
    const graella = ['🏀', '🏀', '🏀', '🎯', '🧺', '👟', '🏆', '⏱️', '🎯'];
    const resultat = comprovarRasca(graella);
    expect(resultat.guanya).toBe(true);
    expect(resultat.premi).toBeGreaterThan(0);
  });

  it('comprovarRasca no guanya sense cap línia', () => {
    const graella = ['🏀', '🎯', '🧺', '👟', '🏆', '⏱️', '🎯', '🏀', '🧺'];
    const resultat = comprovarRasca(graella);
    expect(resultat.guanya).toBe(false);
    expect(resultat.premi).toBe(0);
  });

  it('generarRasca sempre torna 9 símbols coherents amb comprovarRasca', () => {
    for (let i = 0; i < 15; i++) {
      const r = generarRasca();
      expect(r.graella).toHaveLength(9);
      expect(r).toEqual({ graella: r.graella, ...comprovarRasca(r.graella) });
    }
  });

  it('la memòria baralla 8 parelles (16 cartes)', () => {
    const cartes = barallarCartesMemoria();
    expect(cartes).toHaveLength(ICONES_MEMORIA.length * 2);
    for (const icona of ICONES_MEMORIA) {
      expect(cartes.filter((c) => c === icona)).toHaveLength(2);
    }
  });

  it('menys intents a la memòria dona més premi', () => {
    expect(premiMemoria(8)).toBeGreaterThan(premiMemoria(20));
  });

  it('el cooldown setmanal impedeix jugar dues vegades la mateixa setmana', () => {
    let estat = crearEstatSalaInicial();
    expect(potJugar(estat, 'ruleta', 3)).toBe(true);
    estat = marcarJugat(estat, 'ruleta', 3);
    expect(potJugar(estat, 'ruleta', 3)).toBe(false);
    expect(potJugar(estat, 'ruleta', 4)).toBe(true);
    expect(potJugar(estat, 'rasca', 3)).toBe(true);
  });

  it('cada joc té un cost positiu', () => {
    expect(costJoc('ruleta')).toBeGreaterThan(0);
    expect(costJoc('rasca')).toBeGreaterThan(0);
    expect(costJoc('memoria')).toBeGreaterThan(0);
  });
});
