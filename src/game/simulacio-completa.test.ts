// ── Simulació completa d'una carrera de diverses temporades ──────
// Verifica que tots els sistemes nous (playoffs, envelliment, renovacions/free
// agency, minijocs, cromos, llegat, mercat, entrenament, mapa) es mantenen
// coherents al llarg de moltes jornades i temporades consecutives.
import { describe, it, expect } from 'vitest';
import { crearPartida, jugarJornada, temporadaAcabada, novaTemporada, recuperacioSetmanal, aplicarBonusPartit, sanejarAlineacio, TOTAL_JORNADES, posicioUsuari } from './temporada';
import { generarPlayoffs, jugarRondaPlayoffs } from './playoffs';
import { generarMercat, envellirPlantilla, mitjana } from './generador';
import { intentaRenovacio, convertirEnAgentLliure, calcularSalaryCap, calcularLuxuryTaxSetmanal, calcularQuimica, aplicarDescompteNegociador } from './contractes';
import { generarSobre, afegirCromosAColleccio, colleccioCompleta, cromosUnics } from './cromos';
import { afegirXp, registrarTemporada, capturarLlegendes, afegirTitol, equipIdealHistoric, tePerk, PERKS } from './llegat';
import { comprovarAssolimentsNous } from './assoliments';
import { decidirOcasioMinijoc, bonusPerMinijoc, avaluarParada, generarZonaOptima } from './minijocs';
import { aplicarEntrenament } from './entrenament';
import { getTownPointFlexible } from '../utils/catalunyaMap';
import { Partida } from './types';

function comprovaSenseNaN(partida: Partida) {
  expect(Number.isFinite(partida.finanzas.pressupost)).toBe(true);
  for (const j of partida.plantilla) {
    expect(Number.isFinite(j.forma)).toBe(true);
    expect(Number.isFinite(j.moral)).toBe(true);
    expect(Number.isFinite(j.sou)).toBe(true);
    for (const v of Object.values(j.atributs)) expect(Number.isFinite(v)).toBe(true);
  }
}

/** Juga tots els playoffs disponibles fins que s'acaben (o retorna d'immediat si no n'hi ha) */
function jugarPlayoffsFinsAcabats(partida: Partida): Partida {
  let p = partida;
  let guard = 0;
  while (p.playoffs && p.playoffs.rondaActual !== 'acabats' && guard < 10) {
    const { partida: nova } = jugarRondaPlayoffs(p, TOTAL_JORNADES + 10);
    p = nova;
    guard++;
  }
  return p;
}

