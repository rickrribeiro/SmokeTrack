import React, { useEffect, useRef, useState } from 'react';
import { Timer, X, Sparkles, ShieldCheck, Cigarette } from 'lucide-react';
import { SmokingRecord } from '../types';
import { formatDuration } from '@/util/duration';
import { getLastRecordTime, countToday, countTodayRecords, pickRandomMessage } from '@/util/splash';

interface SplashScreenProps {
  records: SmokingRecord[];
  resistedUrges: string[];
  /** Usuário segurou a vontade: o App persiste o momento. */
  onResist: () => void;
  /** Fecha a tela sem navegar (após o feedback do "Não" ou pelo X). */
  onClose: () => void;
  /** Usuário vai fumar: o App fecha a tela e vai para a aba de registro. */
  onConfirmSmoke: () => void;
}

const TICK_MS = 15 * 1000;
const EXIT_MS = 250;
const FEEDBACK_MS = 1600;

const SplashScreen: React.FC<SplashScreenProps> = ({ records, resistedUrges, onResist, onClose, onConfirmSmoke }) => {
  const [now, setNow] = useState(() => new Date());
  const [message] = useState(() => pickRandomMessage());
  const [phase, setPhase] = useState<'ask' | 'resisted'>('ask');
  const [leaving, setLeaving] = useState(false);
  const timers = useRef<number[]>([]);

  // Contador ao vivo
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  // Limpa timeouts pendentes se a tela for desmontada no meio da animação
  useEffect(() => () => timers.current.forEach(t => window.clearTimeout(t)), []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const leave = (after: () => void) => {
    if (leaving) return;
    setLeaving(true);
    later(after, EXIT_MS);
  };

  const handleResist = () => {
    if (phase !== 'ask' || leaving) return;
    onResist();
    setPhase('resisted');
    later(() => leave(onClose), FEEDBACK_MS);
  };

  const lastTime = getLastRecordTime(records, now);
  const todayCount = countTodayRecords(records, now);
  const resistedToday = countToday(resistedUrges, now);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Antes de fumar"
      className={`fixed inset-0 z-[60] bg-slate-50 flex justify-center overflow-y-auto ${leaving ? 'splash-out' : 'splash-in'}`}
    >
      <div
        className="w-full max-w-lg flex flex-col px-6 pb-8"
        style={{ paddingTop: 'max(2.5rem, env(safe-area-inset-top))' }}
      >
        <div className="flex justify-end">
          <button
            onClick={() => leave(onClose)}
            aria-label="Pular"
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {phase === 'ask' ? (
          <div className="flex-1 flex flex-col justify-center gap-6">
            <div className="flex flex-col items-center text-center splash-rise">
              <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 mb-5 animate-pulse">
                <Timer size={40} />
              </div>
              <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Tempo desde o último registro</p>
              <p className={`${lastTime === null ? 'text-2xl' : 'text-5xl'} font-black text-slate-800 tracking-tight mt-1`}>
                {lastTime === null ? 'Nenhum registro ainda' : formatDuration(now.getTime() - lastTime)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 splash-rise" style={{ animationDelay: '100ms' }}>
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 text-center">
                <p className="text-3xl font-black text-slate-800">{todayCount}</p>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                  {todayCount === 1 ? 'registro hoje' : 'registros hoje'}
                </p>
              </div>
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 text-center">
                <p className="text-3xl font-black text-emerald-600">{resistedToday}</p>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                  {resistedToday === 1 ? 'vontade segurada' : 'vontades seguradas'}
                </p>
              </div>
            </div>

            <div className="bg-indigo-50 p-5 rounded-3xl border border-indigo-100 flex gap-3 splash-rise" style={{ animationDelay: '200ms' }}>
              <Sparkles size={20} className="text-indigo-500 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-indigo-900 leading-relaxed">{message}</p>
            </div>

            <div className="flex flex-col gap-3 splash-rise" style={{ animationDelay: '300ms' }}>
              <h2 className="text-2xl font-black text-slate-800 text-center mb-1">Você vai mesmo fumar agora?</h2>
              <button
                onClick={handleResist}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <ShieldCheck size={20} /> Não, vou segurar
              </button>
              <button
                onClick={() => leave(onConfirmSmoke)}
                className="w-full bg-white hover:bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl border border-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Cigarette size={20} /> Sim, vou fumar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 splash-rise">
            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-200 animate-bounce">
              <ShieldCheck size={48} />
            </div>
            <h2 className="text-3xl font-black text-slate-800">Boa! Vontade segurada 💪</h2>
            <p className="text-slate-500 font-medium">
              {resistedToday === 1 ? '1 vontade segurada hoje.' : `${resistedToday} vontades seguradas hoje.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SplashScreen;
