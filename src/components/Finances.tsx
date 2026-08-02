import { useJoc } from '../game/store';
import { calcularLuxuryTaxSetmanal, calcularSalaryCap, massaSalarialTotal } from '../game/contractes';
import { AlertTriangle, Dumbbell, Flame, LifeBuoy } from 'lucide-react';
import { IconPavello, IconTitul } from './icones';

export function Finances() {
  const partida = useJoc((s) => s.partida);
  const millorarPavello = useJoc((s) => s.millorarPavello);
  const millorarInstalacions = useJoc((s) => s.millorarInstalacions);
  if (!partida) return null;

  const f = partida.finanzas;
  const costPavello = partida.pavello.nivell < 5 ? partida.pavello.preuPerNivell * partida.pavello.nivell : 0;
  const costInstalacions = partida.instalacions.nivell < 5 ? partida.instalacions.preuPerNivell * partida.instalacions.nivell : 0;
  const saldo = f.ingressosTemporada - f.despesesTemporada;
  const cap = calcularSalaryCap(partida);
  const massa = massaSalarialTotal(partida);
  const tax = calcularLuxuryTaxSetmanal(partida);

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
            <IconPavello size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Millorar pavelló ({costPavello.toLocaleString('ca')}€) → Nivell {partida.pavello.nivell + 1}
          </button>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--verd)', fontWeight: 700 }}>
            <IconPavello size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Pavelló al màxim nivell!
          </div>
        )}
      </div>

      {/* Instal·lacions d'entrenament */}
      <div className="card">
        <div className="card-titol"><span>Instal·lacions d&apos;entrenament</span><span>Nivell {partida.instalacions.nivell}/5</span></div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} style={{ flex: 1, height: 8, borderRadius: 4, background: n <= partida.instalacions.nivell ? 'var(--blau)' : 'var(--fons)' }} />
          ))}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 12 }}>
          Millors instal·lacions fan que l&apos;entrenament sigui més efectiu.
        </div>
        {partida.instalacions.nivell < 5 ? (
          <button
            className="btn btn-primari btn-blok"
            onClick={() => millorarInstalacions()}
            disabled={f.pressupost < costInstalacions}
            style={{ opacity: f.pressupost < costInstalacions ? 0.5 : 1 }}
          >
            <Dumbbell size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Millorar instal·lacions ({costInstalacions.toLocaleString('ca')}€) → Nivell {partida.instalacions.nivell + 1}
          </button>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--verd)', fontWeight: 700 }}>
            <Dumbbell size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Instal·lacions al màxim nivell!
          </div>
        )}
      </div>

      {/* Sostre salarial */}
      <div className="card">
        <div className="card-titol"><span>Sostre salarial</span><span>{massa > cap ? 'Superat!' : 'Dins del límit'}</span></div>
        <div className="xp-barra">
          <div style={{ width: `${Math.min(100, (massa / cap) * 100)}%`, background: massa > cap ? 'var(--vermell)' : undefined }} />
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 8 }}>
          Massa salarial: {massa.toLocaleString('ca')}€ / {cap.toLocaleString('ca')}€
        </div>
        {tax > 0 && (
          <div style={{ fontSize: 12, color: 'var(--vermell)', marginTop: 4, fontWeight: 700 }}>
            <AlertTriangle size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Pagues {tax.toLocaleString('ca')}€/jornada d&apos;impost de luxe per superar el sostre
          </div>
        )}
      </div>

      {/* Objectiu */}
      <div className="card">
        <div className="card-titol"><span>Objectiu de temporada</span></div>
        <div style={{ fontSize: 14 }}>
          {partida.objectiuTemporada === 'permanencia' && (
            <><LifeBuoy size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Permanència: acabar entre els 10 primers.</>
          )}
          {partida.objectiuTemporada === 'playoffs' && (
            <><Flame size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Playoffs: acabar entre els 6 primers.</>
          )}
          {partida.objectiuTemporada === 'titulo' && (
            <><IconTitul size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Títol: quedar campió de la lliga.</>
          )}
        </div>
      </div>
    </>
  );
}
