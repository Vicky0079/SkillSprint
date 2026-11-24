import Logo from '../components/Logo';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Sparkles, ArrowRight, Code2, PenTool, Users } from 'lucide-react';
import Starfield from '../components/Starfield';

const Landing = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  return (
    <div className="min-h-screen cosmic-bg relative overflow-hidden">
      <Starfield />

      {/* Animated blobs */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-float" />
      <div className="absolute top-40 -right-40 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />

      {/* Navbar */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <Link to="/"><Logo size={44} textClass="text-2xl" /></Link>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-gray-300 hover:text-white transition font-medium">Login</Link>
          <Link to="/signup" className="px-5 py-2.5 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-500 hover:via-purple-500 hover:to-indigo-500 rounded-xl font-semibold transition-all btn-shimmer glow-purple">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-32 text-center"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-purple-500/30 mb-8">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-gray-300">Powered by Real AI</span>
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-bold mb-6 leading-tight font-display">
          <span className="text-white">Skill</span><span className="brand-text">Sprint</span>
        </motion.h1>

        <motion.p variants={itemVariants} className="text-2xl text-gray-300 mb-4 font-display">
          Level Up. Compete. Win.
        </motion.p>

        <motion.p variants={itemVariants} className="text-lg text-gray-400 max-w-2xl mx-auto mb-12">
          The world's first unified platform where students compete across coding, design, and writing.
          Get AI-powered feedback, earn XP, and get discovered by top companies.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/signup" className="group px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-500 hover:via-purple-500 hover:to-indigo-500 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 btn-shimmer glow-purple">
            Start Your Sprint
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/leaderboard" className="px-8 py-4 glass-strong hover:bg-slate-700/50 rounded-xl font-semibold text-lg transition-all border border-slate-700/50">
            View Leaderboard
          </Link>
        </motion.div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-5xl mx-auto px-6 pb-24"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { number: '10K+', label: 'Active Students' },
            { number: '500+', label: 'Challenges' },
            { number: '50+', label: 'Partner Companies' },
            { number: '1M+', label: 'XP Earned' },
          ].map((stat, i) => (
            <div key={i} className="glass-strong rounded-2xl p-6 text-center hover:scale-105 transition-transform border border-purple-500/10">
              <div className="text-4xl font-bold gradient-text font-display mb-2">{stat.number}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Features */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-4 font-display">
            Why <span className="gradient-text">SkillSprint</span>?
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Traditional learning is passive. We make it competitive, measurable, and rewarding.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Code2, title: 'Multi-Skill', desc: 'Compete in coding, design, writing, and more.', color: 'from-blue-500 to-sky-500' },
            { icon: Sparkles, title: 'AI Feedback', desc: 'Instant, personalized review of your work.', color: 'from-purple-500 to-indigo-500' },
            { icon: Trophy, title: 'Global Ranks', desc: 'Climb the leaderboard and earn XP.', color: 'from-amber-400 to-amber-500' },
            { icon: Users, title: 'Get Hired', desc: 'Companies find top talent through challenges.', color: 'from-green-500 to-emerald-500' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-strong rounded-2xl p-6 hover:scale-105 transition-all group border border-slate-700/50"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 font-display">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10 max-w-4xl mx-auto px-6 py-24 text-center"
      >
        <div className="glass-strong rounded-3xl p-12 relative overflow-hidden border border-purple-500/20">
          <div className="absolute top-0 -right-20 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 font-display">
              Ready to <span className="gradient-text">Sprint?</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of students competing, learning, and getting hired.
            </p>
            <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-500 hover:via-purple-500 hover:to-indigo-500 rounded-xl font-semibold text-lg transition-all btn-shimmer glow-purple">
              Start Free Today
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 py-8 text-center text-gray-500 text-sm">
        <p>© 2026 SkillSprint. Built with ❤️ for learners everywhere.</p>
      </footer>
    </div>
  );
};

export default Landing;