import { CATALUNYA_COMARQUES } from '../data/catalunyaMapData';
import { CATALUNYA_TOWN_POINTS } from '../data/catalunyaTownPoints';
import locations from '../data/locations.json';

export const normalizeCatalanKey = (value: string): string =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/l'/gi, 'l ')
    .replace(/d'/gi, 'd ')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toLowerCase();

export const getTownPoint = (town?: string) => {
  if (!town) return null;
  const key = normalizeCatalanKey(town);
  return CATALUNYA_TOWN_POINTS.find((item) => item.key === key) ?? null;
};

// locations.json fa servir la forma "Nom, article" (Palma de Cervelló, la) mentre que
// catalunyaTownPoints.ts fa servir "Article Nom" (la Palma de Cervelló). Comparem ignorant
// l'article de tots dos costats perquè coincideixin igualment.
const ARTICLES = new Set(['el', 'la', 'els', 'les', 'l']);

function clauPobleSenseArticle(nom: string): string {
  const paraules = normalizeCatalanKey(nom).split(' ').filter(Boolean);
  if (paraules.length > 1 && ARTICLES.has(paraules[0])) paraules.shift();
  else if (paraules.length > 1 && ARTICLES.has(paraules[paraules.length - 1])) paraules.pop();
  return paraules.join(' ');
}

const TOWN_POINT_PER_KEY_SENSE_ARTICLE = (() => {
  const map = new Map<string, (typeof CATALUNYA_TOWN_POINTS)[number]>();
  for (const point of CATALUNYA_TOWN_POINTS) map.set(clauPobleSenseArticle(point.name), point);
  return map;
})();

/** Com getTownPoint, però tolera que l'article estigui davant o darrere del nom */
export const getTownPointFlexible = (town?: string) => {
  const directe = getTownPoint(town);
  if (directe) return directe;
  if (!town) return null;
  return TOWN_POINT_PER_KEY_SENSE_ARTICLE.get(clauPobleSenseArticle(town)) ?? null;
};

const ARTICLE_DISPLAY: Record<string, string> = { el: 'el', la: 'la', els: 'els', les: 'les', "l'": "l'" };

/** Passa "Nom, article" (format locations.json) a "Article Nom" per mostrar-ho de forma natural */
export const formatNomPoble = (nom: string): string => {
  const m = nom.match(/^(.*),\s*(l'|el|la|els|les)$/i);
  if (!m) return nom;
  const article = ARTICLE_DISPLAY[m[2].toLowerCase()] ?? m[2];
  const separador = article.endsWith("'") ? '' : ' ';
  return `${article}${separador}${m[1]}`;
};

const COMARCA_BY_TOWN = (() => {
  const map = new Map<string, Set<string>>();
  const raw = locations as Record<string, Record<string, string[]>>;
  for (const comarques of Object.values(raw || {})) {
    for (const [comarcaName, towns] of Object.entries(comarques || {})) {
      const comarcaKey = normalizeCatalanKey(comarcaName);
      for (const town of towns || []) {
        const townKey = normalizeCatalanKey(town);
        if (!map.has(townKey)) map.set(townKey, new Set<string>());
        map.get(townKey)?.add(comarcaKey);
      }
    }
  }
  return map;
})();

export const townBelongsToComarca = (town?: string, comarca?: string): boolean => {
  if (!town || !comarca) return false;
  const townKey = normalizeCatalanKey(town);
  const comarcaKey = normalizeCatalanKey(comarca);
  const comarques = COMARCA_BY_TOWN.get(townKey);
  return Boolean(comarques?.has(comarcaKey));
};

export const getComarquesForTown = (town?: string): string[] => {
  if (!town) return [];
  const townKey = normalizeCatalanKey(town);
  const comarcaKeys = Array.from(COMARCA_BY_TOWN.get(townKey) || []);
  if (!comarcaKeys.length) return [];

  return comarcaKeys
    .map((comarcaKey) => CATALUNYA_COMARQUES.find((item) => normalizeCatalanKey(item.name) === comarcaKey)?.name || null)
    .filter((value): value is string => Boolean(value));
};

export const isCatalunyaTown = (town?: string): boolean => getComarquesForTown(town).length > 0;

export const resolveCatalunyaComarca = (town?: string, comarca?: string): string => {
  if (townBelongsToComarca(town, comarca)) return String(comarca || '');
  const fallback = getComarquesForTown(town)[0];
  return fallback || String(comarca || '');
};

export const getComarcaCenter = (comarca?: string) => {
  if (!comarca) return null;
  return CATALUNYA_COMARQUES.find((item) => item.name === comarca)?.center ?? null;
};

// "Aran" (catalunya.json/locations.json) i "Val d'Aran" (catalunyaMapData.ts, el nom oficial de
// la comarca al mapa SVG) són la mateixa comarca amb noms diferents als dos orígens de dades.
const ALIAS_COMARCA: Record<string, string> = { aran: 'val d aran' };

function clauComarca(nom: string): string {
  const k = normalizeCatalanKey(nom);
  return ALIAS_COMARCA[k] ?? k;
}

const POBLES_PER_COMARCA = (() => {
  const map = new Map<string, string[]>();
  const raw = locations as Record<string, Record<string, string[]>>;
  for (const comarques of Object.values(raw || {})) {
    for (const [comarcaName, towns] of Object.entries(comarques || {})) {
      map.set(clauComarca(comarcaName), towns);
    }
  }
  return map;
})();

/** Pobles reals d'una comarca (pel nom tal com apareix a CATALUNYA_COMARQUES) */
export const poblesDeComarca = (comarca?: string): string[] => {
  if (!comarca) return [];
  return POBLES_PER_COMARCA.get(clauComarca(comarca)) ?? [];
};
