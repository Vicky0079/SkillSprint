import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import Starfield from '../components/Starfield';
import Roadmap from '../components/Roadmap';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Users, Trophy, Flame, Sparkles, TrendingUp, Award, Code2, PenTool, Palette, Layers, Lock, CheckCircle2, Play, Crown, Briefcase } from 'lucide-react';

const CATEGORIES = [
  { id: 'ALL', label: 'All', icon: Sparkles },
  { id: 'CODING', label: 'Coding', icon: Code2 },
  { id: 'DESIGN', label: 'Design', icon: Palette },
  { id: 'WRITING', label: 'Writing', icon: PenTool },
];

const DIFFICULTIES = ['ALL', 'VERY BASIC', 'EASY', 'NORMAL', 'HARD'];

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [challenges, setChallenges] = useState([]);
  const [progress, setProgress] = useState({ completedIds: [], unlockedIds: [], nextId: null, passScore: 70 });
  const [rank, setRank] = useState('...');
  const [loading, setLoading] = useState(true);
  
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [activeDifficulty, setActiveDifficulty] = useState('ALL');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [challengesRes, rankRes, progressRes] = await Promise.all([
          api.get('/challenges'),
          api.get('/users/rank'),
          api.get('/challenges/progress') // completed + unlocked steps (decided by the server)
        ]);
        setChallenges(challengesRes.data);
        setRank(`#${rankRes.data.rank}`);
        setProgress(progressRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Completed / locked state now comes from the server, so it can't be bypassed
  const isChallengePassed = (challengeId) => progress.completedIds.includes(challengeId);
  const isChallengeLocked = (challenge) => !progress.unlockedIds.includes(challenge.id);

  const filteredChallenges = challenges.filter(c => {
    const matchCategory = activeCategory === 'ALL' || c.category === activeCategory;
    const matchDifficulty = activeDifficulty === 'ALL' || c.difficulty === activeDifficulty;
    return !c.isPremium && matchCategory && matchDifficulty; // premium questions live on the Interview Prep page
  });

  const difficultyStyle = (level) => {
    switch (level) {
      case 'VERY BASIC': return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
      case 'EASY': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'NORMAL': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'HARD': return 'text-red-400 bg-red-500/10 border-red-500/30';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  const categoryGradient = (cat) => {
    switch (cat) {
      case 'CODING': return 'from-blue-500 via-sky-500 to-blue-600';
      case 'DESIGN': return 'from-indigo-500 via-indigo-500 to-indigo-600';
      case 'WRITING': return 'from-purple-500 via-violet-500 to-purple-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  return (
    <div className="min-h-screen cosmic-bg relative pb-20">
      <Starfield />
      <div className="relative z-10">
        <Navbar />

        <div className="max-w-7xl mx-auto p-8">
          {/* Hero & Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 font-display">Hey, <span className="brand-text">{user?.name}</span> 👋</h1>
            <p className="text-gray-400 text-lg">Pick up where you left off, or choose a topic and difficulty below.</p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {[
              { icon: Zap, label: 'Total XP', value: (user?.xp || 0).toLocaleString(), sub: 'Earn XP by passing challenges', gradient: 'from-amber-400 to-amber-500' },
              { icon: Flame, label: 'Completed', value: `${progress.completedIds.length} / ${challenges.filter((c) => !c.isPremium).length}`, sub: 'Challenges passed', gradient: 'from-emerald-400 to-teal-500' },
              { icon: Trophy, label: 'Your Role', value: user?.role, sub: 'Account type', gradient: 'from-indigo-500 to-violet-500' },
              { icon: TrendingUp, label: 'Rank', value: rank, sub: 'On the leaderboard', gradient: 'from-sky-400 to-blue-500' },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="relative glass rounded-2xl p-5 overflow-hidden hover:border-indigo-400/30 transition-colors">
                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${stat.gradient} opacity-20 blur-3xl`} />
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3 shadow-lg`}><stat.icon className="w-6 h-6 text-white" /></div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className={`font-bold font-display ${stat.label === 'Your Role' ? 'text-2xl brand-text' : 'text-3xl text-white'}`}>{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Roadmap */}
          <Roadmap
            steps={challenges.filter((ch) => !ch.creatorId && !ch.isPremium)}
            completedIds={progress.completedIds}
            unlockedIds={progress.unlockedIds}
            nextId={progress.nextId}
            onOpen={(chId) => navigate(`/challenge/${chId}`)}
          />

          {/* Interview Prep teaser */}
          {user?.role !== 'COMPANY' && (
            <div className="glass rounded-2xl border border-amber-400/25 p-5 mb-10 flex flex-col md:flex-row md:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center flex-shrink-0"><Briefcase className="w-6 h-6 text-white" /></div>
              <div className="flex-1">
                <h3 className="font-bold font-display text-lg">Interview Prep <span className="text-xs text-yellow-300 ml-1">PREMIUM</span></h3>
                <p className="text-sm text-gray-400">Company-style questions (TCS, Infosys, Amazon, Google...) and bonus challenges.</p>
              </div>
              <button onClick={() => navigate(user?.isPremium ? '/interview' : '/premium')} className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 flex items-center justify-center gap-2 hover:from-amber-300 hover:to-amber-400 transition-all">
                <Crown className="w-4 h-4" /> {user?.isPremium ? 'Open Interview Prep' : 'Unlock with Premium'}
              </button>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8">
            <h2 className="text-3xl font-bold font-display flex items-center gap-3">
              <Layers className="w-7 h-7 text-indigo-400" /> Learning Path <span className="text-sm font-medium text-gray-500 ml-1">({filteredChallenges.length})</span>
            </h2>

            <div className="flex flex-col gap-3 w-full xl:w-auto">
              <div className="flex flex-wrap gap-2 p-1.5 glass rounded-2xl border border-slate-700/50">
                {CATEGORIES.map((cat) => (
                  <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeCategory === cat.id ? 'bg-indigo-500/25 text-white border border-indigo-400/40' : 'text-gray-400 hover:text-white'}`}>
                    <cat.icon className="w-4 h-4" /> {cat.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 p-1.5 glass rounded-2xl border border-slate-700/50">
                {DIFFICULTIES.map((diff) => (
                  <button key={diff} onClick={() => setActiveDifficulty(diff)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeDifficulty === diff ? 'bg-sky-500/20 text-white border border-sky-400/40' : 'text-gray-400 hover:text-white'}`}>
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Challenge Grid (With Locking Logic) */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2].map((n) => <div key={n} className="skeleton h-64 rounded-2xl" />)}
            </div>
          )}
          {!loading && filteredChallenges.length === 0 && (
            <div className="glass rounded-2xl p-12 text-center text-gray-400">
              <Layers className="w-10 h-10 mx-auto mb-3 text-slate-600" />
              <p className="font-semibold text-white mb-1">No challenges match these filters</p>
              <button onClick={() => { setActiveCategory('ALL'); setActiveDifficulty('ALL'); }} className="text-sm text-sky-400 hover:text-sky-300">Reset filters</button>
            </div>
          )}
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredChallenges.map((challenge) => {
                const isLocked = isChallengeLocked(challenge);
                const isPassed = isChallengePassed(challenge.id);

                return (
                  <motion.div layout key={challenge.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className={`group relative ${isLocked ? 'opacity-70' : ''}`}>
                    
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${categoryGradient(challenge.category)} rounded-3xl ${isLocked ? 'opacity-0' : 'opacity-0 group-hover:opacity-60'} blur-lg transition-opacity duration-500`} />
                    
                    <div className={`relative glass rounded-2xl p-6 h-full flex flex-col border ${isPassed ? 'border-emerald-500/40' : 'border-slate-700/50'} overflow-hidden`}>
                      
                      {/* Locked Overlay */}
                      {isLocked && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-6 rounded-2xl">
                          <Lock className="w-10 h-10 text-slate-500 mb-3" />
                          <p className="text-white font-bold text-lg font-display mb-1">Locked</p>
                          <p className="text-gray-400 text-xs">Complete the previous challenge to unlock this step.</p>
                        </div>
                      )}

                      <div className="relative flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-full bg-gradient-to-r ${categoryGradient(challenge.category)} text-white shadow-lg`}>
                            {challenge.category}
                          </span>
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${difficultyStyle(challenge.difficulty)}`}>
                            {challenge.difficulty}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">Step {challenge.order} • {challenge.topic}</p>
                          {isPassed && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mb-3 font-display group-hover:text-sky-300 transition-colors">
                          {challenge.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-5 line-clamp-3 flex-1">{challenge.description}</p>

                        <div className="flex justify-between items-center pt-4 border-t border-slate-700/50 mb-4">
                          <span className="text-amber-400 font-bold text-sm flex items-center gap-1.5"><Zap className="w-4 h-4" /> {challenge.xpReward} XP</span>
                        </div>

                        <div className="flex gap-2">
                          <button 
                            disabled={isLocked}
                            onClick={() => navigate(`/challenge/${challenge.id}`)} 
                            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                              isLocked 
                                ? 'bg-slate-700 text-gray-400 cursor-not-allowed' 
                                : isPassed
                                  ? 'bg-emerald-600/90 hover:bg-emerald-500 text-white'
                                  : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white btn-shimmer'
                            }`}
                          >
                            {isLocked ? 'Locked' : isPassed ? 'Review Challenge' : 'Enter Challenge'}
                            {!isLocked && !isPassed && <Play className="w-4 h-4" />}
                          </button>
                          
                          {challenge.creatorId === user?.id && (
                            <button onClick={() => navigate(`/challenge/${challenge.id}/submissions`)} className="p-2.5 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 rounded-xl transition-all" title="View Submissions">
                              <Users className="w-4 h-4 text-purple-400" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;