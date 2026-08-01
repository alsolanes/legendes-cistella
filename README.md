# 🏀 Llegendes de la Cistella

Joc de gestió de club de bàsquet català. Converteix un club de barri en una llegenda de la Lliga LEB Or.

## Característiques

- **Gestió de plantilla**: 12 jugadors (3 Bases, 3 Escortes, 2 Alers, 2 Ala-pivots, 2 Pivots) amb 6 atributs (anotació, triple, defensa, rebot, velocitat, resistència), forma i moral dinàmiques
- **Quintet inicial interactiu**: pista de bàsquet amb posicions reals, canvia titulars tocant els jugadors
- **Esquemes tàctics**: Clàssica, Tir exterior, Joc interior, Transició + defensa de pressió
- **Lliga completa**: 12 equips, 22 jornades (tots contra tots, 2 voltes), classificació amb ratxa de forma
- **Finances**: taquilla, patrocini, fitxatges, renovacions, vendes, millores del pavelló
- **Simulació realista**: resultats basats en la força dels equips, crònica minut a minut amb frases de bàsquet, estadístiques (tirs de 2/3, tirs lliures, rebots, assistències, robatoris, perdudes, faltes)
- **Historial**: registre de cada temporada
- **Persistència**: la partida es guarda automàticament al navegador (localStorage)

## Desenvolupament

```bash
npm install
npm run dev       # desenvolupament (port 5199)
npm test          # tests del motor
npm run build     # build de producció
```

## Estructura

```
src/
  game/
    types.ts      # tipus del domini
    dades.ts      # noms, pobles, helpers aleatoris
    generador.ts  # generació de jugadors i rivals
    motor.ts      # simulació de partits
    temporada.ts  # lliga, calendari, finances
    store.ts      # estat global (Zustand + persist)
    motor.test.ts # tests del motor
  components/     # UI React
  App.tsx
  estil.css       # disseny fosc amb taronges de pista
```

## Stack

- React 18 + TypeScript
- Vite 6
- Zustand (estat + persistència)
- Vitest (tests)
