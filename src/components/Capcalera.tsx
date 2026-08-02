import { Calendar } from 'lucide-react';
import { useJoc } from '../game/store';
import fonsCapcalera from '../assets/fons-capcalera.webp';
import { MenuConfiguracio } from './MenuConfiguracio';

export function Capcalera() {
  const partida = useJoc((s) => s.partida);
  const setPestanya = useJoc((s) => s.setPestanya);
  if (!partida) return null;

  const filaMeu = partida.classificacio.find((f) => f.equipId === 'meu');
  const pos = filaMeu ? partida.classificacio.indexOf(filaMeu) + 1 : -1;
  const acabada = partida.jornadaActual >= 22;
  const seg = !acabada
    ? partida.calendari.find((c) => c.jornada === partida.jornadaActual + 1 && (c.local === 'meu' || c.visitant === 'meu'))
    : undefined;
  const rival = seg ? partida.rivals.find((r) => r.id === (seg.local === 'meu' ? seg.visitant : seg.local)) : undefined;

  return (
    <>
      <header
        className="cap"
        style={{
          backgroundImage: `linear-gradient(rgba(11,14,20,0.72), rgba(11,14,20,0.72)), url(${fonsCapcalera})`,
          backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 14,
        }}
      >
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className="cap-dreta">
            <strong>{pos > 0 ? `${pos}º` : '—'}</strong>
            {filaMeu ? `${filaMeu.guanyats}V-${filaMeu.perduts}D` : ''}
          </div>
          <MenuConfiguracio />
        </div>
      </header>

      {seg && (
        <button className="cap-proper-partit" onClick={() => setPestanya('partit')}>
          <Calendar size={14} />
          Pròxim partit · J{partida.jornadaActual + 1} vs {rival?.nom ?? '—'}
        </button>
      )}
    </>
  );
}
