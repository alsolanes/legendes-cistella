import { useJoc } from './game/store';
import { Capcalera } from './components/Capcalera';
import { Pestanyes } from './components/Pestanyes';
import { Tauler } from './components/Tauler';
import { Plantilla } from './components/Plantilla';
import { Partit } from './components/Partit';
import { Finances } from './components/Finances';
import { NovaPartida } from './components/NovaPartida';
import { FiTemporada } from './components/FiTemporada';

export default function App() {
  const partida = useJoc((s) => s.partida);
  const pestanya = useJoc((s) => s.pestanya);

  if (!partida) {
    return <NovaPartida />;
  }

  const acabada = partida.jornadaActual >= 22;

  return (
    <div className="app">
      <Capcalera />
      <Pestanyes />
      {pestanya === 'tauler' && <Tauler />}
      {pestanya === 'plantilla' && <Plantilla />}
      {pestanya === 'partit' && <Partit />}
      {pestanya === 'finances' && <Finances />}
      {acabada && <FiTemporada />}
    </div>
  );
}
