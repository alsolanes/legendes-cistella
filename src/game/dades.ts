// ── Dades de noms i pobles catalans ────────────────────────────

export const NOMS_MASCULINS = [
  'Pol', 'Arnau', 'Marc', 'Jordi', 'Pau', 'Adrià', 'Guillem', 'Èric', 'Àlex', 'Sergi',
  'Joel', 'Jan', 'Nil', 'Gerard', 'Oriol', 'Xavier', 'Roger', 'Albert', 'David', 'Toni',
  'Ferran', 'Lluc', 'Biel', 'Quim', 'Isaac', 'Martí', 'Roc', 'Cesc', 'Iu', 'Berto',
];

export const NOMS_FEMENINS = [
  'Laia', 'Clàudia', 'Marina', 'Júlia', 'Aina', 'Carla', 'Marta', 'Núria', 'Anna', 'Eva',
  'Sònia', 'Ivet', 'Ona', 'Mireia', 'Cristina', 'Laura', 'Gemma', 'Neus', 'Sara', 'Txell',
];

export const COGNOMS = [
  'Font', 'Serra', 'Roca', 'Vidal', 'Puig', 'Soler', 'Ferrer', 'Rius', 'Pons', 'Vila',
  'Rovira', 'Gelabert', 'Torrent', 'Camps', 'Prat', 'Costa', 'Muntané', 'Estruch', 'Bachs', 'Garriga',
  'Vilanova', 'Pujol', 'Marquès', 'Bardera', 'Tordera', 'Bofill', 'Ventura', 'Sala', 'Grau', 'Casals',
  'Argelaguet', 'Bonet', 'Canal', 'Duran', 'Escoda', 'Fàbregas', 'Gomis', 'Homs', 'Iglesias', 'Junyent',
  'Llobet', 'Mestre', 'Navarro', 'Oliveras', 'Palau', 'Queralt', 'Rafols', 'Salvans', 'Teixidor', 'Vilaró',
];

export const POBLES = [
  'Solsona', 'Manresa', 'Vic', 'Figueres', 'Olot', 'Girona', 'Lleida', 'Tarragona', 'Reus', 'Tortosa',
  'Valls', 'Igualada', 'Mataró', 'Granollers', 'Sabadell', 'Terrassa', 'Badalona', 'Sant Cugat', 'Vilanova i la Geltrú', 'El Vendrell',
  'Cambrils', 'Amposta', 'La Seu d Urgell', 'Berga', 'Puigcerdà', 'Ripoll', 'Banyoles', 'Palafrugell', 'Blanes', 'Lloret de Mar',
  'Sant Feliu de Guíxols', 'Palamós', 'Sant Joan Despí', 'Cornellà', 'Mollet', 'Rubí', 'Cerdanyola', 'Santa Coloma', 'Calella', 'Cardedeu',
  'Arenys de Mar', 'Canet de Mar', 'Tordera', 'Sant Celoni', 'La Garriga', 'Vic', 'Moià', 'Navarcles', 'Sallent', 'Artés',
];

export const NOMS_CLUBS = [
  'Solsona', 'Berguedà', 'Osona', 'Garrotxa', 'Pla de l Estany', 'Gironès', 'Selva', 'Baix Empordà',
  'Maresme', 'Vallès Oriental', 'Vallès Occidental', 'Bages', 'Anoia', 'Segarra', 'Urgell', 'Pla d Urgell',
  'Segrià', 'Garrigues', 'Baix Camp', 'Tarragonès', 'Baix Penedès', 'Baix Ebre', 'Montsià', 'Ribera d Ebre',
];

export const SUFIXOS_CLUB = ['CB', 'BC', 'Bàsquet Club', 'Club Bàsquet', 'Esportiu'];

export const CIUTATS_RIVALS = [
  'Barcelona', 'Madrid', 'València', 'Bilbao', 'Sevilla', 'Màlaga', 'Saragossa', 'Vigo',
  'Santander', 'Las Palmas', 'Múrcia', 'Alacant', 'Pontevedra', 'Badajoz', 'Logronyo', 'Pamplona',
];

export const NOMS_RIVALS = [
  'Mariners', 'Titans', 'Lleons', 'Àguiles', 'Falcons', 'Llops', 'Òssos', 'Escorpins',
  'Cobres', 'Voltors', 'Dracs', 'Fènix', 'Gegants', 'Nans', 'Taurons', 'Mamuts',
];

export function aleatori<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function entre(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function nomAleatori(genere?: 'm' | 'f'): string {
  const llista = genere === 'm' ? NOMS_MASCULINS : genere === 'f' ? NOMS_FEMENINS : (Math.random() < 0.5 ? NOMS_MASCULINS : NOMS_FEMENINS);
  return `${aleatori(llista)} ${aleatori(COGNOMS)}`;
}
