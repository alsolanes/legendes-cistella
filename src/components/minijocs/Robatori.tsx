import { useEffect, useMemo, useRef, useState } from 'react';
import { avaluarRobatori, generarFinestraRobatori } from '../../game/minijocs';

export function Robatori({ onFinish }: { onFinish: (encerts: number) => void }) {
  const [estat, setEstat] = useState<'esperant' | 'ara' | 'acabat'>('esperant');
  const [resultat, setResultat] = useState<boolean | null>(null);
  const inicRef = useRef(0);
  const finestra = useMemo(() => generarFinestraRobatori(10), []);

  useEffect(() => {
    const espera = 900 + Math.random() * 1800;
    const t = setTimeout(() => {
      inicRef.current = performance.now();
      setEstat('ara');
    }, espera);
    return () => clearTimeout(t);
  }, []);

  const clicar = () => {
    if (estat === 'acabat') return;
    if (estat === 'esperant') {
      setResultat(false);
      setEstat('acabat');
      setTimeout(() => onFinish(0), 900);
      return;
    }
    const temps = performance.now() - inicRef.current;
    const encert = avaluarRobatori(temps, finestra);
    setResultat(encert);
    setEstat('acabat');
    setTimeout(() => onFinish(encert ? 1 : 0), 900);
  };

  return (
    <div className="minijoc">
      <div className="minijoc-titol">🖐️ Robatori de pilota</div>
      <div className="minijoc-sub">Toca just quan el rival exposi la pilota</div>
      <div className={`robatori-zona ${estat}`} onClick={clicar}>
        {estat === 'esperant' && 'Espera...'}
        {estat === 'ara' && 'ARA!'}
        {estat === 'acabat' && (resultat ? '🤾 Robada!' : '❌ Massa tard')}
      </div>
    </div>
  );
}
