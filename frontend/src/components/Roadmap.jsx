import { Fragment, useEffect, useRef } from 'react';
import { Lock, Check, Play, Trophy } from 'lucide-react';

// Visual learning path: Step 1 -> Step 2 -> ... with done / current / locked states.
const Roadmap = ({ steps, completedIds, unlockedIds, nextId, onOpen }) => {
  const total = steps.length;
  const done = steps.filter((s) => completedIds.includes(s.id)).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const nextStep = steps.find((s) => s.id === nextId);
  const currentRef = useRef(null);

  // Scroll the roadmap so the current step is visible
  useEffect(() => {
    currentRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [nextId, total]);

  if (total === 0) return null;

  return (
    <div className="glass rounded-2xl border border-slate-700/50 p-6 mb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-2xl font-bold font-display text-white">Your Roadmap</h2>
          <p className="text-sm text-gray-400">{done} of {total} steps completed • {pct}%</p>
        </div>
        {nextStep ? (
          <button
            onClick={() => onOpen(nextStep.id)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white transition-all shadow-lg shadow-indigo-500/20"
          >
            <Play className="w-4 h-4" /> Continue: {nextStep.title}
          </button>
        ) : (
          <span className="flex items-center gap-2 text-emerald-400 font-bold text-sm"><Trophy className="w-5 h-5" /> You finished the whole path!</span>
        )}
      </div>

      <div className="h-2 rounded-full bg-slate-800 overflow-hidden mb-6">
        <div className="h-full bg-gradient-to-r from-sky-400 via-indigo-500 to-violet-500 transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>

      <div className="flex items-start overflow-x-auto pb-2 custom-scrollbar">
        {steps.map((step, i) => {
          const isDone = completedIds.includes(step.id);
          const isCurrent = step.id === nextId;
          const isLocked = !unlockedIds.includes(step.id);
          const prevDone = i > 0 && completedIds.includes(steps[i - 1].id);

          const circle = isDone
            ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
            : isCurrent
              ? 'bg-gradient-to-br from-sky-500 to-indigo-600 border-indigo-300 text-white shadow-lg shadow-indigo-500/40 ring-4 ring-indigo-500/20'
              : isLocked
                ? 'bg-slate-800 border-slate-700 text-slate-500'
                : 'bg-slate-800 border-blue-500/50 text-blue-300';

          return (
            <Fragment key={step.id}>
              {i > 0 && <div className={`h-0.5 flex-1 min-w-[24px] mt-6 ${prevDone ? 'bg-emerald-500/60' : 'bg-slate-700'}`} />}
              <button
                ref={isCurrent ? currentRef : null}
                disabled={isLocked}
                onClick={() => onOpen(step.id)}
                className={`flex flex-col items-center w-28 flex-shrink-0 group ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                title={isLocked ? 'Complete the previous step to unlock' : step.title}
              >
                <span className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold transition-transform ${circle} ${!isLocked ? 'group-hover:scale-110' : ''}`}>
                  {isDone ? <Check className="w-5 h-5" /> : isLocked ? <Lock className="w-4 h-4" /> : step.order}
                </span>
                <span className={`mt-2 text-xs font-semibold text-center leading-tight ${isLocked ? 'text-slate-500' : 'text-gray-200'}`}>{step.topic}</span>
                <span className="text-[10px] text-gray-500 text-center">{step.title}</span>
              </button>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default Roadmap;
