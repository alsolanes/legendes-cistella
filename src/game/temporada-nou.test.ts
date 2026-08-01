import { describe, it, expect } from 'vitest';
import { aplicarBonusPartit, crearPartida, jugarJornada, novaTemporada, TOTAL_JORNADES } from './temporada';

function partidaBase() {
  return crearPartida({ clubNom: 'CB Solsona', ciutat: 'Solsona', colorPrincipal: '#ff8c42', colorSecundari: '#b83a1e', nivell: 50 });
}

describe('Bonus de minijoc sobre el resultat', () => {
  it('suma punts al marcador del propi equip sense tocar el rival', () => {
    let p = partidaBase();
    p = jugarJornada(p).partida;
    const abans = p.darrersPartits[p.darrersPartits.length - 1];
    const esLocal = abans.local === p.clubNom;
    const puntsRivalAbans = esLocal ? abans.puntsVisitant : abans.puntsLocal;
    const puntsPropisAbans = esLocal ? abans.puntsLocal : abans.puntsVisitant;

    const nova = aplicarBonusPartit(p, 3);
    const despres = nova.darrersPartits[nova.darrersPartits.length - 1];
    const puntsPropisDespres = esLocal ? despres.puntsLocal : despres.puntsVisitant;
    const puntsRivalDespres = esLocal ? despres.puntsVisitant : despres.puntsLocal;

    expect(puntsPropisDespres).toBe(puntsPropisAbans + 3);
    expect(puntsRivalDespres).toBe(puntsRivalAbans);
  });

  it('amb bonus 0 no canvia res', () => {
    let p = partidaBase();
    p = jugarJornada(p).partida;
    const nova = aplicarBonusPartit(p, 0);
    expect(nova).toEqual(p);
  });

  it('pot capgirar una derrota molt ajustada en victòria i actualitzar la classificació', () => {
    let p = partidaBase();
    p = jugarJornada(p).partida;
    const partit = p.darrersPartits[p.darrersPartits.length - 1];
    const esLocal = partit.local === p.clubNom;
    const filaMeuAbans = p.classificacio.find((f) => f.equipId === 'meu')!;
    const eraDerrota = esLocal ? partit.puntsLocal < partit.puntsVisitant : partit.puntsVisitant < partit.puntsLocal;
    if (!eraDerrota) return; // el test només aplica quan hi ha derrota a comprovar

    const marge = Math.abs(partit.puntsLocal - partit.puntsVisitant);
    const nova = aplicarBonusPartit(p, marge + 1);
    const filaMeuDespres = nova.classificacio.find((f) => f.equipId === 'meu')!;
    expect(filaMeuDespres.guanyats).toBe(filaMeuAbans.guanyats + 1);
    expect(filaMeuDespres.perduts).toBe(filaMeuAbans.perduts - 1);
  });
});

describe('Els minuts i punts es reparteixen segons el quintet triat, no per ordre de la plantilla', () => {
  it('si canviem els titulars, els minuts van als jugadors seleccionats de veritat', () => {
    let p = partidaBase();
    // Titulars diferents dels 5 primers de la plantilla (que és amb qui es crea la partida)
    const titularsOriginals = p.plantilla.slice(0, 5).map((j) => j.id);
    const titularsNous = p.plantilla.slice(-5).map((j) => j.id);
    expect(new Set(titularsNous).size).toBe(5);
    p = { ...p, alineacio: { ...p.alineacio, titulars: titularsNous, banqueta: p.plantilla.filter((j) => !titularsNous.includes(j.id)).map((j) => j.id) } };

    const { partida: nova } = jugarJornada(p);

    const minutsTitularsNous = nova.plantilla.filter((j) => titularsNous.includes(j.id)).reduce((s, j) => s + j.minutsJugats, 0);
    const minutsOriginals = nova.plantilla.filter((j) => titularsOriginals.includes(j.id) && !titularsNous.includes(j.id)).reduce((s, j) => s + j.minutsJugats, 0);

    // Els titulars triats han de jugar molts més minuts (28-36 cadascun) que els antics titulars
    // que ara són banqueta (uns pocs minuts cadascun).
    expect(minutsTitularsNous).toBeGreaterThan(minutsOriginals);
    expect(minutsTitularsNous).toBeGreaterThanOrEqual(28 * 5);
  });
});

describe('Nova temporada (mateix club)', () => {
  it('envelleix la plantilla i reinicia la classificació mantenint el club', () => {
    let p = partidaBase();
    for (let i = 0; i < TOTAL_JORNADES; i++) p = jugarJornada(p).partida;
    const edatAbans = p.plantilla[0].edat;
    const nova = novaTemporada(p);
    expect(nova.temporada).toBe(p.temporada + 1);
    expect(nova.jornadaActual).toBe(0);
    expect(nova.plantilla[0].edat).toBe(edatAbans + 1);
    expect(nova.classificacio.every((f) => f.jugats === 0)).toBe(true);
    expect(nova.clubNom).toBe(p.clubNom);
  });

  it('afegeix un resum de la temporada anterior a la història', () => {
    let p = partidaBase();
    for (let i = 0; i < TOTAL_JORNADES; i++) p = jugarJornada(p).partida;
    const nova = novaTemporada(p);
    expect(nova.història).toHaveLength(1);
    expect(nova.història[0].temporada).toBe(1);
  });
});
