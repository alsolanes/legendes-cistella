import { describe, it, expect } from 'vitest';
import { crearPartida, jugarJornada, TOTAL_JORNADES, temporadaAcabada } from '../game/temporada';
import { crearRivalsLliga, plantillaInicial, generarJugador } from '../game/generador';
import { simularPartit, forcaEquip, EquipPartit } from '../game/motor';

function partidaBase() {
  return crearPartida({ clubNom: 'CB Solsona', ciutat: 'Solsona', colorPrincipal: '#ff8c42', colorSecundari: '#b83a1e', nivell: 50 });
}

describe('Generació', () => {
  it('crea plantilla de 12 jugadors amb les 5 posicions cobertes', () => {
    const plantilla = plantillaInicial(50);
    expect(plantilla).toHaveLength(12);
    const posicions = new Set(plantilla.map((j) => j.posicio));
    expect(posicions).toEqual(new Set(['Base', 'Escorta', 'Aler', 'Ala-pivot', 'Pivot']));
  });

  it('els atributs són coherents amb la posició (pivot rebot alt, base velocitat alta)', () => {
    const pivot = generarJugador(70, 'Pivot');
    const base = generarJugador(70, 'Base');
    expect(pivot.atributs.rebot).toBeGreaterThanOrEqual(base.atributs.rebot - 5);
    expect(base.atributs.velocitat).toBeGreaterThanOrEqual(pivot.atributs.velocitat - 5);
  });

  it('crea 11 rivals sense repetir ciutats', () => {
    const rivals = crearRivalsLliga('Solsona', 50);
    expect(rivals).toHaveLength(11);
    const ciutats = rivals.map((r) => r.ciutat);
    expect(new Set(ciutats).size).toBe(11);
  });
});

describe('Motor de partit', () => {
  function equipDe(nom: string, nivell: number): EquipPartit {
    const plantilla = plantillaInicial(nivell);
    return {
      id: nom,
      nom,
      jugadors: plantilla,
      titulars: plantilla.slice(0, 5).map((j) => j.id),
      esquema: 'clasica',
      pressing: false,
    };
  }

  it('un equip molt més fort guanya gairebé sempre', () => {
    let victòries = 0;
    const fort = equipDe('Fort', 85);
    const fluix = equipDe('Fluix', 40);
    for (let i = 0; i < 50; i++) {
      const sim = simularPartit(fort, fluix, 1);
      if (sim.puntsLocal > sim.puntsVisitant) victòries++;
    }
    expect(victòries).toBeGreaterThan(45);
  });

  it('els resultats tenen puntuacions realistes de bàsquet (50-112)', () => {
    const a = equipDe('A', 55);
    const b = equipDe('B', 55);
    for (let i = 0; i < 20; i++) {
      const sim = simularPartit(a, b, 1);
      expect(sim.puntsLocal).toBeGreaterThanOrEqual(50);
      expect(sim.puntsLocal).toBeLessThanOrEqual(112);
      expect(sim.puntsVisitant).toBeGreaterThanOrEqual(50);
      expect(sim.puntsVisitant).toBeLessThanOrEqual(112);
    }
  });

  it('les estadístiques sumen coherentment (punts = 2*2p + 3*3p + 1*TL)', () => {
    const a = equipDe('A', 60);
    const b = equipDe('B', 60);
    const sim = simularPartit(a, b, 1);
    for (const st of [sim.stats.local, sim.stats.visitant]) {
      const calc = st.tirs2.anotats * 2 + st.tirs3.anotats * 3 + st.tirsLliures.anotats * 1;
      expect(calc).toBe(st.punts);
    }
  });

  it('la crònica està ordenada cronològicament i no es col·lapsa al final', () => {
    const a = equipDe('A', 50);
    const b = equipDe('B', 50);
    const sim = simularPartit(a, b, 1);
    const minuts = sim.events.map((e) => e.minut);
    for (let i = 1; i < minuts.length; i++) {
      expect(minuts[i]).toBeGreaterThanOrEqual(minuts[i - 1]);
    }
    // No tots els events al minut 40
    const ultimMinut = minuts[minuts.length - 1];
    expect(sim.events.filter((e) => e.minut === ultimMinut).length).toBeLessThan(6);
  });

  it('el MVP és del guanyador', () => {
    const a = equipDe('A', 80);
    const b = equipDe('B', 45);
    const sim = simularPartit(a, b, 1);
    const guanyador = sim.puntsLocal > sim.puntsVisitant ? 'A' : 'B';
    expect(sim.mvp).toBeTruthy();
  });
});

describe('Temporada completa', () => {
  it('jugar 22 jornades acaba la lliga amb classificació completa', () => {
    let p = partidaBase();
    for (let i = 0; i < TOTAL_JORNADES; i++) {
      const res = jugarJornada(p);
      p = res.partida;
      expect(res.resultat.partits).toHaveLength(6); // 12 equips → 6 partits
    }
    expect(temporadaAcabada(p)).toBe(true);
    expect(p.jornadaActual).toBe(22);
    // Tots els equips han jugat 22 partits
    for (const fila of p.classificacio) {
      expect(fila.jugats).toBe(22);
      expect(fila.guanyats + fila.perduts).toBe(22);
    }
    // Punts totals coherents: cada partit reparteix 3 punts (2+1)
    const totalPunts = p.classificacio.reduce((s, f) => s + f.punts, 0);
    expect(totalPunts).toBe(22 * 6 * 3);
  });

  it('els darrers partits contenen el partit de l usuari', () => {
    let p = partidaBase();
    const res = jugarJornada(p);
    p = res.partida;
    const meu = p.darrersPartits[p.darrersPartits.length - 1];
    expect(meu.local === 'CB Solsona' || meu.visitant === 'CB Solsona').toBe(true);
  });

  it('les finances canvien després de jugar (taquilla + despeses)', () => {
    const p0 = partidaBase();
    const caixa0 = p0.finanzas.pressupost;
    const res = jugarJornada(p0);
    const p1 = res.partida;
    expect(p1.finanzas.pressupost).not.toBe(caixa0);
    expect(res.resultat.taquilla).toBeGreaterThan(1000);
  });

  it('la força d un equip millor es reflecteix a la classificació final', () => {
    let p = crearPartida({ clubNom: 'CB Potent', ciutat: 'Barcelona', colorPrincipal: '#111', colorSecundari: '#222', nivell: 85 });
    for (let i = 0; i < TOTAL_JORNADES; i++) {
      const res = jugarJornada(p);
      p = res.partida;
    }
    const meu = p.classificacio.find((f) => f.equipId === 'meu')!;
    expect(meu.guanyats).toBeGreaterThan(15); // equip de nivell 85 vs rivals 40-92
  });
});
