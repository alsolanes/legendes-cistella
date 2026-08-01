import { describe, it, expect } from 'vitest';
import { generarPlayoffs, jugarRondaPlayoffs } from './playoffs';
import { crearPartida, jugarJornada, TOTAL_JORNADES } from './temporada';

function jugarTotaLaLliga(nivell: number) {
  let p = crearPartida({ clubNom: 'CB Solsona', ciutat: 'Solsona', colorPrincipal: '#ff8c42', colorSecundari: '#b83a1e', nivell });
  for (let i = 0; i < TOTAL_JORNADES; i++) {
    p = jugarJornada(p).partida;
  }
  return p;
}

describe('Playoffs', () => {
  it('un equip molt fort es classifica als playoffs (top 6)', () => {
    const p = jugarTotaLaLliga(88);
    const playoffs = generarPlayoffs(p);
    expect(playoffs).not.toBeNull();
    expect(playoffs!.classificats).toHaveLength(6);
    expect(playoffs!.classificats).toContain('meu');
  });

  it('juga tot el bracket fins a coronar un campió', () => {
    const p = jugarTotaLaLliga(88);
    let partida = { ...p, playoffs: generarPlayoffs(p) };
    if (!partida.playoffs) return; // si per atzar no s'ha classificat, ometem
    let guard = 0;
    while (partida.playoffs && partida.playoffs.rondaActual !== 'acabats' && guard < 10) {
      const { partida: nova } = jugarRondaPlayoffs(partida, 100);
      partida = nova;
      guard++;
    }
    expect(partida.playoffs?.rondaActual).toBe('acabats');
    expect(partida.playoffs?.campio).toBeTruthy();
  });

  it('llença un error si es demana jugar una ronda sense playoffs actius', () => {
    const p = jugarTotaLaLliga(88);
    const partidaSensePlayoffs = { ...p, playoffs: null };
    expect(() => jugarRondaPlayoffs(partidaSensePlayoffs, 100)).toThrow();
  });
});
