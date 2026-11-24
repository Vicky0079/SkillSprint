import { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Check, Briefcase, Gift, Sparkles, Lightbulb, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Starfield from '../components/Starfield';

const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const Premium = () => {
  const { user, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [testMode, setTestMode] = useState(true);
  const [counts, setCounts] = useState({ company: 0, bonus: 0 });
  const [buying, setBuying] = useState(null);

  useEffect(() => {
    api.get('/premium/plans').then((r) => { setPlans(r.data.plans); setTestMode(r.data.testMode); }).catch(() => {});
    api.get('/challenges').then((r) => {
      const premium = r.data.filter((c) => c.isPremium);
      setCounts({ company: premium.filter((c) => !c.isBonus).length, bonus: premium.filter((c) => c.isBonus).length });
    }).catch(() => {});
  }, []);

  const buy = async (planId) => {
    setBuying(planId);
    try {
      await api.post('/premium/checkout', { plan: planId });
      await refreshUser();
      toast.success('Premium is active! 👑');
      navigate('/interview');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setBuying(null);
    }
  };

  const features = [
    { icon: Briefcase, text: `${counts.company} company-specific interview questions (TCS, Infosys, Amazon, Google and more)` },
    { icon: Sparkles, text: `${counts.bonus} extra bonus challenges with big XP rewards` },
    { icon: Lightbulb, text: 'Step-by-step hints and the AI tutor on every Premium question' },
    { icon: Crown, text: 'Premium badge next to your name' },
  ];

  return (
    <div className="min-h-screen cosmic-bg relative pb-20">
      <Starfield />
      <div className="relative z-10">
        <Navbar />
        <div className="max-w-5xl mx-auto p-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-indigo-500 mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold font-display mb-3">Go <span className="gradient-text">Premium</span></h1>
            <p className="text-gray-400 text-lg">Practise the kind of questions real companies ask, once you are ready for them.</p>
          </motion.div>

          {user?.isPremium && (
            <div className="glass rounded-2xl border border-green-500/40 p-5 mb-8 flex items-center gap-3">
              <Check className="w-6 h-6 text-green-400 flex-shrink-0" />
              <p className="text-gray-200">
                Your Premium is <span className="font-bold text-green-400">active</span>
                {user.role !== 'ADMIN' && user.premiumUntil ? <> until <span className="font-bold">{formatDate(user.premiumUntil)}</span>. Buying again adds time on top.</> : '.'}
              </p>
              <Link to="/interview" className="ml-auto px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white whitespace-nowrap">Open Interview Prep</Link>
            </div>
          )}

          <div className="glass rounded-2xl border border-slate-700/50 p-6 mb-8">
            <h2 className="text-xl font-bold font-display mb-4">What you get</h2>
            <ul className="grid md:grid-cols-2 gap-4">
              {features.map((f) => (
                <li key={f.text} className="flex items-start gap-3 text-gray-300 text-sm">
                  <span className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center flex-shrink-0"><f.icon className="w-4 h-4 text-purple-300" /></span>
                  <span className="pt-1.5">{f.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {plans.map((plan) => {
              const best = plan.id === 'YEARLY';
              return (
                <div key={plan.id} className={`relative glass rounded-2xl p-7 border ${best ? 'border-yellow-400/60' : 'border-slate-700/50'}`}>
                  {plan.badge && <span className="absolute -top-3 right-6 text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900">{plan.badge}</span>}
                  <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">{plan.label}</p>
                  <p className="text-5xl font-bold font-display mb-1">₹{plan.priceInr.toLocaleString('en-IN')}</p>
                  <p className="text-sm text-gray-500 mb-6">{plan.id === 'YEARLY' ? `about ₹${plan.perMonthInr} per month, billed once a year` : 'billed once, no auto-renewal'}</p>
                  <button
                    onClick={() => buy(plan.id)}
                    disabled={!!buying}
                    className={`w-full py-3 rounded-xl font-bold transition-all disabled:opacity-60 ${best ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 hover:from-yellow-400 hover:to-orange-400' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white'}`}
                  >
                    {buying === plan.id ? 'Processing...' : user?.isPremium ? `Add ${plan.label.toLowerCase()} time` : `Get ${plan.label}`}
                  </button>
                </div>
              );
            })}
          </div>

          {testMode && (
            <div className="flex items-start gap-3 text-sm text-yellow-300/90 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
              <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p><span className="font-bold">Test mode:</span> no real money is charged. Pressing a button switches Premium on so you can try the whole flow.</p>
            </div>
          )}

          <div className="glass rounded-2xl border border-purple-500/30 p-6 flex flex-col md:flex-row md:items-center gap-4">
            <Gift className="w-8 h-8 text-indigo-400 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold font-display text-lg">Prefer to earn it for free?</h3>
              <p className="text-sm text-gray-400">Invite friends or finish in the weekly top 3 to win free Premium days.</p>
            </div>
            <Link to="/earn" className="px-5 py-2.5 rounded-xl text-sm font-bold bg-indigo-600/30 border border-indigo-500/40 text-white hover:bg-indigo-600/50 transition-all text-center">See how</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Premium;
