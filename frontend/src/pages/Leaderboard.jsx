import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, Crown, Medal } from 'lucide-react';
import api from '../api';
import Navbar from '../components/Navbar';
import Starfield from '../components/Starfield';
import { AuthContext } from '../context/AuthContext';

const PODIUM = {
  0: { ring: 'from-amber-300 to-amber-500', glow: 'shadow-amber-500/30', text: 'text-amber-300', height: 'h-40', label: '1st' },
  1: { ring: 'from-slate-200 to-slate-400', glow: 'shadow-slate-300/20', text: 'text-slate-200', height: 'h-32', label: '2nd' },
  2: { ring: 'from-orange-300 to-orange-600', glow: 'shadow-orange-500/20', text: 'text-orange-300', height: 'h-28', label: '3rd' },
};

const Avatar = ({ name, size = 'w-12 h-12', ring }) => (
  <div className={`${size} rounded-full p-[2px] bg-gradient-to-br ${ring || 'from-sky-500 to-indigo-600'}`}>
    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-bold text-white">
      {name?.charAt(0).toUpperCase()}
    </div>
  </div>
);

const Leaderboard = () => {
  const { user } = useContext(AuthContext);
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const res = await api.get('/users/leaderboard');
        setLeaders(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaders();
  }, []);

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);
  // Visual order on the podium: 2nd, 1st, 3rd
  const podiumOrder = [1, 0, 2].filter((i) => top3[i]);
  const myIndex = leaders.findIndex((l) => l.id === user?.id);

  return (
    <div className="min-h-screen cosmic-bg relative pb-20">
      <Starfield />
      <div className="relative z-10">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 pt-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-semibold text-indigo-300 mb-4">
              <Trophy className="w-3.5 h-3.5" /> Top {leaders.length || 10} learners
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display">
              Global <span className="brand-text">Leaderboard</span>
            </h1>
            <p className="text-gray-400 mt-3">Earn XP by passing challenges and climb the ranks.</p>
            {myIndex >= 0 && (
              <p className="mt-3 text-sm text-sky-300">You are currently ranked <span className="font-bold">#{myIndex + 1}</span></p>
            )}
          </motion.div>

          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((n) => <div key={n} className="skeleton h-16 rounded-2xl" />)}
            </div>
          ) : leaders.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center text-gray-400">
              <Trophy className="w-10 h-10 mx-auto mb-3 text-slate-600" />
              No rankings yet. Be the first to earn XP!
            </div>
          ) : (
            <>
              {/* Podium */}
              <div className="flex items-end justify-center gap-3 md:gap-5 mb-10">
                {podiumOrder.map((i) => {
                  const p = top3[i];
                  const s = PODIUM[i];
                  const isMe = p.id === user?.id;
                  return (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1 }} className="flex-1 max-w-[200px] flex flex-col items-center">
                      {i === 0 && <Crown className="w-6 h-6 text-amber-300 mb-1" />}
                      <Avatar name={p.name} size={i === 0 ? 'w-16 h-16' : 'w-14 h-14'} ring={s.ring} />
                      <p className="mt-2 font-bold text-white truncate max-w-full">{p.name}{isMe && <span className="text-sky-400 text-xs ml-1">(you)</span>}</p>
                      <p className={`text-sm font-bold flex items-center gap-1 ${s.text}`}><Zap className="w-3.5 h-3.5" />{p.xp.toLocaleString()} XP</p>
                      <div className={`mt-3 w-full ${s.height} rounded-t-2xl glass border-b-0 flex items-start justify-center pt-3 shadow-lg ${s.glow}`}>
                        <span className={`text-3xl font-bold font-display ${s.text}`}>{i + 1}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Rest of the list */}
              {rest.length > 0 && (
                <div className="glass rounded-2xl overflow-hidden">
                  {rest.map((leader, idx) => {
                    const rank = idx + 4;
                    const isMe = leader.id === user?.id;
                    return (
                      <motion.div
                        key={leader.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.04 }}
                        className={`flex items-center justify-between px-5 py-4 border-b border-slate-700/40 last:border-0 transition-colors hover:bg-white/[0.03] ${isMe ? 'bg-indigo-500/10 border-l-2 border-l-sky-400' : ''}`}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <span className="w-8 text-center font-bold text-slate-500">#{rank}</span>
                          <Avatar name={leader.name} size="w-10 h-10" />
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate">{leader.name}{isMe && <span className="text-sky-400 text-xs ml-2">(you)</span>}</p>
                            <p className="text-[11px] uppercase tracking-wider text-gray-500">{leader.role}</p>
                          </div>
                        </div>
                        <span className="text-amber-400 font-bold flex items-center gap-1.5"><Zap className="w-4 h-4" />{leader.xp.toLocaleString()} XP</span>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
