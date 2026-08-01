import { describe, it, expect } from 'vitest';
import { comprovarAssolimentsNous } from './assoliments';
import { crearPartida } from './temporada';

function partidaBase() {
  return crearPartida({ clubNom: 'CB Solsona', ciutat: 'Solsona', colorPrincipal: '#ff8c42', colorSecundari: '#b83a1e', nivell: 50 });
}

describe('Assoliments', () => {
  it('no hi ha assoliments desbloquejats en una partida nova', () => {
    const p = partidaBase();
    expect(comprovarAssolimentsNous(p)).toHaveLength(0);
  });

  it('desbloqueja "primera victòria" quan la classificació té una victòria', () => {
    const p = partidaBase();
    const fila = p.classificacio.find((f) => f.equipId === 'meu')!;
    fila.guanyats = 1;
    const nous = comprovarAssolimentsNous(p);
    expect(nous.some((a) => a.id === 'primera-victoria')).toBe(true);
  });

  it('no torna a proposar un assoliment ja desbloquejat', () => {
    const p = partidaBase();
    const fila = p.classificacio.find((f) => f.equipId === 'meu')!;
    fila.guanyats = 1;
    p.assolimentsDesbloquejats = ['primera-victoria'];
    const nous = comprovarAssolimentsNous(p);
    expect(nous.some((a) => a.id === 'primera-victoria')).toBe(false);
  });

  it('desbloqueja "entrenador-5" quan el llegat arriba al nivell 5', () => {
    const p = partidaBase();
    p.llegat.nivell = 5;
    const nous = comprovarAssolimentsNous(p);
    expect(nous.some((a) => a.id === 'entrenador-5')).toBe(true);
  });

  it('desbloqueja "campio-lliga" quan la història té una posició 1', () => {
    const p = partidaBase();
    p.història = [{ temporada: 1, posicio: 1, total: 12, puntsFavor: 2000, puntsContra: 1800 }];
    const nous = comprovarAssolimentsNous(p);
    expect(nous.some((a) => a.id === 'campio-lliga')).toBe(true);
  });
});
