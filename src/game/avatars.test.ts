import { describe, it, expect } from 'vitest';
import { generarJugador, esGenere, avatarUnicPer, avatarDiferentA, corregirAvatarPerGenere, corregirAvatarsPartida } from './generador';
import { avatarsPerGenere } from './avatars';
import { crearPartida } from './temporada';
import { Jugador } from './types';

describe('Avatars i gènere', () => {
  it('un jugador masculí té nom masculí i avatar masculí', () => {
    const j = generarJugador(60, 'Base', 'm');
    expect(esGenere(j, 'm')).toBe(true);
    expect(avatarsPerGenere('m')).toContain(j.avatar);
  });

  it('un jugador femení té nom femení i avatar femení', () => {
    const j = generarJugador(60, 'Base', 'f');
    expect(esGenere(j, 'f')).toBe(true);
    expect(avatarsPerGenere('f')).toContain(j.avatar);
  });

  it('el gènere aleatori mai creua avatars', () => {
    for (let i = 0; i < 50; i++) {
      const j = generarJugador(entreNivell());
      const gen = esGenere(j, 'f') ? 'f' : 'm';
      expect(avatarsPerGenere(gen)).toContain(j.avatar);
    }
    function entreNivell() { return 40 + Math.floor(Math.random() * 50); }
  });

  it('avatarUnicPer respecta el gènere del jugador que s\'incorpora', () => {
    const plantilla = [generarJugador(70, 'Base', 'm'), generarJugador(70, 'Escorta', 'm'), generarJugador(70, 'Aler', 'f')];
    const nou = generarJugador(60, 'Pivot', 'f');
    const avatar = avatarUnicPer(plantilla, nou);
    expect(avatarsPerGenere('f')).toContain(avatar);
  });

  it('corregirAvatarPerGenere arregla un avatar creuat', () => {
    const j = generarJugador(60, 'Base', 'm');
    const creuat = { ...j, avatar: avatarsPerGenere('f')[0] };
    const corregit = corregirAvatarPerGenere(creuat);
    expect(avatarsPerGenere('m')).toContain(corregit.avatar);
  });

  it('corregirAvatarsPartida arregla tota la partida', () => {
    const p = crearPartida({ clubNom: 'CB Prova', ciutat: 'Solsona', colorPrincipal: '#fff', colorSecundari: '#000', nivell: 55 });
    // Força un avatar creuat a la plantilla
    const j = p.plantilla[0];
    const fem = avatarsPerGenere('f');
    const esFemJ = esGenere(j, 'f');
    const creuat = { ...p, plantilla: p.plantilla.map((x, i) => i === 0 ? { ...x, avatar: esFemJ ? avatarsPerGenere('m')[0] : fem[0] } : x) };
    const corregit = corregirAvatarsPartida(creuat);
    for (const jugador of corregit.plantilla) {
      const gen = esGenere(jugador, 'f') ? 'f' : 'm';
      expect(avatarsPerGenere(gen)).toContain(jugador.avatar);
    }
  });
});
