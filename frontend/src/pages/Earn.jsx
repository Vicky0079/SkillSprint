import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gift, Copy, Users, Trophy, Crown, Check, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import Navbar from '../components/Navbar';
import Starfield from '../components/Starfield';

const medal = (r) => (r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : `#${r}`);
const timeLeft = (endsAt) => {
  const ms = new Date(endsAt) - new Date();
  if (ms <= 0) return 'ending now';
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  return d > 0 ? `${d}d ${h}h left` : `${h}h left`;
};

const Earn = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/earn/summary').then((r) => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const link = data ? `${window.location.origin}/signup?ref=${data.referral.code}` : '';
  const copy = async (text, label) => {
    try { await navigator.clipboard.writeText(text); toast.success(`${label} copied`); }
    catch { toast.error('Could not copy. Please select it and copy manually.'); }
  };

  return (
    <div className="min-h-screen cosmic-bg relative pb-20">
      <Starfield />
      <div className="relative z-10">
        <Navbar />
        <div className="max-w-5xl mx-auto p-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-2 flex items-center gap-3">
              <Gift className="w-10 h-10 text-indigo-400" /> Earn <span className="gradient-text">Free Premium</span>
            </h1>
            <p className="text-gray-400">Two ways to unlock Interview Prep without paying.</p>
          </motion.div>

          {loading && <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}

          {data && (
            <div className="space-y-8">
              {/* Referral */}
              <section className="glass rounded-2xl border border-slate-700/50 p-6">
                <h2 className="text-2xl font-bold font-display flex items-center gap-2 mb-1"><Users className="w-6 h-6 text-sky-400" /> Invite friends</h2>
                <p className="text-sm text-gray-400 mb-5">
                  Your friend gets <b className="text-white">{data.referral.friendDays} free Premium days</b> when they sign up with your link.
                  You get <b className="text-white">{data.referral.inviterDays} days</b> once they pass their first challenge (up to {data.referral.maxRewarded} friends).
                </p>

                <div className="grid md:grid-cols-2 gap-4 mb-5">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Your code</p>
                    <div className="flex gap-2">
                      <div className="flex-1 px-4 py-3 rounded-xl glass border border-slate-700/50 font-mono font-bold tracking-widest text-lg">{data.referral.code}</div>
                      <button onClick={() => copy(data.referral.code, 'Code')} className="px-4 rounded-xl glass border border-slate-600 hover:border-purple-500 transition-all" title="Copy code"><Copy className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Your invite link</p>
                    <div className="flex gap-2">
                      <div className="flex-1 px-4 py-3 rounded-xl glass border border-slate-700/50 text-sm truncate leading-6">{link}</div>
                      <button onClick={() => copy(link, 'Link')} className="px-4 rounded-xl glass border border-slate-600 hover:border-purple-500 transition-all" title="Copy link"><Copy className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  {[['Friends joined', data.referral.invited], ['Rewarded', data.referral.rewarded], ['Days earned', data.referral.daysEarned]].map(([l, v]) => (
                    <div key={l} className="rounded-xl bg-slate-900/50 border border-slate-700/50 py-4">
                      <p className="text-3xl font-bold font-display">{v}</p>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">{l}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Weekly leaderboard */}
              <section className="glass rounded-2xl border border-slate-700/50 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-1">
                  <h2 className="text-2xl font-bold font-display flex items-center gap-2"><Trophy className="w-6 h-6 text-yellow-400" /> Weekly top 3</h2>
                  <span className="text-sm text-gray-400">This week: {timeLeft(data.weekly.endsAt)}</span>
                </div>
                <p className="text-sm text-gray-400 mb-5">
                  The three students who earn the most XP in a week win free Premium:{' '}
                  {data.weekly.prizes.map((d, i) => `${medal(i + 1)} ${d} days`).join('  •  ')}.
                  Only your best score on each challenge counts, and the week resets every Monday.
                </p>

                <div className="space-y-2 mb-4">
                  {data.weekly.top.length === 0 && <p className="text-gray-500 text-sm">Nobody has scored this week yet. Be the first!</p>}
                  {data.weekly.top.map((r) => (
                    <div key={r.rank} className={`flex items-center gap-4 px-4 py-3 rounded-xl border ${r.isMe ? 'bg-purple-500/10 border-purple-500/40' : 'bg-slate-900/40 border-slate-700/50'}`}>
                      <span className="w-10 text-xl text-center">{medal(r.rank)}</span>
                      <span className="flex-1 font-semibold">{r.name}{r.isMe && <span className="text-xs text-purple-300 ml-2">(you)</span>}</span>
                      <span className="text-yellow-400 font-bold flex items-center gap-1"><Zap className="w-4 h-4" />{r.xp} XP</span>
                    </div>
                  ))}
                </div>

                <p className="text-sm text-gray-300">
                  {data.weekly.me.rank ? <>You are <b>#{data.weekly.me.rank}</b> this week with <b>{data.weekly.me.xp} XP</b>.</> : <>You have no XP this week yet.{' '}<Link to="/dashboard" className="text-purple-300 underline">Solve a challenge</Link> to join the race.</>}
                </p>

                {data.weekly.lastWeekWinners.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-slate-700/50">
                    <h3 className="font-bold mb-3 flex items-center gap-2"><Crown className="w-4 h-4 text-yellow-400" /> Last week's winners</h3>
                    <div className="grid md:grid-cols-3 gap-3">
                      {data.weekly.lastWeekWinners.map((w) => (
                        <div key={w.rank} className={`rounded-xl p-3 text-sm border ${w.isMe ? 'bg-green-500/10 border-green-500/40' : 'bg-slate-900/40 border-slate-700/50'}`}>
                          <p className="font-bold">{medal(w.rank)} {w.name}{w.isMe && ' (you!)'}</p>
                          <p className="text-gray-400">{w.xp} XP • won {w.days} days</p>
                          {w.isMe && <p className="text-green-400 flex items-center gap-1 mt-1"><Check className="w-3 h-3" /> Added to your Premium</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Earn;
