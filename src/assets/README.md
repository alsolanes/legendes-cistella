# Art generat amb ComfyUI (FLUX.2-klein)

Totes les imatges es van generar amb `scripts/genera-imatges.mjs` i es van comprimir a WebP
(qualitat 78-82, redimensionades) per mantenir el pes total per sota d'1 MB.

## Avatars de jugadors (12)
`avatar-m1.webp` … `avatar-m6.webp` — retrats masculins.
`avatar-f1.webp` … `avatar-f6.webp` — retrats femenins.
Assignats pseudoaleatòriament a cada jugador generat (`src/game/generador.ts`, `avatarPerIndex`).

## Art de cromos (3)
`cromo-comu.webp`, `cromo-rara.webp`, `cromo-epica.webp` — fons segons raresa del cromo
(`comú`/`rar`/`èpic`; `llegendari` reutilitza `cromo-epica.webp`). Usats a `Cromos.tsx`.

## Fons (4)
- `fons-pavello.webp` — rere el marcador a `Partit.tsx`.
- `fons-nova-partida.webp` — capçalera de `NovaPartida.tsx`.
- `fons-capcalera.webp` — fons subtil de `Capcalera.tsx`.
- `fons-celebracio.webp` — fons del modal de `Celebracio.tsx`.

## Sobre de cromos (1)
`sobre-cromos.webp` — generat però no integrat visualment (extra, opcional segons el briefing).

## Escuts de clubs rivals (6)
`escut-llop.webp`, `escut-aliga.webp`, `escut-gegant.webp`, `escut-mamut.webp`,
`escut-os.webp`, `escut-lleo.webp` — assignats pseudoaleatòriament a cada rival
(`src/game/generador.ts`, `generarRival`) i mostrats a la targeta de "Pròxim partit" (`Tauler.tsx`).
