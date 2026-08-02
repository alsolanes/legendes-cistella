// Genera l'art del joc amb ComfyUI (FLUX.2-klein, local a 127.0.0.1:8188).
// Ús: node scripts/genera-imatges.mjs
import { readFileSync, copyFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ARREL = join(__dirname, '..');
const ASSETS = join(ARREL, 'src', 'assets');
const WORKFLOW_PATH = '/home/aleix/ComfyUI/api_workflow_flux2_klein_txt2img.json';
const COMFY_OUT = '/home/aleix/ComfyUI/output';
const COMFY_URL = 'http://127.0.0.1:8188';

if (!existsSync(ASSETS)) mkdirSync(ASSETS, { recursive: true });

const NEGATIU = 'text, watermark, letters, words, signature, blurry, deformed, extra limbs, bad anatomy, low quality';

const AVATAR_BASE = (genere, pell, cabell) =>
  `sporty illustration portrait of a young ${genere} basketball player, ${pell} skin tone, ${cabell}, wearing orange basketball jersey, confident smile, dramatic rim lighting, vibrant orange and navy blue background, comic book style, high detail, head and shoulders`;

const IMATGES = [
  // ── Avatars (12) ──
  { nom: 'avatar-m1.png', prompt: AVATAR_BASE('male', 'light', 'short black athletic hair'), w: 1024, h: 1024 },
  { nom: 'avatar-m2.png', prompt: AVATAR_BASE('male', 'dark', 'short curly hair'), w: 1024, h: 1024 },
  { nom: 'avatar-m3.png', prompt: AVATAR_BASE('male', 'olive', 'buzz cut'), w: 1024, h: 1024 },
  { nom: 'avatar-m4.png', prompt: AVATAR_BASE('male', 'medium brown', 'short wavy hair'), w: 1024, h: 1024 },
  { nom: 'avatar-m5.png', prompt: AVATAR_BASE('male', 'light', 'short fade haircut with beard'), w: 1024, h: 1024 },
  { nom: 'avatar-m6.png', prompt: AVATAR_BASE('male', 'dark', 'short afro'), w: 1024, h: 1024 },
  { nom: 'avatar-f1.png', prompt: AVATAR_BASE('female', 'light', 'short ponytail'), w: 1024, h: 1024 },
  { nom: 'avatar-f2.png', prompt: AVATAR_BASE('female', 'dark', 'short natural curly hair'), w: 1024, h: 1024 },
  { nom: 'avatar-f3.png', prompt: AVATAR_BASE('female', 'olive', 'short bob haircut'), w: 1024, h: 1024 },
  { nom: 'avatar-f4.png', prompt: AVATAR_BASE('female', 'medium brown', 'braided hair tied back'), w: 1024, h: 1024 },
  { nom: 'avatar-f5.png', prompt: AVATAR_BASE('female', 'light', 'short pixie cut'), w: 1024, h: 1024 },
  { nom: 'avatar-f6.png', prompt: AVATAR_BASE('female', 'dark', 'high ponytail athletic hair'), w: 1024, h: 1024 },
  // ── Cromos (3) ──
  { nom: 'cromo-comu.png', prompt: 'basketball trading card background art, silver gray metallic gradient, geometric basketball pattern, subtle, no text, clean, professional', w: 768, h: 1024 },
  { nom: 'cromo-rara.png', prompt: 'basketball trading card background art, blue metallic gradient, glowing basketball silhouette, lightning accents, no text, dynamic, professional', w: 768, h: 1024 },
  { nom: 'cromo-epica.png', prompt: 'basketball trading card background art, gold and orange metallic gradient, radiant trophy and basketball, sparkles, no text, epic, legendary, professional', w: 768, h: 1024 },
  // ── Fons (4) ──
  { nom: 'fons-pavello.png', prompt: 'basketball arena interior, warm orange court lighting, dramatic wide shot, empty wooden parquet court with center circle, cinematic, high detail', w: 1024, h: 640 },
  { nom: 'fons-nova-partida.png', prompt: 'dark moody basketball gym background, blurred court in background, dramatic spotlight, orange and deep navy tones, cinematic vignette, no text', w: 1024, h: 640 },
  { nom: 'fons-capcalera.png', prompt: 'abstract basketball texture background, dark navy with orange paint strokes and basketball lines, minimalist, no text, wide banner', w: 1536, h: 448 },
  { nom: 'fons-celebracio.png', prompt: 'confetti explosion over basketball court at night, golden and orange confetti, dramatic celebration atmosphere, cinematic, no text', w: 1024, h: 640 },
  // ── Sobre de cromos (1, opcional) ──
  { nom: 'sobre-cromos.png', prompt: 'mysterious pack of basketball trading cards, sealed foil pack, orange and blue design, dramatic lighting, no text, product shot', w: 768, h: 1024 },
  // ── Escuts de club (6, opcional) ──
  { nom: 'escut-llop.png', prompt: 'minimalist basketball team logo crest, wolf, shield shape, orange and navy colors, flat vector style, clean, no text', w: 1024, h: 1024 },
  { nom: 'escut-aliga.png', prompt: 'minimalist basketball team logo crest, eagle, shield shape, orange and navy colors, flat vector style, clean, no text', w: 1024, h: 1024 },
  { nom: 'escut-gegant.png', prompt: 'minimalist basketball team logo crest, giant, shield shape, orange and navy colors, flat vector style, clean, no text', w: 1024, h: 1024 },
  { nom: 'escut-mamut.png', prompt: 'minimalist basketball team logo crest, mammoth, shield shape, orange and navy colors, flat vector style, clean, no text', w: 1024, h: 1024 },
  { nom: 'escut-os.png', prompt: 'minimalist basketball team logo crest, bear, shield shape, orange and navy colors, flat vector style, clean, no text', w: 1024, h: 1024 },
  { nom: 'escut-lleo.png', prompt: 'minimalist basketball team logo crest, lion, shield shape, orange and navy colors, flat vector style, clean, no text', w: 1024, h: 1024 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function carregaWorkflow(prompt, w, h, seed) {
  const wf = JSON.parse(readFileSync(WORKFLOW_PATH, 'utf8'));
  for (const node of Object.values(wf)) {
    if (node.class_type === 'CLIPTextEncode') {
      node.inputs.text = `${prompt}. Negative: ${NEGATIU}`;
    }
    if (node.class_type === 'EmptyFlux2LatentImage') {
      node.inputs.width = w;
      node.inputs.height = h;
    }
    if (node.class_type === 'RandomNoise') {
      node.inputs.noise_seed = seed;
    }
  }
  return wf;
}

async function generaUnaVegada(def, seed) {
  const wf = carregaWorkflow(def.prompt, def.w, def.h, seed);
  const resp = await fetch(`${COMFY_URL}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: wf, client_id: 'joc-cistella' }),
  });
  if (!resp.ok) throw new Error(`POST /prompt ha fallat: ${resp.status} ${await resp.text()}`);
  const { prompt_id } = await resp.json();

  for (let i = 0; i < 40; i++) {
    await sleep(3000);
    const h = await (await fetch(`${COMFY_URL}/history/${prompt_id}`)).json();
    const entry = h[prompt_id];
    if (!entry || !entry.status) continue;
    if (entry.status.status_str === 'success') {
      for (const out of Object.values(entry.outputs || {})) {
        for (const img of out.images || []) {
          const subfolder = img.subfolder || '';
          return join(COMFY_OUT, subfolder, img.filename);
        }
      }
      throw new Error('success sense imatges a la sortida');
    }
    if (entry.status.status_str === 'error') {
      throw new Error(`ComfyUI error: ${JSON.stringify(entry.status)}`);
    }
  }
  throw new Error('timeout esperant la generació (120s)');
}

async function generaImatge(def, index) {
  const seedBase = 1000 + index;
  for (let intent = 1; intent <= 2; intent++) {
    try {
      const seed = intent === 1 ? seedBase : seedBase + 777;
      console.log(`[${index + 1}/${IMATGES.length}] Generant ${def.nom} (intent ${intent}, seed ${seed})...`);
      const origen = await generaUnaVegada(def, seed);
      const desti = join(ASSETS, def.nom);
      copyFileSync(origen, desti);
      console.log(`  OK -> ${desti}`);
      return { nom: def.nom, ok: true };
    } catch (err) {
      console.log(`  ERROR (intent ${intent}): ${err.message}`);
      if (intent === 2) return { nom: def.nom, ok: false, error: err.message };
    }
  }
}

const resultats = [];
for (let i = 0; i < IMATGES.length; i++) {
  resultats.push(await generaImatge(IMATGES[i], i));
}

console.log('\n── Resum ──');
const ok = resultats.filter((r) => r.ok);
const fail = resultats.filter((r) => !r.ok);
console.log(`OK: ${ok.length}/${resultats.length}`);
if (fail.length) {
  console.log('Fallades:');
  for (const f of fail) console.log(`  - ${f.nom}: ${f.error}`);
}
