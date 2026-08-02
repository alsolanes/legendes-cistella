// Genera 6 avatars addicionals amb ComfyUI (FLUX.2-klein, local a 127.0.0.1:8188).
// Mateixa recepta que scripts/genera-imatges.mjs: 3 masculins + 3 femenins amb aspecte variat.
// Ús: node scripts/genera-avatars-extra.mjs
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
  { nom: 'avatar-m7.png', prompt: AVATAR_BASE('male', 'dark', 'completely bald head'), w: 1024, h: 1024 },
  { nom: 'avatar-m8.png', prompt: AVATAR_BASE('male', 'light', 'long hair tied back in a bun'), w: 1024, h: 1024 },
  { nom: 'avatar-m9.png', prompt: AVATAR_BASE('male', 'olive', 'short hair and a thick full beard'), w: 1024, h: 1024 },
  { nom: 'avatar-f7.png', prompt: AVATAR_BASE('female', 'dark', 'shaved buzzed head'), w: 1024, h: 1024 },
  { nom: 'avatar-f8.png', prompt: AVATAR_BASE('female', 'light', 'very long straight hair flowing past the shoulders'), w: 1024, h: 1024 },
  { nom: 'avatar-f9.png', prompt: AVATAR_BASE('female', 'medium brown', 'large voluminous curly afro hair'), w: 1024, h: 1024 },
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
    body: JSON.stringify({ prompt: wf, client_id: 'joc-cistella-avatars-extra' }),
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
  const seedBase = 2000 + index;
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