describe('Simulació completa de diverses temporades', () => {
  it('juga 3 temporades senceres (lliga + playoffs) sense estats invàlids', () => {
    let p = crearPartida({ clubNom: 'CB Alpens', ciutat: 'Alpens', comarca: 'Lluçanès', colorPrincipal: '#ff8c42', colorSecundari: '#b83a1e', nivell: 78 });

    // El poble triat s'ha de poder localitzar al mapa real
    expect(getTownPointFlexible(p.ciutat)).not.toBeNull();
    for (const rival of p.rivals) {
      // Alguns rivals catalans haurien de ser localitzables al mapa (no obligatori per als de fora Catalunya)
      void getTownPointFlexible(rival.ciutat);
    }

    let assolimentsVistos = new Set<string>();
    let xpAnterior = 0;
    let nivellAnterior = 1;
    let perksAnteriors = new Set<string>();
    let sobresObertsAnterior = 0;
    let cromosUnicsAnterior = 0;
    let renovacionsAcceptades = 0;
    let renovacionsRefusades = 0;
    let minijocsTrobats = 0;
    let playoffsJugats = 0;

    for (let temporada = 0; temporada < 3; temporada++) {
      let jornadesJugades = 0;
      while (!temporadaAcabada(p)) {
        const abansPlantillaIds = new Set(p.plantilla.map((j) => j.id));

        const { partida: partidaJornada, resultat } = jugarJornada(p);
        p = recuperacioSetmanal(partidaJornada);
        comprovaSenseNaN(p);
        jornadesJugades++;

        // Mercat setmanal: sempre generat i amb preus positius
        const nivellClub = Math.round(p.plantilla.reduce((s, j) => s + mitjana(j.atributs), 0) / Math.max(1, p.plantilla.length));
        p = { ...p, mercat: generarMercat(nivellClub) };
        for (const j of p.mercat) expect(j.preuFitxatge).toBeGreaterThanOrEqual(0);

        // Sostre salarial: mai negatiu
        const cap = calcularSalaryCap(p);
        const tax = calcularLuxuryTaxSetmanal(p);
        expect(cap).toBeGreaterThan(0);
        expect(tax).toBeGreaterThanOrEqual(0);
        if (tax > 0) {
          p = { ...p, finanzas: { ...p.finanzas, pressupost: p.finanzas.pressupost - tax, despesesTemporada: p.finanzas.despesesTemporada + tax } };
        }

        // Química sempre entre 0-100
        const quimica = calcularQuimica(p);
        expect(quimica).toBeGreaterThanOrEqual(0);
        expect(quimica).toBeLessThanOrEqual(100);

        // XP i minijoc del propi partit
        const meuPartitSim = resultat.partits.find((r) => r.local === p.clubNom || r.visitant === p.clubNom);
        if (meuPartitSim) {
          const esLocal = meuPartitSim.local === p.clubNom;
          const guanya = esLocal ? meuPartitSim.puntsLocal > meuPartitSim.puntsVisitant : meuPartitSim.puntsVisitant > meuPartitSim.puntsLocal;
          const { llegat } = afegirXp(p.llegat, guanya ? 50 : 10);
          expect(llegat.xp).toBeGreaterThanOrEqual(xpAnterior);
          expect(llegat.nivell).toBeGreaterThanOrEqual(nivellAnterior);
          for (const perkId of perksAnteriors) expect(llegat.perks).toContain(perkId); // els perks mai es perden
          xpAnterior = llegat.xp;
          nivellAnterior = llegat.nivell;
          perksAnteriors = new Set(llegat.perks);
          p = { ...p, llegat };

          const ocasio = decidirOcasioMinijoc(meuPartitSim, p.clubNom);
          if (ocasio) {
            minijocsTrobats++;
            expect(['tirLliure', 'tirTriple', 'robatori']).toContain(ocasio.tipus);
            const zona = generarZonaOptima(10);
            expect(avaluarParada(zona[0], zona)).toBe(true); // el límit inferior sempre és un encert vàlid
            const bonus = bonusPerMinijoc(ocasio.tipus, 1);
            expect(bonus).toBeGreaterThan(0);
            const abansMarge = p.darrersPartits.length;
            const ajustada = aplicarBonusPartit(p, bonus);
            expect(ajustada.darrersPartits.length).toBe(abansMarge);
            comprovaSenseNaN(ajustada);
            p = ajustada;
          }
        }

        // Assoliments: només poden créixer, mai desaparèixer
        const nous = comprovarAssolimentsNous(p);
        if (nous.length) {
          p = { ...p, assolimentsDesbloquejats: [...p.assolimentsDesbloquejats, ...nous.map((a) => a.id)] };
        }
        for (const id of assolimentsVistos) expect(p.assolimentsDesbloquejats).toContain(id);
        assolimentsVistos = new Set(p.assolimentsDesbloquejats);

        // Entrenament: els atributs dels participants no poden disminuir
        if (p.plantilla.length > 0) {
          const participant = p.plantilla[0];
          const abansAtr = { ...participant.atributs };
          const abansForma = participant.forma;
          const entrenats = aplicarEntrenament(p.plantilla, 'tir', [participant.id]);
          const despres = entrenats.find((j) => j.id === participant.id)!;
          if (despres.estat === 'actiu') {
            expect(despres.atributs.anotacio + despres.atributs.triple).toBeGreaterThanOrEqual(abansAtr.anotacio + abansAtr.triple);
            expect(despres.forma).toBeLessThanOrEqual(abansForma);
          }
          p = { ...p, plantilla: entrenats };
        }

        // Cromos: comprem un sobre cada 4 jornades si hi ha pressupost
        if (jornadesJugades % 4 === 0 && p.finanzas.pressupost > 10000) {
          const sobre = generarSobre(p.plantilla, p.rivals);
          expect(sobre).toHaveLength(5);
          const cromos = afegirCromosAColleccio(p.cromos, sobre);
          expect(cromos.sobresOberts).toBe(sobresObertsAnterior + 1);
          expect(cromosUnics(cromos)).toBeGreaterThanOrEqual(cromosUnicsAnterior);
          sobresObertsAnterior = cromos.sobresOberts;
          cromosUnicsAnterior = cromosUnics(cromos);
          p = { ...p, cromos };
        }

        // Renovacions: intentem renovar el primer jugador de la plantilla cada 5 jornades.
        // Igual que l'acció real de l'store, per sota de PLANTILLA_MINIMA el club sempre reté el jugador.
        const PLANTILLA_MINIMA = 6;
        if (jornadesJugades % 5 === 0 && p.plantilla.length > 0) {
          const jugador = p.plantilla[0];
          const souAbans = jugador.sou;
          const potRefusar = p.plantilla.length > PLANTILLA_MINIMA;
          if (potRefusar && !intentaRenovacio(jugador, p)) {
            renovacionsRefusades++;
            const agentLliure = convertirEnAgentLliure(jugador);
            expect(agentLliure.preuFitxatge).toBe(0);
            p = sanejarAlineacio({
              ...p,
              plantilla: p.plantilla.filter((j) => j.id !== jugador.id),
              mercat: [...p.mercat, agentLliure],
            });
            expect(p.plantilla.find((j) => j.id === jugador.id)).toBeUndefined();
            expect(p.mercat.find((j) => j.id === agentLliure.id)).toBeDefined();
          } else {
            renovacionsAcceptades++;
            const nouSou = aplicarDescompteNegociador(Math.round(souAbans * 1.1), p.llegat);
            p = { ...p, plantilla: p.plantilla.map((j) => (j.id === jugador.id ? { ...j, contracteAnys: 2, sou: nouSou } : j)) };
            expect(p.plantilla.find((j) => j.id === jugador.id)?.contracteAnys).toBe(2);
          }
        }

        // Reposem plantilla: fitxem del mercat si ens hem quedat curts
        if (p.plantilla.length < 10 && p.mercat.length > 0) {
          const candidat = [...p.mercat].sort((a, b) => (a.preuFitxatge ?? 0) - (b.preuFitxatge ?? 0))[0];
          const preu = aplicarDescompteNegociador(candidat.preuFitxatge ?? 0, p.llegat);
          if (p.finanzas.pressupost >= preu) {
            p = {
              ...p,
              plantilla: [...p.plantilla, { ...candidat, contracteAnys: 2 }],
              mercat: p.mercat.filter((j) => j.id !== candidat.id),
              finanzas: { ...p.finanzas, pressupost: p.finanzas.pressupost - preu, despesesTemporada: p.finanzas.despesesTemporada + preu },
            };
          }
        }

        // La plantilla mai s'ha de buidar del tot ni créixer sense control
        expect(p.plantilla.length).toBeGreaterThan(5);
        expect(p.plantilla.length).toBeLessThanOrEqual(14);
        // Ids de jugadors continuen sent únics
        expect(new Set(p.plantilla.map((j) => j.id)).size).toBe(p.plantilla.length);
        // L'alineació sempre ha de referenciar jugadors que existeixen a la plantilla
        const idsPlantillaAra = new Set(p.plantilla.map((j) => j.id));
        expect(p.alineacio.titulars.length).toBe(5);
        expect(p.alineacio.titulars.every((id) => idsPlantillaAra.has(id))).toBe(true);
        expect(p.alineacio.banqueta.every((id) => idsPlantillaAra.has(id))).toBe(true);
        void abansPlantillaIds;
      }

      expect(p.jornadaActual).toBe(TOTAL_JORNADES);

      // Playoffs (si el club s'ha classificat entre els 6 primers)
      if (!p.playoffs) {
        p = { ...p, playoffs: generarPlayoffs(p) };
      }
      if (p.playoffs) {
        playoffsJugats++;
        p = jugarPlayoffsFinsAcabats(p);
        expect(p.playoffs.rondaActual).toBe('acabats');
        expect(p.playoffs.campio).toBeTruthy();
        expect(p.playoffs.classificats).toContain(p.playoffs.campio);
      }

      // Tancament de temporada: llegat, palmarès, envelliment
      const posicioFinal = posicioUsuari(p);
      expect(posicioFinal).toBeGreaterThan(0);
      const edatAbans = p.plantilla.map((j) => ({ id: j.id, edat: j.edat }));
      const historiaAbans = p.història.length;
      const llegendesAbans = p.llegat.llegendes.length;

      let llegat = registrarTemporada(p.llegat, { temporada: p.temporada, posicio: posicioFinal, victories: p.classificacio.find((f) => f.equipId === 'meu')?.guanyats ?? 0 });
      llegat = capturarLlegendes(llegat, p.plantilla, p.temporada);
      const esCampio = p.playoffs?.campio === 'meu' || posicioFinal === 1;
      if (esCampio) llegat = afegirTitol(llegat, { temporada: p.temporada, tipus: 'títol', descripcio: 'Campions' });

      const pAmbLlegat = { ...p, llegat };
      const nova = novaTemporada(pAmbLlegat);
      comprovaSenseNaN(nova);

      expect(nova.temporada).toBe(p.temporada + 1);
      expect(nova.jornadaActual).toBe(0);
      expect(nova.història.length).toBe(historiaAbans + 1);
      expect(nova.llegat.llegendes.length).toBeGreaterThanOrEqual(llegendesAbans);
      expect(nova.classificacio.every((f) => f.jugats === 0)).toBe(true);
      expect(nova.playoffs).toBeNull();
      // Envelliment: cadascun dels jugadors que continuen té un any més
      for (const { id, edat } of edatAbans) {
        const trobat = nova.plantilla.find((j) => j.id === id);
        if (trobat) expect(trobat.edat).toBe(edat + 1);
      }

      p = nova;
    }

    // Comprovacions finals de tota la carrera
    expect(p.temporada).toBe(4); // 3 temporades jugades a partir de la 1
    expect(p.llegat.xp).toBeGreaterThan(0);
    expect(minijocsTrobats).toBeGreaterThan(0);
    console.log({ minijocsTrobats, renovacionsAcceptades, renovacionsRefusades, playoffsJugats, xpFinal: p.llegat.xp, nivellFinal: p.llegat.nivell });

    const equipIdeal = equipIdealHistoric(p.llegat);
    expect(equipIdeal.length).toBeGreaterThan(0);

    // Els perks desbloquejats han de correspondre's amb el nivell assolit
    for (const perk of PERKS) {
      if (p.llegat.nivell >= perk.nivell) expect(tePerk(p.llegat, perk.id)).toBe(true);
    }
  }, 20000);

  it('un club fluix que no es classifica per playoffs continua de temporada sense problemes', () => {
    let p = crearPartida({ clubNom: 'CB Feble', ciutat: 'Feblatown', colorPrincipal: '#333', colorSecundari: '#111', nivell: 32 });
    let capPlayoffsAlgunaTemporada = false;

    for (let temporada = 0; temporada < 2; temporada++) {
      while (!temporadaAcabada(p)) {
        const { partida: partidaJornada } = jugarJornada(p);
        p = recuperacioSetmanal(partidaJornada);
        comprovaSenseNaN(p);

        // Acomiadem el pitjor jugador cada 6 jornades (si la plantilla ho permet) per forçar
        // el cas límit del mínim de plantilla i comprovar que l'alineació es manté vàlida
        if (p.jornadaActual % 6 === 0 && p.plantilla.length > 7) {
          const pitjor = [...p.plantilla].sort((a, b) => mitjana(a.atributs) - mitjana(b.atributs))[0];
          const indemnitzacio = Math.round(pitjor.sou * 0.5);
          p = {
            ...p,
            plantilla: p.plantilla.filter((j) => j.id !== pitjor.id),
            finanzas: { ...p.finanzas, pressupost: p.finanzas.pressupost - indemnitzacio },
          };
          const idsPlantillaAra = new Set(p.plantilla.map((j) => j.id));
          const titularsValids = p.alineacio.titulars.filter((id) => idsPlantillaAra.has(id));
          const disponibles = p.plantilla.filter((j) => !titularsValids.includes(j.id)).sort((a, b) => mitjana(b.atributs) - mitjana(a.atributs));
          while (titularsValids.length < 5 && disponibles.length > 0) titularsValids.push(disponibles.shift()!.id);
          const banqueta = p.plantilla.filter((j) => !titularsValids.includes(j.id)).map((j) => j.id);
          p = { ...p, alineacio: { ...p.alineacio, titulars: titularsValids, banqueta } };
        }
        expect(p.alineacio.titulars.length).toBe(5);
      }

      if (!p.playoffs) p = { ...p, playoffs: generarPlayoffs(p) };
      if (!p.playoffs) capPlayoffsAlgunaTemporada = true;
      if (p.playoffs) p = jugarPlayoffsFinsAcabats(p);

      const posicioFinal = posicioUsuari(p);
      let llegat = registrarTemporada(p.llegat, { temporada: p.temporada, posicio: posicioFinal, victories: 0 });
      llegat = capturarLlegendes(llegat, p.plantilla, p.temporada);
      p = novaTemporada({ ...p, llegat });
      comprovaSenseNaN(p);
    }

    expect(p.temporada).toBe(3);
    // No forcem que quedi fora de playoffs (depèn de l'atzar), només ho registrem
    console.log({ capPlayoffsAlgunaTemporada });
  }, 20000);

  it('la col·lecció de cromos es pot completar amb prou sobres', () => {
    const p = crearPartida({ clubNom: 'CB Test', ciutat: 'Testland', colorPrincipal: '#000', colorSecundari: '#111', nivell: 60 });
    let cromos = p.cromos;
    for (let i = 0; i < 200 && !colleccioCompleta(cromos, p.plantilla, p.rivals); i++) {
      cromos = afegirCromosAColleccio(cromos, generarSobre(p.plantilla, p.rivals));
    }
    expect(colleccioCompleta(cromos, p.plantilla, p.rivals)).toBe(true);
  });
});
