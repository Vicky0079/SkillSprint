import { LogoIcon } from '../components/Logo';
import { useState, useContext } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Starfield from '../components/Starfield';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Sparkles, GraduationCap, Building2, Gift } from 'lucide-react';
import toast from 'react-hot-toast';

const Signup = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'STUDENT', referralCode: (searchParams.get('ref') || '').toUpperCase() });
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData.name, formData.email, formData.password, formData.role, formData.referralCode);
      toast.success('Account created! Welcome to SkillSprint 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen cosmic-bg relative flex items-center justify-center p-6">
      <Starfield />

      <div className="absolute top-10 left-10 w-72 h-72 bg-sky-500/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md z-10"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-sky-600 via-purple-600 to-indigo-600 rounded-3xl blur-2xl opacity-50" />

        <div className="relative glass-strong rounded-3xl p-8 border border-purple-500/20">
          <div className="text-center mb-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="inline-flex mb-4"><LogoIcon size={64} /></motion.div>
            <h2 className="text-3xl font-bold font-display mb-2">
              Join <span className="brand-text">SkillSprint</span>
            </h2>
            <p className="text-gray-400 text-sm">Start your journey to mastery</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  name="name"
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl glass border border-slate-700/50 focus:outline-none input-glow text-white placeholder-gray-500"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl glass border border-slate-700/50 focus:outline-none input-glow text-white placeholder-gray-500"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  name="password"
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl glass border border-slate-700/50 focus:outline-none input-glow text-white placeholder-gray-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'STUDENT' })}
                  className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border transition-all ${
                    formData.role === 'STUDENT'
                      ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 border-purple-500 text-white glow-purple'
                      : 'glass border-slate-700/50 text-gray-400 hover:text-white'
                  }`}
                >
                  <GraduationCap className="w-5 h-5" />
                  <span className="font-semibold text-sm">Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'COMPANY' })}
                  className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border transition-all ${
                    formData.role === 'COMPANY'
                      ? 'bg-gradient-to-r from-green-600/30 to-emerald-600/30 border-emerald-500 text-white'
                      : 'glass border-slate-700/50 text-gray-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  <span className="font-semibold text-sm">Company</span>
                </button>
              </div>
            </div>

            {formData.role === 'STUDENT' && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Invite code <span className="text-gray-500">(optional)</span></label>
                <div className="relative">
                  <Gift className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    name="referralCode"
                    value={formData.referralCode}
                    onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl glass border border-slate-700/50 focus:outline-none input-glow text-white placeholder-gray-500 font-mono tracking-widest"
                    placeholder="SAXXXXXX"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">Got a code from a friend? You both win free Premium days.</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-sky-600 via-purple-600 to-indigo-600 hover:from-sky-500 hover:via-purple-500 hover:to-indigo-500 rounded-xl font-bold transition-all btn-shimmer glow-purple flex items-center justify-center gap-2 group mt-2"
            >
              Create Account
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="text-center text-sm mt-6 text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-purple-400 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;