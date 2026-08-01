import { useJoc } from '../game/store';

export function Finances() {
  const partida = useJoc((s) => s.partida);
  const millorarPavello = useJoc((s) => s.millorarPavello);
  if (!partida) return null;

  const f = partida.finanzas;
  const costPavello = partida.pavello.nivell < 5 ? partida.pavello.preuPerNivell * partida.pavello.nivell : 0;
  const saldo = f.ingressosTemporada - f.despesesTemporada;

  return (
    <>
      <div className="card">
        <div className="card-titol"><span>Pressupost</span></div>
        <div style={{ fontSize: 34, fontWeight: 900, marginBottom: 4 }}>
          {f.pressupost.toLocaleString('ca')}€
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 12 }}>
          Saldo de la temporada: <strong style={{ color: saldo >= 0 ? 'var(--verd)' : 'var(--vermell)' }}>{saldo >= 0 ? '+' : ''}{saldo.toLocaleString('ca')}€</strong>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
          <div className="card" style={{ padding: 10, margin: 0 }}>
            <div style={{ color: 'var(--text-dim)', fontSize: 11 }}>Ingressos</div>
            <div style={{ fontWeight: 800, color: 'var(--verd)' }}>{f.ingressosTemporada.toLocaleString('ca')}€</div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 6 }}>Taquilla: {f.taquillaPerPartit.toLocaleString('ca')}€/partit</div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Patrocini: {f.patrociniAnual.toLocaleString('ca')}€/any</div>
          </div>
          <div className="card" style={{ padding: 10, margin: 0 }}>
            <div style={{ color: 'var(--text-dim)', fontSize: 11 }}>Despeses</div>
            <div style={{ fontWeight: 800, color: 'var(--vermell)' }}>{f.despesesTemporada.toLocaleString('ca')}€</div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 6 }}>
              Plantilla: {(partida.plantilla.reduce((s, j) => s + j.sou, 0)).toLocaleString('ca')}€/any
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Manteniment: 1.200€/setmana</div>
          </div>
        </div>
      </div>

      {/* Pavelló */}
      <div className="card">
        <div className="card-titol"><span>Pavelló</span><span>Nivell {partida.pavello.nivell}/5</span></div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} style={{ flex: 1, height: 8, borderRadius: 4, background: n <= partida.pavello.nivell ? 'var(--taronja)' : 'var(--fons)' }} />
          ))}
        </div>
        <div style={{ fontSize: 13, marginBottom: 4 }}>
          <strong>{partida.pavello.nom}</strong>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 12 }}>
          Capacitat: {partida.pavello.capacitat.toLocaleString('ca')} espectadors · Taquilla +{partida.pavello.nivell * 600}€/partit
        </div>
        {partida.pavello.nivell < 5 ? (
          <button
            className="btn btn-primari btn-blok"
            onClick={() => millorarPavello()}
            disabled={f.pressupost < costPavello}
            style={{ opacity: f.pressupost < costPavello ? 0.5 : 1 }}
          >
            🏟 Millorar pavelló ({costPavello.toLocaleString('ca')}€) → Nivell {partida.pavello.nivell + 1}
          </button>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--verd)', fontWeight: 700 }}>🏟 Pavelló al màxim nivell!</div>
        )}
      </div>

      {/* Objectiu */}
      <div className="card">
        <div className="card-titol"><span>Objectiu de temporada</span></div>
        <div style={{ fontSize: 14 }}>
          {partida.objectiuTemporada === 'permanencia' && '🛟 Permanència: acabar entre els 10 primers.'}
          {partida.objectiuTemporada === 'playoffs' && '🔥 Playoffs: acabar entre els 6 primers.'}
          {partida.objectiuTemporada === 'titulo' && '🏆 Títol: quedar campió de la lliga.'}
        </div>
      </div>
    </>
  );
}
