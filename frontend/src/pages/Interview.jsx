import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Lock, Zap, CheckCircle2, Briefcase, Gift, Play, Info } from 'lucide-react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Starfield from '../components/Starfield';

const COMPANY_STYLE = {
  TCS: 'from-blue-500 to-indigo-600',
  Infosys: 'from-sky-500 to-sky-600',
  Amazon: 'from-orange-500 to-yellow-600',
  Google: 'from-red-500 to-yellow-500',
  Flipkart: 'from-yellow-400 to-blue-500',
  Accenture: 'from-purple-500 to-indigo-600',
};
const gradientFor = (c) => (c.isBonus ? 'from-indigo-500 to-purple-600' : COMPANY_STYLE[c.company] || 'from-slate-500 to-slate-600');

const difficultyStyle = (level) => {
  switch (level) {
    case 'EASY': return 'text-green-400 bg-green-500/10 border-green-500/30';
    case 'NORMAL': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    case 'HARD': return 'text-red-400 bg-red-500/10 border-red-500/30';
    default: return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
  }
};

const Interview = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [progress, setProgress] = useState({ completedIds: [] });
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/challenges'), api.get('/challenges/progress')])
      .then(([c, p]) => { setItems(c.data.filter((x) => x.isPremium)); setProgress(p.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const premium = !!user?.isPremium;
  const companies = [...new Set(items.filter((c) => !c.isBonus).map((c) => c.company))];
  const filters = ['ALL', ...companies, 'BONUS'];

  const shown = items.filter((c) => filter === 'ALL' || (filter === 'BONUS' ? c.isBonus : c.company === filter));
  const doneCount = items.filter((c) => progress.completedIds.includes(c.id)).length;

  return (
    <div className="min-h-screen cosmic-bg relative pb-20">
      <Starfield />
      <div className="relative z-10">
        <Navbar />
        <div className="max-w-7xl mx-auto p-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-2 flex items-center gap-3">
              <Briefcase className="w-10 h-10 text-purple-400" /> Interview <span className="gradient-text">Prep</span>
            </h1>
            <p className="text-gray-400">Company-style questions plus bonus challenges, for when you are ready to move beyond the basics.</p>
          </motion.div>

          {!premium && (
            <div className="glass rounded-2xl border border-yellow-400/40 p-6 mb-8 flex flex-col md:flex-row md:items-center gap-4">
              <Crown className="w-10 h-10 text-yellow-400 flex-shrink-0" />
              <div className="flex-1">
                <h2 className="font-bold font-display text-xl">These questions are for Premium members</h2>
                <p className="text-sm text-gray-400">You can see what is inside. Upgrade to open them, or earn free Premium days by inviting friends.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => navigate('/premium')} className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 flex items-center gap-2"><Crown className="w-4 h-4" /> Get Premium</button>
                <button onClick={() => navigate('/earn')} className="px-5 py-2.5 rounded-xl font-bold text-sm glass border border-slate-600 text-white flex items-center gap-2"><Gift className="w-4 h-4" /> Earn it</button>
              </div>
            </div>
          )}

          {premium && items.length > 0 && (
            <p className="text-sm text-gray-400 mb-4">{doneCount} of {items.length} solved</p>
          )}

          <div className="flex flex-wrap gap-2 p-1.5 glass rounded-2xl border border-slate-700/50 w-fit mb-8">
            {filters.map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === f ? 'bg-gradient-to-r from-blue-600/50 to-purple-600/50 text-white border border-purple-500/30' : 'text-gray-400 hover:text-white'}`}>
                {f === 'ALL' ? 'All' : f === 'BONUS' ? '🎁 Bonus' : f}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shown.map((c) => {
                const locked = !premium;
                const passed = progress.completedIds.includes(c.id);
                return (
                  <motion.div layout key={c.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative">
                    <div className={`relative glass rounded-2xl p-6 h-full flex flex-col border ${passed ? 'border-green-500/50' : 'border-slate-700/50'}`}>
                      <div className="flex justify-between items-center mb-3">
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full bg-gradient-to-r ${gradientFor(c)} text-white`}>
                          {c.isBonus ? '🎁 Bonus' : c.company}
                        </span>
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${difficultyStyle(c.difficulty)}`}>{c.difficulty}</span>
                      </div>
                      <h3 className="text-xl font-bold font-display mb-2 flex items-center gap-2">
                        {c.title} {passed && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                      </h3>
                      <p className="text-gray-400 text-sm mb-5 flex-1 line-clamp-3">
                        {locked ? 'Upgrade to Premium to read this question, its approach and the solution.' : c.description}
                      </p>
                      <div className="flex justify-between items-center pt-4 border-t border-slate-700/50 mb-4">
                        <span className="text-yellow-400 font-bold text-sm flex items-center gap-1.5"><Zap className="w-4 h-4" /> {c.xpReward} XP</span>
                      </div>
                      <button
                        onClick={() => navigate(locked ? '/premium' : `/challenge/${c.id}`)}
                        className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                          locked ? 'bg-slate-700/80 hover:bg-slate-600 text-gray-200'
                            : passed ? 'bg-green-600 hover:bg-green-500 text-white'
                              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white btn-shimmer'
                        }`}
                      >
                        {locked ? <><Lock className="w-4 h-4" /> Unlock with Premium</> : passed ? 'Review Challenge' : <>Start <Play className="w-4 h-4" /></>}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
              {shown.length === 0 && <p className="text-gray-500 col-span-full text-center py-10">No questions here yet.</p>}
            </div>
          )}

          <p className="flex items-start gap-2 text-xs text-gray-500 mt-10 max-w-3xl">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            These questions are inspired by interview patterns that are commonly reported for each company. They are practice material and are not official questions from the companies.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Interview;
