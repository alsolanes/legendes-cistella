import { useJoc } from '../game/store';

export function FiTemporada() {
  const partida = useJoc((s) => s.partida);
  const reiniciar = useJoc((s) => s.reiniciar);
  const novaTemporadaClub = useJoc((s) => s.novaTemporadaClub);
  if (!partida) return null;

  const filaMeu = partida.classificacio.find((f) => f.equipId === 'meu');
  const pos = filaMeu ? partida.classificacio.indexOf(filaMeu) + 1 : -1;
  const total = partida.classificacio.length;
  const campioPlayoffs = partida.playoffs?.campio === 'meu';

  const objectiuComplert =
    campioPlayoffs ||
    (partida.objectiuTemporada === 'permanencia' && pos <= 10) ||
    (partida.objectiuTemporada === 'playoffs' && pos <= 6) ||
    (partida.objectiuTemporada === 'titulo' && pos === 1);

  return (
    <div className="card resum-temporada" style={{ padding: 24 }}>
      <div style={{ fontSize: 48 }}>{campioPlayoffs ? '🏆' : pos === 1 ? '🏆' : pos <= 6 ? '🔥' : pos <= 10 ? '🛟' : '😔'}</div>
      <div className="resum-posicio">{pos}º</div>
      <div className="resum-label">de {total} equips · Temporada {partida.temporada}</div>
      {campioPlayoffs && <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--groc)', marginBottom: 8 }}>🏆 Campions dels Playoffs!</div>}
      <div style={{ fontSize: 14, marginBottom: 16 }}>
        {objectiuComplert
          ? <span style={{ color: 'var(--verd)', fontWeight: 700 }}>✅ Objectiu complert: {partida.objectiuTemporada}</span>
          : <span style={{ color: 'var(--vermell)', fontWeight: 700 }}>❌ Objectiu no complert: {partida.objectiuTemporada}</span>}
      </div>
      <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
        <button className="btn btn-primari" onClick={novaTemporadaClub}>🔄 Següent temporada</button>
        <button className="btn btn-secundari" onClick={() => useJoc.getState().setPestanya('llegat')}>Veure el llegat</button>
        <button
          className="btn btn-perill"
          style={{ fontSize: 12, padding: '8px 12px' }}
          onClick={() => { if (confirm('Segur que vols començar un club nou? Es perdrà el progrés d\'aquest club.')) reiniciar(); }}
        >
          🗑 Començar un club nou
        </button>
      </div>
    </div>
  );
}
