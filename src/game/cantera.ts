// ── Cantera: joves promeses del planter ──────────────────────────
import { JugadorCantera, Posicio } from './types';
import { aleatori, entre, nomAleatori } from './dades';
import { AVATARS } from './avatars';

let seq = 0;
function uid(prefix: string): string {
  seq += 1;
  return `${prefix}-cant-${seq}`;
}

/** Genera 1-2 joves de 16-19 anys amb potencial alt (però nivell actual baix) per temporada.
 * `posicioLliga` (opcional): com pitjor hagis quedat la temporada anterior, una mica més de
 * potencial en premi al "reconstruir des de baix" (petit gest a l'estil "tanking" sense un draft sencer). */
export function generarCantera(nivellClub: number, posicioLliga?: number): JugadorCantera[] {
  const n = entre(1, 2);
  const posicions: Posicio[] = ['Base', 'Escorta', 'Aler', 'Ala-pivot', 'Pivot'];
  const resultat: JugadorCantera[] = [];
  const bonusPosicio = posicioLliga ? Math.min(8, Math.max(0, posicioLliga - 4)) : 0;
  for (let i = 0; i < n; i++) {
    const posicio = aleatori(posicions);
    const edat = entre(16, 19);
    const potencial = Math.max(45, Math.min(97, nivellClub + entre(5, 25) + bonusPosicio));
    // Nivell actual molt per sota del potencial: encara han de créixer
    const nivellActual = Math.max(28, potencial - entre(18, 32));
    const [nom, cognom] = nomAleatori().split(' ');
    const base = nivellActual;
    resultat.push({
      id: uid('j'),
      nom,
      cognom,
      posicio,
      edat,
      nacionalitat: Math.random() < 0.85 ? 'Catalunya' : 'Espanya',
      atributs: {
        anotacio: Math.max(25, Math.min(90, base + entre(-6, 6))),
        triple: Math.max(20, Math.min(90, base + entre(-8, 6))),
        defensa: Math.max(25, Math.min(90, base + entre(-6, 6))),
        rebot: Math.max(25, Math.min(90, base + entre(-6, 6))),
        velocitat: Math.max(30, Math.min(92, base + entre(-4, 8))),
        resistencia: Math.max(30, Math.min(90, base + entre(-6, 4))),
      },
      forma: entre(60, 80),
      moral: entre(65, 85),
      sou: Math.round(base * 700 + entre(0, 3000)),
      contracteAnys: entre(2, 4),
      estrelles: 2,
      estat: 'actiu',
      lesioSetmanes: 0,
      sancionSetmanes: 0,
      minutsJugats: 0,
      punts: 0,
      rebots: 0,
      assistencies: 0,
      potencial,
      avatar: AVATARS[seq % AVATARS.length],
    });
  }
  return resultat;
}
