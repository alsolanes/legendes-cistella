# BRIEFING RONDA 2 — ICONES PROFESSIONALS + ART GENERAT AMB COMFYUI

El joc funciona però l'usuari diu que "és massa bàsic. No hi ha icones. Només emojis sense personalitat". Aquesta ronda té DOS objectius:

1. **Substituir TOTS els emojis per icones SVG professionals** (lucide-react + icones custom de bàsquet)
2. **Generar ART REAL amb ComfyUI** (model d'imatges local a la Strix Halo) per donar personalitat visual: avatars de jugadors, art de cromos, fons.

## Context del projecte

- **Path**: `/home/aleix/legendes-cistella/`
- **Stack**: React 18 + TS + Vite 6 + Zustand + Vitest
- **Publicació**: `CISTELLA_BASE=/cistella/ npm run build` → copiar `dist/*` a `/home/aleix/news-site/cistella/`
- **Git**: repo `alsolanes/legendes-cistella`, branch main. Commit + push al final.
- **Idioma**: TOT en català. Codi en català on tingui sentit.
- **Tests**: `npm test` — han de seguir verds (72 tests).
- **Build**: `npm run build` net (tsc + vite).

## FASE 1 — ICONES (OBLIGATÒRIA, 100% dels emojis)

### Instal·la lucide-react
```bash
npm install lucide-react
```
`lucide-react` té icones d'estil línia (stroke 2px) que donen aspecte professional.

### Icònica custom de bàsquet
Crea `src/components/icones.tsx` amb un set d'icones SVG inline **en el mateix estil que lucide** (stroke 2px, `stroke="currentColor"`, fill none, viewBox 24x24, `strokeLinecap="round" strokeLinejoin="round"`):
- `IconPilota` (pilota de bàsquet amb les línies)
- `IconCistella` (cèrcol amb xarxa)
- `IconTriple` (pilota + arc de 3 punts)
- `IconRebot`
- `IconPavello` (edifici/pavelló esportiu)
- `IconSobre` (sobre de cromos)
- `IconCromo`
- `IconEntrenador` (xiulet)
- `IconTitul` (trofeu)
- `IconRuleta`, `IconRasca`, `IconMemoria` (per la sala de jocs)

Dissenya-les tu amb paths SVG senzills però ben proporcionats — mira com fa lucide les seves icones (línies netes, corbes suaus) i imita-ho.

### On canviar TOTS els emojis
Aquests fitxers tenen emojis (inventari fet):

| Fitxer | # emojis | Què cal substituir |
|---|---|---|
| `src/components/Pestanyes.tsx` | 12 | 📊 🏀 📅 🏋️ 💰 🍻 📖 🎖️ 🗺️ — cada pestanya amb la seva icona lucide/custom |
| `src/components/Plantilla.tsx` | 20 | 🛡 (defensa), ⭐, ➕, 🔄, etc. |
| `src/components/Jocs.tsx` | 11 | 🎡 🎫 🧠 🍻 (Bar dels Pavellons) |
| `src/components/Finances.tsx` | 11 | 💰 💸 📈 🏟 🛟 etc. |
| `src/components/FiTemporada.tsx` | 10 | 🏆 🎉 🥇 etc. |
| `src/components/Tauler.tsx` | 9 | 📊 🏟 ✈️ 📅 etc. |
| `src/components/NovaPartida.tsx` | 8 | 🗺 🚀 🏀 etc. |
| `src/components/minijocs/*.tsx` | 10 | 🎯 🏀 ✅ ❌ etc. |
| `src/components/Playoffs.tsx` | 4 | 🏆 🥇 |
| `src/components/Cromos.tsx` | 4 | 📦 📖 ⭐ |
| `src/components/Partit.tsx` | 3 | 📅 🏀 |
| `src/components/Llegat.tsx` | 3 | 🎖 ⭐ |
| `src/components/Celebracio.tsx` | 3 | 🎉 |
| `src/components/Entrenament.tsx` | 2 | 🏋️ |
| `src/components/AnecdotaModal.tsx` | 1 | 📰 |
| `src/components/minijocs/BarraPotencia.tsx` | 1 | |

**Regles de la FASE 1:**
- Cada emoji es substitueix per una icona **semànticament correcta** (no la primera que trobis). Ex: defensa → Shield, atac → Target/Flame, taquilla → Ticket, patrocini → Handshake (si existeix a lucide) o Briefcase, pavelló → IconPavello.
- Les icones hereten el color del context (`currentColor`); si cal color específic (ex. taronja), aplica'l amb CSS, no hardcoded hex en l'atribut.
- Les pestanyes: icona **+** text, amb espai. `lucide-react` exporta components; els pots fer `<LayoutDashboard size={16} />`.
- **No deixis NI UN emoji**: al final, `grep -rP '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]' src --include="*.tsx"` ha de donar 0 resultats (excepte, si cal, al README).
- La UI ha de quedar MÉS professional que abans, no igual. Puja el nivell: les icones petites (16px) als botons de pestanya, 18-20px en accions.

## FASE 2 — ART GENERAT AMB COMFYUI (ALTA PRIORITAT)

### Com funciona (recepta VERIFICADA a la Strix Halo)
ComfyUI corre a `http://127.0.0.1:8188` amb el model **FLUX.2-klein 4B** (~15-20s per imatge 1024×1024). Workflow: `/home/aleix/ComfyUI/api_workflow_flux2_klein_txt2img.json` (API format).

Script de referència (funciona, verificat): `/tmp/prova-comfy.mjs` — llegeix el workflow, injecta prompt a node 4 (`CLIPTextEncode`) i width/height a node 5 (`EmptyFlux2LatentImage`), fa POST a `/prompt`, fa polling a `/history/{id}` fins a `status_str === "success"`, i les imatges apareixen a `/home/aleix/ComfyUI/output/`.

Resum del flux per imatge:
1. Carrega el workflow JSON
2. Node 4 (`CLIPTextEncode`): posa el teu prompt a `inputs.text`
3. Node 5 (`EmptyFlux2LatentImage`): posa `inputs.width`/`inputs.height`
4. POST `{prompt: workflow, client_id: "joc-cistella"}` a `/prompt` → obtens `prompt_id`
5. Polling cada 3s a `/history/{prompt_id}` fins `status.status_str === "success"`
6. Copia el PNG de `/home/aleix/ComfyUI/output/<filename>` a `src/assets/`

**Fes un script propi** `scripts/genera-imatges.mjs` (o .ts) que faci totes les generacions en seqüència amb els prompts següents.

### Imatges a generar (màxim 26 — no passis de 26 o trigaràs massa)

**AVATARS DE JUGADORS — 12 imatges** (assignar-los aleatòriament als jugadors generats):
Retrats en estil còmic/il·lustració esportiva, fons de gradient taronja/blau fosc, sense text. Prompt base: "sporty illustration portrait of a young [MALE|FEMALE] basketball player, [skin tone variat], short athletic hair, wearing orange basketball jersey, confident smile, dramatic rim lighting, vibrant orange and navy blue background, comic book style, high detail, head and shoulders". 6 masculins + 6 femenins amb variacions de pell i cabell.

**ART DE CROMOS — 3 imatges** (fons per raresa):
- `cromo-comu.png`: "basketball trading card background art, silver gray metallic gradient, geometric basketball pattern, subtle, no text, clean, professional"
- `cromo-rara.png`: "basketball trading card background art, blue metallic gradient, glowing basketball silhouette, lightning accents, no text, dynamic, professional"
- `cromo-epica.png`: "basketball trading card background art, gold and orange metallic gradient, radiant trophy and basketball, sparkles, no text, epic, legendary, professional"

**FONS — 4 imatges:**
- `fons-pavello.png`: "basketball arena interior, warm orange court lighting, dramatic wide shot, empty wooden parquet court with center circle, cinematic, high detail" (ja verificat — torna'l a generar amb un seed diferent si vols variar)
- `fons-nova-partida.png`: "dark moody basketball gym background, blurred court in background, dramatic spotlight, orange and deep navy tones, cinematic vignette, no text"
- `fons-capcalera.png`: "abstract basketball texture background, dark navy with orange paint strokes and basketball lines, minimalist, no text, wide banner"
- `fons-celebracio.png`: "confetti explosion over basketball court at night, golden and orange confetti, dramatic celebration atmosphere, cinematic, no text"

**PESTANYES DE CROMOS — 1 imatge** (opcional): "mysterious pack of basketball trading cards, sealed foil pack, orange and blue design, dramatic lighting, no text, product shot"

**PORTADES DE CLUB — 6 imatges** (opcional, si no passes de 26): escuts/crests genèrics de bàsquet en diferents estils (llop, àliga, gegant, mamut, òssos, lleons) que els clubs rivals poden usar: "minimalist basketball team logo crest, [ANIMAL], shield shape, orange and navy colors, flat vector style, clean, no text".

### Com integrar les imatges al joc
- Les imatges van a `src/assets/` (o `public/assets/` si les necessites com a URL directa — decideix tu; amb Vite, `import img from '../assets/x.png'` funciona i fa hash).
- **Avatars**: al generador de jugadors (`src/game/generador.ts`), assigna a cada jugador un `avatar: string` (path de la imatge) — alterna entre els 12 avatars de forma pseudoaleatòria (basada en l'índex o el seed, no Math.random pur, perquè els tests siguin deterministes si cal). Mostra'ls a Plantilla (fitxa de jugador) i a Cromos (fons de la carta + avatar).
- **Cromos**: la carta mostra l'avatar del jugador sobre el fons de la raresa corresponent.
- **Fons**: `fons-pavello` al partit (rere el marcador), `fons-nova-partida` a la pantalla de Nova Partida, `fons-capcalera` a la capçalera (subtil, amb overlay per llegir el text), `fons-celebracio` a la celebració.
- Si una imatge fa el text il·legible, posa un overlay fosc (`linear-gradient(rgba(11,14,20,0.7), rgba(11,14,20,0.7))`) per sobre.

### REGLES FASE 2
- **Màxim 26 imatges** — prioritza els 12 avatars + 3 cromos + 4 fons = 19. Les 6 portades de club i el sobre de cromos són extra si tens marge.
- Si una generació falla (timeout, error), **no la repeteixis infinitament**: intenta-la 1 cop més amb seed diferent; si falla, segueix amb la següent i reporta-ho.
- Prompts EN ANGLÈS (el model respon millor).
- No posis TEXT a les imatges (els models de difusió escriuen malament).
- Guarda també un `src/assets/README.md` llistant quina imatge és quina.

## REQUISITS OBLIGATORIS

1. `npm test` — els 72 tests han de seguir verds. Si alguna cosa del motor canvia (ex. afegir `avatar` al Jugador), actualitza els tests si cal però NO els facis passar amb hacks.
2. `npm run build` net (tsc --noEmit && vite build).
3. **Zero emojis** a la UI (`grep` de verificació).
4. Tot en català.
5. La UI ha de quedar **visiblement més professional** — abans (emojis) vs després (icones) ha de ser un canvi notable.
6. Commit + push a main. Després: `CISTELLA_BASE=/cistella/ npm run build`, esborra `/home/aleix/news-site/cistella/*`, copia `dist/*`, verifica `curl -s -o /dev/null -w "%{http_code}" https://noticies.solanes.xyz/cistella/` = 200.
7. Verifica al navegador (pots usar `npx playwright` o el que tinguis a mà): Nova Partida amb el fons nou, Pestanyes amb icones, Plantilla amb avatars, Cromos amb l'art nou, Partit amb el fons de pavelló.
8. **Millor 15 imatges ben integrades que 26 mal penjades.** La integració (on es mostren, com es veuen) val més que la quantitat.

Quan acabis, resumeix: quants emojis substituïts, quantes imatges generades i integrades, resultats dels tests, i URL verificada.
