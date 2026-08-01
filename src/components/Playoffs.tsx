import { useJoc } from '../game/store';
import { nomEquipPlayoff, nomRonda } from '../game/playoffs';
import { NomRondaPlayoff } from '../game/types';

const ORDRE_RONDES: NomRondaPlayoff[] = ['quarts', 'semis', 'final'];

export function Playoffs() {
  const partida = useJoc((s) => s.partida);
  const jugarPlayoff = useJoc((s) => s.jugarPlayoff);
  const novaTemporadaClub = useJoc((s) => s.novaTemporadaClub);
  if (!partida || !partida.playoffs) return null;

  const po = partida.playoffs;
  const acabats = po.rondaActual === 'acabats';
  const campio = acabats ? nomEquipPlayoff(partida, po.campio!) : null;
  const jocEsCampio = po.campio === 'meu';

  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 40 }}>🏆</div>
      <h2 style={{ fontSize: 18, margin: '4px 0 12px' }}>Playoffs</h2>

      {acabats ? (
        <>
          <div style={{ fontSize: 22, fontWeight: 900, color: jocEsCampio ? 'var(--groc)' : 'var(--text)' }}>
            {jocEsCampio ? '🏆 Sou els campions!' : `Campió: ${campio}`}
          </div>
          {po.meuEliminat && !jocEsCampio && (
            <div style={{ fontSize: 13, color: 'var(--text-dim)', margin: '8px 0' }}>Heu quedat eliminats aquesta eliminatòria.</div>
          )}
        </>
      ) : (
        <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 4 }}>
          {po.meuEliminat ? 'Heu quedat eliminats, però el quadre continua fins a la final.' : 'Sou en joc!'}
        </div>
      )}

      <div style={{ textAlign: 'left', marginTop: 12 }}>
        {ORDRE_RONDES.filter((r) => po.eliminatoria.some((e) => e.ronda === r)).map((ronda) => (
          <div key={ronda}>
            <div className="bracket-ronda-titol">{nomRonda(ronda)}</div>
            {po.eliminatoria.filter((e) => e.ronda === ronda).map((e, i) => {
              const guanyadorLocal = e.jugat && (e.puntsLocal ?? 0) > (e.puntsVisitant ?? 0);
              const guanyadorVisitant = e.jugat && (e.puntsVisitant ?? 0) > (e.puntsLocal ?? 0);
              const esMeu = e.local === 'meu' || e.visitant === 'meu';
              return (
                <div key={i} className={`bracket-partit ${esMeu ? 'meu' : ''}`}>
                  <span className={`bracket-equip ${guanyadorLocal ? 'guanyador' : ''}`}>{nomEquipPlayoff(partida, e.local)}</span>
                  <span className="bracket-punts">{e.jugat ? `${e.puntsLocal} - ${e.puntsVisitant}` : 'vs'}</span>
                  <span className={`bracket-equip ${guanyadorVisitant ? 'guanyador' : ''}`} style={{ textAlign: 'right' }}>{nomEquipPlayoff(partida, e.visitant)}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {!acabats ? (
        <button className="btn btn-primari btn-blok" style={{ marginTop: 14 }} onClick={jugarPlayoff}>
          🏀 Jugar {nomRonda(po.rondaActual).toLowerCase()}
        </button>
      ) : (
        <button className="btn btn-primari btn-blok" style={{ marginTop: 14 }} onClick={novaTemporadaClub}>
          🔄 Continuar a la següent temporada
        </button>
      )}
    </div>
  );
}
