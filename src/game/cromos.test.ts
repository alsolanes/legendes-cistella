import { describe, it, expect } from 'vitest';
import { afegirCromosAColleccio, colleccioCompleta, crearColleccioInicial, cromosUnics, generarSobre, raresaDe, totalColleccionable, CROMOS_PER_SOBRE } from './cromos';
import { plantillaInicial, crearRivalsLliga } from './generador';

describe('Cromos', () => {
  it('la raresa creix amb la mitjana d atributs', () => {
    expect(raresaDe(50)).toBe('comú');
    expect(raresaDe(70)).toBe('rar');
    expect(raresaDe(78)).toBe('èpic');
    expect(raresaDe(90)).toBe('llegendari');
  });

  it('un sobre té sempre CROMOS_PER_SOBRE cartes', () => {
    const plantilla = plantillaInicial(60);
    const rivals = crearRivalsLliga('Solsona', 60);
    const sobre = generarSobre(plantilla, rivals);
    expect(sobre).toHaveLength(CROMOS_PER_SOBRE);
  });

  it('afegir cromos a la col·lecció incrementa comptadors i sobresOberts', () => {
    const plantilla = plantillaInicial(60);
    const rivals = crearRivalsLliga('Solsona', 60);
    let col = crearColleccioInicial();
    const sobre = generarSobre(plantilla, rivals);
    col = afegirCromosAColleccio(col, sobre);
    expect(col.sobresOberts).toBe(1);
    expect(cromosUnics(col)).toBeGreaterThan(0);
    expect(cromosUnics(col)).toBeLessThanOrEqual(sobre.length);
  });

  it('la col·lecció es considera completa quan tens un cromo de cada jugador/rival possible', () => {
    const plantilla = plantillaInicial(60).slice(0, 2);
    const rivals: ReturnType<typeof crearRivalsLliga> = [];
    let col = crearColleccioInicial();
    col = afegirCromosAColleccio(col, plantilla.map((j) => ({ id: j.id, nom: j.nom, cognom: j.cognom, posicio: j.posicio, rareza: 'comú' as const, mitjana: 50, especial: false })));
    expect(totalColleccionable(plantilla, rivals)).toBe(2);
    expect(colleccioCompleta(col, plantilla, rivals)).toBe(true);
  });
});
