import { useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Trophy, BookOpen, Plus, LogOut, LayoutDashboard, Zap, Briefcase, Gift, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from './Logo';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
      isActive(path)
        ? 'text-white'
        : 'text-gray-400 hover:text-white'
    }`;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-strong sticky top-0 z-50 border-b border-purple-500/10"
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/dashboard"><Logo size={40} /></Link>

        {/* Main Nav */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
            { path: '/my-submissions', icon: BookOpen, label: 'Submissions' },
            ...(user?.role !== 'COMPANY' ? [
              { path: '/interview', icon: Briefcase, label: 'Interview Prep' },
              { path: '/earn', icon: Gift, label: 'Earn' },
            ] : []),
          ].map((link) => (
            <Link key={link.path} to={link.path} className={linkClass(link.path)}>
              {isActive(link.path) && (
                <motion.div
                  layoutId="navbar-active"
                  className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 rounded-xl border border-purple-500/30"
                  transition={{ type: 'spring', duration: 0.5 }}
                />
              )}
              <link.icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{link.label}</span>
            </Link>
          ))}
          {(user?.role === 'COMPANY' || user?.role === 'ADMIN') && (
            <Link
              to="/create-challenge"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 transition-all glow-blue btn-shimmer"
            >
              <Plus className="w-4 h-4" />
              Create
            </Link>
          )}
        </div>

        {/* User Section */}
        <div className="flex items-center gap-4">
          {user?.role !== 'COMPANY' && (
            user?.isPremium ? (
              <Link to="/premium" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/40 text-yellow-300 text-xs font-bold" title="Premium is active">
                <Crown className="w-4 h-4" /> PREMIUM
              </Link>
            ) : (
              <Link to="/premium" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 text-xs font-bold hover:from-yellow-400 hover:to-orange-400 transition-all">
                <Crown className="w-4 h-4" /> Upgrade
              </Link>
            )
          )}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl glass border border-yellow-500/20">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-bold text-yellow-400">{user?.xp} XP</span>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-full blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 flex items-center justify-center font-bold text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-600/10 rounded-xl transition-all"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;