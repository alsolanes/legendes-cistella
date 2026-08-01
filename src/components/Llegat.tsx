import { useJoc } from '../game/store';
import { equipIdealHistoric, PERKS, xpPerNivell, xpPerSeguentNivell } from '../game/llegat';
import { calcularQuimica } from '../game/contractes';
import { ASSOLIMENTS } from '../game/assoliments';

export function Llegat() {
  const partida = useJoc((s) => s.partida);
  if (!partida) return null;

  const { llegat } = partida;
  const xpNivellActual = llegat.nivell <= 1 ? 0 : xpPerNivell(llegat.nivell);
  const xpProperNivell = xpPerSeguentNivell(llegat.nivell);
  const progres = Math.max(0, Math.min(100, ((llegat.xp - xpNivellActual) / Math.max(1, xpProperNivell - xpNivellActual)) * 100));
  const quimica = calcularQuimica(partida);
  const equipIdeal = equipIdealHistoric(llegat);

  return (
    <>
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40 }}>🎖️</div>
        <h2 style={{ fontSize: 18, margin: '4px 0 2px' }}>Llegat de l&apos;entrenador</h2>
        <div style={{ fontSize: 30, fontWeight: 900, color: 'var(--taronja)' }}>Nivell {llegat.nivell}</div>
        <div className="xp-barra"><div style={{ width: `${progres}%` }} /></div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{llegat.xp.toLocaleString('ca')} XP · {Math.max(0, xpProperNivell - llegat.xp).toLocaleString('ca')} XP pel nivell {llegat.nivell + 1}</div>
      </div>

      <div className="card">
        <div className="card-titol"><span>Perks</span></div>
        {PERKS.map((p) => {
          const desbloquejat = llegat.perks.includes(p.id);
          return (
            <div key={p.id} className={`perk-fila ${desbloquejat ? '' : 'blocat'}`}>
              <div className="perk-emoji">{p.emoji}</div>
              <div className="perk-info">
                <strong>{p.nom} {!desbloquejat && `(nivell ${p.nivell})`}</strong>
                <span>{p.descripcio}</span>
              </div>
              {desbloquejat && <span className="badge" style={{ background: 'rgba(61,220,151,0.15)', color: 'var(--verd)' }}>ACTIU</span>}
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="card-titol"><span>Química de vestidor</span><span>{quimica}/100</span></div>
        <div className="quimica-barra"><div style={{ width: `${quimica}%` }} /></div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 8 }}>
          {quimica >= 70 ? 'El vestidor està molt unit.' : quimica >= 40 ? 'L\'ambient és correcte.' : 'Hi ha tensió al vestidor: massa fitxatges o moral baixa.'}
        </div>
      </div>

      {llegat.titols.length > 0 && (
        <div className="card">
          <div className="card-titol"><span>Palmarès</span></div>
          {llegat.titols.map((t, i) => (
            <div key={i} className="hist-item">
              <span>🏆 {t.descripcio}</span>
              <span style={{ color: 'var(--text-dim)' }}>T{t.temporada}</span>
            </div>
          ))}
        </div>
      )}

      {llegat.millorsTemporades.length > 0 && (
        <div className="card">
          <div className="card-titol"><span>Millors temporades</span></div>
          {llegat.millorsTemporades.slice(0, 5).map((t, i) => (
            <div key={i} className="hist-item">
              <span>Temporada {t.temporada}</span>
              <span className="hist-posicio">{t.posicio}º</span>
              <span style={{ color: 'var(--text-dim)' }}>{t.victories} victòries</span>
            </div>
          ))}
        </div>
      )}

      {equipIdeal.length > 0 && (
        <div className="card">
          <div className="card-titol"><span>Equip ideal de tota la vida</span></div>
          {equipIdeal.map((j, i) => (
            <div key={i} className="hist-item">
              <span>{j.posicio} · {j.nom} {j.cognom}</span>
              <span style={{ color: 'var(--text-dim)' }}>T{j.temporada} · {j.punts}p {j.rebots}r {j.assistencies}a</span>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="card-titol"><span>Assoliments</span><span>{partida.assolimentsDesbloquejats.length}/{ASSOLIMENTS.length}</span></div>
        {ASSOLIMENTS.map((a) => {
          const fet = partida.assolimentsDesbloquejats.includes(a.id);
          return (
            <div key={a.id} className={`perk-fila ${fet ? '' : 'blocat'}`}>
              <div className="perk-emoji">{a.emoji}</div>
              <div className="perk-info">
                <strong>{a.nom}</strong>
                <span>{a.descripcio}</span>
              </div>
              {fet && <span className="badge" style={{ background: 'rgba(255,209,102,0.15)', color: 'var(--groc)' }}>FET</span>}
            </div>
          );
        })}
      </div>
    </>
  );
}
