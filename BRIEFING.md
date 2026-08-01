# BRIEFING — Fes que Llegendes de la Cistella sigui espectacular

Ets un expert en disseny de videojocs de gestió esportiva. La teva feina: portar les coses DIVERTIDES d'un altre joc (futbol) a aquest joc de bàsquet i fer-lo espectacular, amb molt de gust i detall. Treballa de manera autònoma fins que tot estigui fet, testejat i publicat.

## Context del projecte

- **Path**: `/home/aleix/legendes-cistella/`
- **Stack**: React 18 + TypeScript + Vite 6 + Zustand (persist a localStorage) + Vitest
- **Motor pur TS** a `src/game/` (sense React): `types.ts`, `dades.ts`, `generador.ts`, `motor.ts` (simulació), `temporada.ts` (lliga/calendari/finançes), `store.ts` (estat global Zustand)
- **UI**: `src/components/` (Capcalera, Pestanyes, Tauler, Plantilla, Partit, Finances, NovaPartida, FiTemporada), `src/estil.css` (tema fosc amb taronges de pista)
- **Tests**: `src/game/motor.test.ts` (12 tests — s'han de mantenir verds)
- **Comandes**: `npm run dev` (port 5199), `npm test`, `npm run build` (`CISTELLA_BASE=/cistella/ npm run build` per publicar)
- **Publicació**: el build es copia a `/home/aleix/news-site/cistella/` → live a `https://noticies.solanes.xyz/cistella/`
- **Git**: repo `alsolanes/legendes-cistella` (branch main). Fes commit + push quan acabis.
- **Idioma**: TOTA la UI i textos en CATALÀ. Codi/varis en català quan tingui sentit (el projecte ja ho fa).

## Estat actual del joc (el que ja existeix)

- Nova partida: nom de club, ciutat, nivell (30-85), colors
- Lliga LEB Or: 12 equips, 22 jornades, classificació, ratxa de forma
- Plantilla: 12 jugadors (Base/Escorta/Aler/Ala-pivot/Pivot), 6 atributs (anotació, triple, defensa, rebot, velocitat, resistència), forma/moral/sou
- Quintet inicial a la pista (clic per canviar titulars), 4 esquemes tàctics + pressió
- Partits simulats amb crònica minut a minut en català i stats de bàsquet
- Finances: taquilla, patrocini, fitxatges bàsics, millores de pavelló (5 nivells)
- Fi de temporada amb resum

## Funcionalitats divertides del joc germà (futbol) que HAS de portar, adaptades a bàsquet

Aquí tens la llista del que el joc vell té i que el fa divertit. Adapta-les al món del bàsquet català. Prioritat: 1 = imprescindible, 2 = molt important, 3 = si sobra temps.

### PRIORITAT 1 — Minijocs interactius als partits
El joc vell té minijocs tàctils durant els partits (timing/sweripe). Porta'n 2-3 adaptats a bàsquet:
- **Tir lliure** (basat en el Penal del joc vell): una barra de potència que puja i baixa, has de parar-la a la zona verda per encistellar. 2 tirs si hi ha falta. Anima el resultat.
- **Tir de tres** (basat en la Rematada): clica quan l'indicador arribi al punt òptim per encistellar un triple.
- **Robada de pilota** (basat en la Robada): timing per robar la pilota en defensa.
Aquests minijocs apareixen en moments clau del partit simulat (final igualat, últims segons, possessió decisiva) i el resultat modifica el marcador. Han de tenir feedback visual (animació de cistella, confetti quan encistelles) i haptics visuals.

### PRIORITAT 1 — Sala de jocs (Xiringuito → "Bar dels Pavellons")
El joc vell té una sala amb minijocs de sort per guanyar diners/energia:
- **Ruleta del triple**: roda de la fortuna amb premis (diners, energia, sort) — versió bàsquet
- **Rasca i guanya**: rasca 3x3 amb símbols de bàsquet (pilota, cistella, triple, sabatilla...) — premis per coincidències
- **Memòria dels pavellons**: joc de memòria amb parelles de cartes de jugadors/pavellons
- Cada minijoc costa diners i té probabilitats de premi. La sala només es pot usar 1 cop per setmana (o amb cost creixent).

### PRIORITAT 1 — Col·lecció de cromos
- Cada jugador de la teva plantilla és un cromo amb la seva foto (inicial amb color), posició, stats, rareza (comú/rara/èpica segons nivell)
- Comprar sobres de cromos amb diners: 5 cromos per sobre, amb probabilitat de repetits
- Àlbum de cromos: veure els que tens, els que et falten, col·lecció completa = premi
- També cromos especials dels rivals famosos

### PRIORITAT 1 — Llegat de l'entrenador (XP i perks)
- L'entrenador guanya XP: +10 perdre, +25 jugar bé, +50 guanyar, +200 títol/ascens
- Nivells amb perks desbloquejables:
  - Nivell 2: **Ojeador** — veus el potencial amagat dels jugadors del mercat
  - Nivell 5: **Negociador** — fitxatges i renovacions un 10% més barats
  - Nivell 10: **Tàctic** — desbloqueja l'esquema "Zona 2-3" (defensa zonal)
  - Nivell 15: **Llegenda viva** — el públic omple el pavelló (taquilla +20%)
  - Nivell 20: **Immortal** — els jugadors es lesionen menys
- Pàgina de Llegat: XP actual, nivell, perks desbloquejats, històric de títols i millors temporades, "equip ideal de tota la vida" (5 jugadors amb millors stats acumulades)

### PRIORITAT 2 — Entrenament
- Cada setmana pots triar 1-2 sessions d'entrenament: tir, defensa, físic, tàctic
- Cada sessió millora lleugerament els atributs dels jugadors que hi participen, però gasta energia de la plantilla
- Els jugadors amb més minuts es cansen més; si juguen cansats, baixa el rendiment al partit

### PRIORITAT 2 — Cantera i fitxatges millorats
- **Cantera**: cada temporada apareixen 1-2 jugadors joves (16-19 anys) amb potencial alt però nivell baix; pots pujar-los al primer equip o vendre'ls
- **Mercat millorat**: llista de jugadors disponibles amb stats visibles, preu, sou demanat; fer ofertes, negociacions senzilles; fitxatges i vendes (ja hi ha una base — millora-la)
- **Renovacions**: jugadors amb contracte a punt d'acabar — renovar-los o deixar-los marxar
- **Scout**: amb el perk Ojeador veus el potencial amagat

### PRIORITAT 2 — Assoliments i trofeus
- Sistema d'assoliments: primera victòria, primer triple a l'últim segon, guanyar la lliga, 10 victòries seguides, col·lecció completa de cromos, etc.
- Notificació visual quan es desbloqueja un (toast animat)
- Pàgina d'assoliments amb progressió

### PRIORITAT 2 — Celebració i feedback visual
- **Confetti/animacions** quan guanyes un partit important o un títol (component de celebració)
- Toast/notificacions per esdeveniments importants (fitxatge, assoliment, cromo nou)
- Anècdotes divertides aleatòries entre setmanes (missatges de la premsa local, rumors de vestidor) — el joc vell té "AnecdotasModal"

### PRIORITAT 3 — Copa
- Competició eliminatòria paral·lela: Copa Catalunya, eliminatòries a partit únic, 16 equips, comença a mitja temporada
- Guanyar la copa = títol + diners + XP

### PRIORITAT 3 — Objectius de temporada dinàmics
- A més de la permanència: objectius segons el nivell del club (salvar-se, playoff, campió) que canvien els diners de final de temporada

## Requisits de qualitat (obligatoris)

1. **Els 12 tests existents han de seguir passant**: `npm test`
2. **TypeScript net**: `npm run build` sense errors
3. **UI coherent**: segueix l'estil existent (tema fosc, taronges, cards, botons). NO canviïs el disseny base — millora'l amb les noves funcionalitats.
4. **Tot el text en català** correcte (els minijocs, cromos, llegat, etc.)
5. **Persistència**: tot el nou estat s'ha de guardar al store Zustand (persist ja està configurat)
6. **Addicional**: si pots afegir animacions CSS i micro-interaccions (transicions, hover, feedback) que facin el joc "espectacular" i agradable al tacte, fes-ho.
7. **Escriu tests nous** per la lògica nova que sigui pura (cromos, llegat XP, ruleta, entrenament) al mateix estil que `motor.test.ts`
8. **Commit + push** a `main` quan acabis. Missatges de commit clars.
9. **Publica**: `CISTELLA_BASE=/cistella/ npm run build` i copia `dist/*` a `/home/aleix/news-site/cistella/` (esborra abans el contingut vell d'aquesta carpeta). Verifica que `https://noticies.solanes.xyz/cistella/` respon.
10. **No toquis la lògica del motor de partits** (src/game/motor.ts) tret que sigui estrictament necessari per integrar els minijocs — si cal, afegeix ganxos (hooks) que el partit consulti.

## Estructura suggerida

- Afegeix pestanyes noves a la navegació (ja hi ha Tauler, Plantilla, Partit, Finances). Noves: **Jocs** (sala de jocs), **Cromos**, **Llegat**, **Entrenament** (o integra entrenament dins Plantilla), **Assoliments** (o dins Llegat). No tinguis por d'afegir pestanyes, però que no siguin més de 8 en total a la barra inferior — pots fer scroll o agrupar.
- Component de celebració reutilitzable (confetti) en `src/components/`
- Minijocs en `src/components/minijocs/`
- Lògica nova de joc (cromos, llegat, ruleta...) en `src/game/` com a mòduls purs + tests

## Recordatori final

L'objectiu és que sigui UN JOC ESPECTACULAR: amb coses a fer cada setmana (entrenar, jugar minijocs, obrir sobres, mirar el mercat), amb feedback visual gratificant, i amb profunditat de llarga durada (llegat de l'entrenador, col·leccions). El jugador ha de voler tornar-hi cada dia. Fes-ho amb gust i detall — millor 4 coses ben acabades i polides que 10 a mitges.

Quan hagis acabat, respon amb un resum clar de: què has afegit, quins tests tens, i la URL verificada.
