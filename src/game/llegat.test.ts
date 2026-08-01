import { describe, it, expect } from 'vitest';
import { afegirXp, crearLlegatInicial, equipIdealHistoric, capturarLlegendes, nivellPerXp, perksDelNivell, PERKS, tePerk } from './llegat';
import { generarJugador } from './generador';

describe('Llegat de entrenador', () => {
  it('comença al nivell 1 sense perks', () => {
    const l = crearLlegatInicial();
    expect(l.nivell).toBe(1);
    expect(l.perks).toHaveLength(0);
  });

  it('puja de nivell en acumular XP suficient', () => {
    let l = crearLlegatInicial();
    const res = afegirXp(l, 5000);
    expect(res.llegat.nivell).toBeGreaterThan(1);
    expect(nivellPerXp(res.llegat.xp)).toBe(res.llegat.nivell);
  });

  it('desbloqueja el perk Ojeador en arribar al nivell 2', () => {
    const l = crearLlegatInicial();
    const res = afegirXp(l, 300);
    expect(res.llegat.nivell).toBeGreaterThanOrEqual(2);
    expect(tePerk(res.llegat, 'ojeador')).toBe(true);
    expect(res.perksNous.some((p) => p.id === 'ojeador')).toBe(true);
  });

  it('no torna a donar un perk ja desbloquejat', () => {
    let l = crearLlegatInicial();
    l = afegirXp(l, 300).llegat;
    const segon = afegirXp(l, 50);
    expect(segon.perksNous.some((p) => p.id === 'ojeador')).toBe(false);
  });

  it('perksDelNivell és acumulatiu i coherent amb la llista total', () => {
    expect(perksDelNivell(20)).toHaveLength(PERKS.length);
    expect(perksDelNivell(1)).toHaveLength(0);
  });

  it('equip ideal històric agafa els millors per posició', () => {
    let l = crearLlegatInicial();
    const plantilla = [generarJugador(80, 'Base'), generarJugador(80, 'Pivot')];
    plantilla[0].punts = 500;
    plantilla[1].punts = 800;
    l = capturarLlegendes(l, plantilla, 1);
    const equip = equipIdealHistoric(l);
    expect(equip.length).toBeGreaterThan(0);
    expect(equip.length).toBeLessThanOrEqual(5);
  });
});
