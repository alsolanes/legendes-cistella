import { useState } from 'react';
import { Settings, RotateCcw, Trash2, X } from 'lucide-react';
import { useJoc } from '../game/store';

export function MenuConfiguracio() {
  const [obert, setObert] = useState(false);
  const [confirmacio, setConfirmacio] = useState<'reiniciar' | 'esborrar' | null>(null);
  const reiniciar = useJoc((s) => s.reiniciar);

  const obrirConfirmacio = (tipus: 'reiniciar' | 'esborrar') => {
    setObert(false);
    setConfirmacio(tipus);
  };

  const confirmar = () => {
    if (confirmacio === 'reiniciar') {
      reiniciar();
      setConfirmacio(null);
    } else if (confirmacio === 'esborrar') {
      useJoc.persist.clearStorage();
      window.location.reload();
    }
  };

  return (
    <>
      <div className="menu-config-wrap">
        <button className="btn-icona" aria-label="Configuració" onClick={() => setObert((o) => !o)}>
          <Settings size={18} />
        </button>
        {obert && (
          <>
            <div className="menu-config-tapa" onClick={() => setObert(false)} />
            <div className="menu-config-dropdown">
              <button className="menu-config-item" onClick={() => obrirConfirmacio('reiniciar')}>
                <RotateCcw size={16} /> Reinicia la partida
              </button>
              <button className="menu-config-item perill" onClick={() => obrirConfirmacio('esborrar')}>
                <Trash2 size={16} /> Esborra dades desades
              </button>
            </div>
          </>
        )}
      </div>

      {confirmacio && (
        <div className="modal-fons" onClick={() => setConfirmacio(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 340 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ fontSize: 17 }}>
                {confirmacio === 'reiniciar' ? 'Reinicia la partida?' : 'Esborra totes les dades?'}
              </h2>
              <button className="btn btn-secundari" style={{ padding: '6px 10px' }} onClick={() => setConfirmacio(null)}>
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: 13.5, color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: 18 }}>
              {confirmacio === 'reiniciar'
                ? "Es tancarà la partida actual i tornaràs a la pantalla de nou club. El progrés d'aquest club es perdrà."
                : "S'esborraran totes les dades desades al navegador (partida i progrés). Aquesta acció no es pot desfer."}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secundari" style={{ flex: 1 }} onClick={() => setConfirmacio(null)}>Cancel·la</button>
              <button className="btn btn-perill" style={{ flex: 1 }} onClick={confirmar}>
                {confirmacio === 'reiniciar' ? 'Reinicia' : 'Esborra-ho tot'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
