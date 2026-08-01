import { useJoc } from '../game/store';
import { Cromo } from '../game/types';
import { cromoDeJugador, cromoEspecialDe, colleccioCompleta, cromosUnics, PREU_SOBRE, totalColleccionable } from '../game/cromos';

export function Cromos() {
  const partida = useJoc((s) => s.partida);
  const darrerSobre = useJoc((s) => s.darrerSobre);
  const obrirSobre = useJoc((s) => s.obrirSobre);
  if (!partida) return null;

  const propis: Cromo[] = partida.plantilla.map(cromoDeJugador);
  const especials: Cromo[] = partida.rivals.map(cromoEspecialDe);
  const total = totalColleccionable(partida.plantilla, partida.rivals);
  const unics = cromosUnics(partida.cromos);
  const completa = colleccioCompleta(partida.cromos, partida.plantilla, partida.rivals);

  return (
    <>
      {darrerSobre && (
        <div className="modal-fons" onClick={() => useJoc.setState({ darrerSobre: null })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="card-titol"><span>📦 Sobre obert!</span></div>
            <div className="sobre-reveal">
              {darrerSobre.map((c, i) => (
                <div key={i} className="sobre-carta-anim" style={{ animationDelay: `${i * 0.08}s` }}>
                  <CromoCard cromo={c} comptador={undefined} />
                </div>
              ))}
            </div>
            <button className="btn btn-primari btn-blok" onClick={() => useJoc.setState({ darrerSobre: null })}>Genial!</button>
          </div>
        </div>
      )}

      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40 }}>📖</div>
        <h2 style={{ fontSize: 18, margin: '4px 0 2px' }}>Àlbum de cromos</h2>
        <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 12 }}>
          {unics} / {total} cromos únics · {partida.cromos.sobresOberts} sobres oberts
        </div>
        <div className="xp-barra"><div style={{ width: `${total > 0 ? (unics / total) * 100 : 0}%` }} /></div>
        {completa && <div style={{ marginTop: 10, color: 'var(--groc)', fontWeight: 800 }}>🏆 Col·lecció completa!</div>}
        <button
          className="btn btn-primari btn-blok"
          style={{ marginTop: 14 }}
          onClick={obrirSobre}
          disabled={partida.finanzas.pressupost < PREU_SOBRE}
        >
          📦 Comprar sobre ({PREU_SOBRE.toLocaleString('ca')}€ · 5 cromos)
        </button>
      </div>

      <div className="card">
        <div className="card-titol"><span>La teva plantilla</span></div>
        <div className="cromos-graella">
          {propis.map((c) => (
            <CromoCard key={c.id} cromo={c} comptador={partida.cromos.posseits[c.id] ?? 0} />
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-titol"><span>Estrelles rivals</span></div>
        <div className="cromos-graella">
          {especials.map((c) => (
            <CromoCard key={c.id} cromo={c} comptador={partida.cromos.posseits[c.id] ?? 0} />
          ))}
        </div>
      </div>
    </>
  );
}

function CromoCard({ cromo, comptador }: { cromo: Cromo; comptador?: number }) {
  const buit = comptador === 0;
  return (
    <div className={`cromo ${cromo.rareza} ${cromo.especial ? 'especial' : ''} ${buit ? 'buit' : ''}`}>
      {comptador !== undefined && comptador > 1 && <div className="cromo-comptador">x{comptador}</div>}
      <div className="cromo-foto">{cromo.nom.slice(0, 1)}{cromo.cognom.slice(0, 1)}</div>
      <div className="cromo-nom">{cromo.nom} {cromo.cognom}</div>
      <div className="cromo-raresa">{cromo.rareza} · {cromo.posicio}</div>
    </div>
  );
}
