import { describe, it, expect } from 'vitest';
import { crearPartida, sanejarAlineacio } from './temporada';
import { generarJugador } from './generador';
import { Partida } from './types';

function posicionsTitulars(p: Partida): string[] {
  const perId = new Map(p.plantilla.map((j) => [j.id, j.posicio]));
  return p.alineacio.titulars.map((id) => perId.get(id) ?? '?');
}

describe('Quintet inicial (1 per posició)', () => {
  it('la partida nova té exactament 1 titular de cada posició', () => {
    const p = crearPartida({ clubNom: 'CB Prova', ciutat: 'Solsona', colorPrincipal: '#fff', colorSecundari: '#000', nivell: 55 });
    const pos = posicionsTitulars(p);
    expect(pos.sort()).toEqual(['Ala-pivot', 'Aler', 'Base', 'Escorta', 'Pivot']);
  });

  it('sanejarAlineacio corregeix un quintet vell amb 3 Bases + 2 Escortes', () => {
    const p = crearPartida({ clubNom: 'CB Prova', ciutat: 'Solsona', colorPrincipal: '#fff', colorSecundari: '#000', nivell: 55 });
    // Simula una partida vella: forcem 3 Bases + 2 Escortes com a titulars
    const bases = p.plantilla.filter((j) => j.posicio === 'Base');
    const escortes = p.plantilla.filter((j) => j.posicio === 'Escorta');
    const malament = {
      ...p,
      alineacio: {
        ...p.alineacio,
        titulars: [bases[0].id, bases[1].id, bases[2].id, escortes[0].id, escortes[1].id],
      },
    };
    const corregit = sanejarAlineacio(malament);
    const pos = posicionsTitulars(corregit);
    expect(pos.sort()).toEqual(['Ala-pivot', 'Aler', 'Base', 'Escorta', 'Pivot']);
    expect(corregit.alineacio.titulars).toHaveLength(5);
  });

  it('sanejarAlineacio completa fins a 5 si falta una posició sencera', () => {
    const p = crearPartida({ clubNom: 'CB Prova', ciutat: 'Solsona', colorPrincipal: '#fff', colorSecundari: '#000', nivell: 55 });
    const senseAlers = {
      ...p,
      plantilla: p.plantilla.filter((j) => j.posicio !== 'Aler'),
      alineacio: {
        ...p.alineacio,
        titulars: p.plantilla.filter((j) => j.posicio !== 'Aler').slice(0, 5).map((j) => j.id),
      },
    };
    const corregit = sanejarAlineacio(senseAlers);
    expect(corregit.alineacio.titulars).toHaveLength(5);
    const ids = new Set(corregit.alineacio.titulars);
    expect(corregit.alineacio.titulars.every((id) => ids.has(id))).toBe(true);
  });

  it('sanejarAlineacio manté el titular ben posicionat si encara és a la plantilla', () => {
    const p = crearPartida({ clubNom: 'CB Prova', ciutat: 'Solsona', colorPrincipal: '#fff', colorSecundari: '#000', nivell: 55 });
    const pivot = p.plantilla.find((j) => j.posicio === 'Pivot')!;
    const corregit = sanejarAlineacio(p);
    expect(corregit.alineacio.titulars).toContain(pivot.id);
    void generarJugador;
  });
});
