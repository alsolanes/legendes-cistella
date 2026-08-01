import { useJoc } from '../game/store';

export function Capcalera() {
  const partida = useJoc((s) => s.partida);
  if (!partida) return null;

  const filaMeu = partida.classificacio.find((f) => f.equipId === 'meu');
  const pos = filaMeu ? partida.classificacio.indexOf(filaMeu) + 1 : -1;

  return (
    <header className="cap">
      <div className="cap-esq">
        <div
          className="cap-logo"
          style={{ background: `linear-gradient(135deg, ${partida.colorPrincipal}, ${partida.colorSecundari})` }}
        >
          {partida.clubNom.slice(0, 1)}
        </div>
        <div>
          <div className="cap-titol">{partida.clubNom}</div>
          <div className="cap-sub">{partida.ciutat} · J{partida.jornadaActual}/22</div>
        </div>
      </div>
      <div className="cap-dreta">
        <strong>{pos > 0 ? `${pos}º` : '—'}</strong>
        {filaMeu ? `${filaMeu.guanyats}V-${filaMeu.perduts}D` : ''}
      </div>
    </header>
  );
}
