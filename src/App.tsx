import { useEffect } from 'react';
import { useJoc } from './game/store';
import { Capcalera } from './components/Capcalera';
import { Pestanyes } from './components/Pestanyes';
import { Tauler } from './components/Tauler';
import { Plantilla } from './components/Plantilla';
import { Partit } from './components/Partit';
import { Finances } from './components/Finances';
import { Entrenament } from './components/Entrenament';
import { Jocs } from './components/Jocs';
import { Cromos } from './components/Cromos';
import { Llegat } from './components/Llegat';
import { Mapa } from './components/Mapa';
import { Playoffs } from './components/Playoffs';
import { NovaPartida } from './components/NovaPartida';
import { FiTemporada } from './components/FiTemporada';
import { Celebracio } from './components/Celebracio';
import { Toasts } from './components/Toasts';
import { MinijocModal } from './components/minijocs/MinijocModal';
import { AnecdotaModal } from './components/AnecdotaModal';

export default function App() {
  const partida = useJoc((s) => s.partida);
  const pestanya = useJoc((s) => s.pestanya);
  const netejarEfemers = useJoc((s) => s.netejarEfemers);

  useEffect(() => {
    netejarEfemers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!partida) {
    return <NovaPartida />;
  }

  const acabadaLliga = partida.jornadaActual >= 22;
  const playoffsActius = acabadaLliga && !!partida.playoffs && partida.playoffs.rondaActual !== 'acabats';
  const mostrarFiTemporada = acabadaLliga && !playoffsActius;

  return (
    <div className="app">
      <Capcalera />
      <Pestanyes />
      {pestanya === 'tauler' && <Tauler />}
      {pestanya === 'plantilla' && <Plantilla />}
      {pestanya === 'partit' && <Partit />}
      {pestanya === 'entrenament' && <Entrenament />}
      {pestanya === 'finances' && <Finances />}
      {pestanya === 'jocs' && <Jocs />}
      {pestanya === 'cromos' && <Cromos />}
      {pestanya === 'llegat' && <Llegat />}
      {pestanya === 'mapa' && <Mapa />}
      {playoffsActius && <Playoffs />}
      {mostrarFiTemporada && <FiTemporada />}
      <MinijocModal />
      <AnecdotaModal />
      <Toasts />
      <Celebracio />
    </div>
  );
}
