import { describe, it, expect } from 'vitest';
import { crearRivalsLliga, envellirPlantilla, generarJugador, generarMercat, plantillaInicial, simbolsJugador } from './generador';

describe('Generador — funcions noves', () => {
  it('generarJugador assigna un potencial >= a la mitjana actual', () => {
    const j = generarJugador(60);
    expect(j.potencial).toBeDefined();
    const m = (j.atributs.anotacio + j.atributs.triple + j.atributs.defensa + j.atributs.rebot + j.atributs.velocitat + j.atributs.resistencia) / 6;
    expect(j.potencial!).toBeGreaterThanOrEqual(Math.round(m));
  });

  it('simbolsJugador retorna els símbols coherents amb atributs alts', () => {
    const simbols = simbolsJugador({ anotacio: 90, triple: 90, defensa: 30, rebot: 30, velocitat: 30, resistencia: 30 });
    expect(simbols).toContain('3PT');
    expect(simbols).toContain('ANO');
    expect(simbols).not.toContain('DEF');
  });

  it('envellirPlantilla suma un any i manté la mida de la plantilla', () => {
    const plantilla = plantillaInicial(60);
    const envellida = envellirPlantilla(plantilla);
    expect(envellida).toHaveLength(plantilla.length);
    for (let i = 0; i < plantilla.length; i++) {
      expect(envellida[i].edat).toBe(plantilla[i].edat + 1);
    }
  });

  it('generarMercat crea jugadors amb preu de fitxatge', () => {
    const mercat = generarMercat(60, 8);
    expect(mercat).toHaveLength(8);
    for (const j of mercat) {
      expect(j.preuFitxatge).toBeGreaterThan(0);
    }
  });

  it('crearRivalsLliga funciona igual amb un poble que no existeix al mapa (fallback)', () => {
    const rivals = crearRivalsLliga('PobleInventatXYZ', 55);
    expect(rivals).toHaveLength(11);
    expect(new Set(rivals.map((r) => r.ciutat)).size).toBe(11);
  });

  it('crearRivalsLliga amb un poble real dona rivals catalans de pobles diferents', () => {
    const rivals = crearRivalsLliga('Solsona', 55);
    expect(rivals).toHaveLength(11);
    const ciutats = rivals.map((r) => r.ciutat);
    expect(new Set(ciutats).size).toBe(11);
    expect(ciutats).not.toContain('Solsona');
  });
});
