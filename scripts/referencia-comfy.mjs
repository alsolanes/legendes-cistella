import { readFileSync } from 'fs';
import { execSync } from 'child_process';

// 1. Envia el prompt a ComfyUI
const wf = JSON.parse(readFileSync('/home/aleix/ComfyUI/api_workflow_flux2_klein_txt2img.json', 'utf8'));
for (const [id, node] of Object.entries(wf)) {
  if (node.class_type === 'CLIPTextEncode' && node.inputs.text === 'prompt_here') {
    wf[id].inputs.text = 'basketball arena interior, warm orange court lighting, dramatic wide shot, empty wooden parquet court with center logo, cinematic, high detail';
  }
  if (node.class_type === 'EmptyFlux2LatentImage') {
    wf[id].inputs.width = 1024; wf[id].inputs.height = 1024;
  }
}
const resp = await fetch('http://127.0.0.1:8188/prompt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: wf, client_id: 'hermes-prova' }),
});
const data = await resp.json();
const pid = data.prompt_id;
console.log('prompt_id:', pid);

// 2. Espera a que acabi (polling cada 3s, màxim 60s)
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let done = false;
for (let i = 0; i < 20 && !done; i++) {
  await sleep(3000);
  const h = await (await fetch(`http://127.0.0.1:8188/history/${pid}`)).json();
  const entry = h[pid];
  if (entry && entry.status && entry.status.status_str === 'success') {
    done = true;
    for (const [node_id, out] of Object.entries(entry.outputs || {})) {
      for (const img of out.images || []) {
        console.log(`OK imatge: ${img.filename} subfolder=${img.subfolder} type=${img.type}`);
      }
    }
  } else if (entry && entry.status && entry.status.status_str === 'error') {
    console.log('ERROR:', JSON.stringify(entry.status));
    done = true;
  }
}
if (!done) console.log('TIMEOUT esperant la generacio');
