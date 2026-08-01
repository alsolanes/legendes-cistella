// ── Anècdotes de vestidor i premsa local ──────────────────────────
import { aleatori } from './dades';
import { Partida } from './types';

const ANECDOTES_GENERIQUES = [
  'El delegat de camp assegura que la lluminària del pavelló "fa unes ombres que despisten els tiradors".',
  'Un jugador ha portat el seu gos de mascota a l\'entrenament i s\'ha convertit en l\'amulet de l\'equip.',
  'Rumors de vestidor: algú s\'ha menjat l\'entrepà del fisio i ningú confessa.',
  'La ràdio local ha dedicat deu minuts a debatre si el triple del tercer quart va ser "de motiu" o "de sort".',
  'El bar del pavelló ha estrenat un entrepà amb el nom d\'un jugador de la plantilla.',
  'Un aficionat ha demanat matrimoni a la seva parella durant el descans del partit. Ella ha dit que sí.',
  'El míster ha canviat la música dels entrenaments i ara tothom arriba cinc minuts abans.',
  'Es rumoreja que un rival ha intentat fitxar el fisioterapeuta del club. El fisio ha dit que no per res del món.',
  'La graderia s\'ha quedat sense entrepans de calamars al descans. Escàndol total a xarxes.',
  'Un jugador jove ha confessat que estudia els rivals mirant vídeos fins tard i la seva mare l\'ha renyat.',
  'El conserge del pavelló jura que la cistella visitant "té millor rebot" per raons que no sap explicar.',
  'Es parla d\'una aposta al vestidor: qui falli més tirs lliures paga els cafès un mes sencer.',
  'Un veí del pavelló ha après totes les cançons d\'animació i les canta més fort que la grada.',
  'El bus de l\'equip s\'ha aturat per un ramat d\'ovelles i han arribat just per escalfar.',
  'Un patrocinador local ha regalat mitjons de la sort a tota la plantilla "perquè funcionin els triples".',
];

export function anecdotaAleatoria(_partida: Partida): string {
  return aleatori(ANECDOTES_GENERIQUES);
}
