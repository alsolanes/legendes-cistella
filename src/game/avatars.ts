// ── Avatars de jugadors generats amb ComfyUI (veure src/assets/README.md) ──
import m1 from '../assets/avatar-m1.webp';
import m2 from '../assets/avatar-m2.webp';
import m3 from '../assets/avatar-m3.webp';
import m4 from '../assets/avatar-m4.webp';
import m5 from '../assets/avatar-m5.webp';
import m6 from '../assets/avatar-m6.webp';
import f1 from '../assets/avatar-f1.webp';
import f2 from '../assets/avatar-f2.webp';
import f3 from '../assets/avatar-f3.webp';
import f4 from '../assets/avatar-f4.webp';
import f5 from '../assets/avatar-f5.webp';
import f6 from '../assets/avatar-f6.webp';
import m7 from '../assets/avatar-m7.webp';
import m8 from '../assets/avatar-m8.webp';
import m9 from '../assets/avatar-m9.webp';
import f7 from '../assets/avatar-f7.webp';
import f8 from '../assets/avatar-f8.webp';
import f9 from '../assets/avatar-f9.webp';

export const AVATARS_MASCULINS: string[] = [m1, m2, m3, m4, m5, m6, m7, m8, m9];
export const AVATARS_FEMENINS: string[] = [f1, f2, f3, f4, f5, f6, f7, f8, f9];

/** Llista segons el gènere del jugador — mai creuar-los (un home NO pot tenir avatar femení) */
export function avatarsPerGenere(genere: 'm' | 'f'): string[] {
  return genere === 'm' ? AVATARS_MASCULINS : AVATARS_FEMENINS;
}

// Backwards compatibility (codi que encara usa la llista intercalada vella)
export const AVATARS: string[] = [
  m1, f1, m2, f2, m3, f3, m4, f4, m5, f5, m6, f6,
  m7, f7, m8, f8, m9, f9,
];
