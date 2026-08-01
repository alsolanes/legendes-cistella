import { describe, it, expect } from 'vitest';
import { aplicarEntrenament } from './entrenament';
import { plantillaInicial } from './generador';

describe('Entrenament', () => {
  it('millora els atributs corresponents dels participants', () => {
    const plantilla = plantillaInicial(55);
    const participant = plantilla[0];
    const abans = { ...participant.atributs };
    const resultat = aplicarEntrenament(plantilla, 'tir', [participant.id]);
    const despres = resultat.find((j) => j.id === participant.id)!;
    expect(despres.atributs.anotacio + despres.atributs.triple).toBeGreaterThanOrEqual(abans.anotacio + abans.triple);
  });

  it('gasta forma dels jugadors que entrenen', () => {
    const plantilla = plantillaInicial(55);
    const participant = plantilla[0];
    const resultat = aplicarEntrenament(plantilla, 'fisic', [participant.id]);
    const despres = resultat.find((j) => j.id === participant.id)!;
    expect(despres.forma).toBeLessThanOrEqual(participant.forma);
  });

  it('no afecta els jugadors que no participen', () => {
    const plantilla = plantillaInicial(55);
    const noParticipant = plantilla[1];
    const resultat = aplicarEntrenament(plantilla, 'defensa', [plantilla[0].id]);
    const despres = resultat.find((j) => j.id === noParticipant.id)!;
    expect(despres.atributs).toEqual(noParticipant.atributs);
    expect(despres.forma).toBe(noParticipant.forma);
  });

  it('un multiplicador més alt (instal·lacions millors) dona més millora', () => {
    const plantilla = plantillaInicial(55);
    const id = plantilla[0].id;
    const normal = aplicarEntrenament(plantilla, 'tactic', [id], 1).find((j) => j.id === id)!;
    const potenciat = aplicarEntrenament(plantilla, 'tactic', [id], 3).find((j) => j.id === id)!;
    const sumaNormal = normal.atributs.anotacio + normal.atributs.defensa + normal.atributs.velocitat;
    const sumaPotenciat = potenciat.atributs.anotacio + potenciat.atributs.defensa + potenciat.atributs.velocitat;
    expect(sumaPotenciat).toBeGreaterThanOrEqual(sumaNormal);
  });
});
