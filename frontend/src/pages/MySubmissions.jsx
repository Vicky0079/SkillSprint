import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileCode2, CheckCircle2, Clock, AlertTriangle, Copy, Check, ChevronDown, ChevronUp, Target, Inbox } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import Navbar from '../components/Navbar';
import Starfield from '../components/Starfield';

const isGraded = (s) => s.status === 'REVIEWED' || s.status === 'LOCAL_GRADED';

const scoreColor = (score) =>
  score >= 70 ? { text: 'text-emerald-400', bar: 'from-emerald-400 to-teal-500', box: 'bg-emerald-500/10 border-emerald-500/25' }
  : score >= 40 ? { text: 'text-amber-400', bar: 'from-amber-400 to-amber-500', box: 'bg-amber-500/10 border-amber-500/25' }
  : { text: 'text-rose-400', bar: 'from-rose-400 to-red-500', box: 'bg-rose-500/10 border-rose-500/25' };

const FILTERS = [
  { id: 'ALL', label: 'All' },
  { id: 'GRADED', label: 'Graded' },
  { id: 'PENDING', label: 'Pending' },
];

const SubmissionCard = ({ sub, index }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const long = (sub.content || '').split('\n').length > 6;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(sub.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Could not copy');
    }
  };

  const graded = isGraded(sub);
  const c = graded ? scoreColor(sub.score ?? 0) : null;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index, 8) * 0.05 }} className="glass rounded-2xl p-6 hover:border-indigo-400/30 transition-colors">
      <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold font-display text-white">{sub.challenge?.title || 'Challenge'}</h2>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(sub.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
            {' • '}
            {new Date(sub.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        {graded ? (
          <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${c.box} ${c.text}`}><CheckCircle2 className="w-3.5 h-3.5" /> Graded</span>
        ) : sub.status === 'AI_FAILED' ? (
          <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border bg-slate-500/10 border-slate-500/30 text-slate-300"><AlertTriangle className="w-3.5 h-3.5" /> Review unavailable</span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border bg-amber-500/10 border-amber-500/30 text-amber-300"><Clock className="w-3.5 h-3.5" /> Pending review</span>
        )}
      </div>

      {/* Code */}
      <div className="rounded-xl bg-slate-950/60 border border-slate-700/50 mb-4 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50 bg-slate-900/60">
          <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider flex items-center gap-1.5"><FileCode2 className="w-3.5 h-3.5" /> Your submission</span>
          <button onClick={copy} className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors">
            {copied ? <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
          </button>
        </div>
        <pre className={`p-4 text-sm text-slate-200 whitespace-pre-wrap font-mono overflow-x-auto ${long && !open ? 'max-h-36 overflow-hidden' : ''}`}>{sub.content}</pre>
        {long && (
          <button onClick={() => setOpen(!open)} className="w-full py-2 text-xs text-sky-400 hover:text-sky-300 border-t border-slate-700/50 flex items-center justify-center gap-1">
            {open ? <>Show less <ChevronUp className="w-3.5 h-3.5" /></> : <>Show full code <ChevronDown className="w-3.5 h-3.5" /></>}
          </button>
        )}
      </div>

      {/* Result */}
      {graded ? (
        <div className={`rounded-xl border p-4 ${c.box}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-white">Feedback</span>
            <span className={`text-lg font-bold font-display ${c.text}`}>{sub.score}<span className="text-sm text-gray-500">/100</span></span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden mb-3">
            <div className={`h-full bg-gradient-to-r ${c.bar}`} style={{ width: `${Math.min(sub.score ?? 0, 100)}%` }} />
          </div>
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{sub.feedback}</p>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-sm text-amber-300">
            {sub.status === 'AI_FAILED'
              ? 'The AI reviewer could not process this submission. Open the challenge to get instant grading.'
              : 'Your submission is waiting for review. This usually takes a few moments.'}
          </p>
        </div>
      )}
    </motion.div>
  );
};

const MySubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await api.get('/submissions/my');
        setSubmissions(res.data);
      } catch (err) {
        console.error('Failed to fetch submissions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const stats = useMemo(() => {
    const graded = submissions.filter(isGraded);
    const avg = graded.length ? Math.round(graded.reduce((a, s) => a + (s.score || 0), 0) / graded.length) : 0;
    const best = graded.length ? Math.max(...graded.map((s) => s.score || 0)) : 0;
    return { total: submissions.length, graded: graded.length, avg, best };
  }, [submissions]);

  const visible = submissions.filter((s) =>
    filter === 'ALL' ? true : filter === 'GRADED' ? isGraded(s) : !isGraded(s)
  );

  return (
    <div className="min-h-screen cosmic-bg relative pb-20">
      <Starfield />
      <div className="relative z-10">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 pt-10">
          <h1 className="text-4xl font-bold font-display mb-2">My <span className="brand-text">Submissions</span></h1>
          <p className="text-gray-400 mb-8">Everything you've submitted, with scores and feedback.</p>

          {!loading && submissions.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Submissions', value: stats.total, icon: FileCode2 },
                { label: 'Graded', value: stats.graded, icon: CheckCircle2 },
                { label: 'Average score', value: `${stats.avg}%`, icon: Target },
                { label: 'Best score', value: `${stats.best}%`, icon: Target },
              ].map((s) => (
                <div key={s.label} className="glass rounded-2xl p-4">
                  <s.icon className="w-4 h-4 text-indigo-300 mb-2" />
                  <p className="text-2xl font-bold font-display text-white">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {!loading && submissions.length > 0 && (
            <div className="inline-flex gap-1 p-1.5 glass rounded-2xl mb-6">
              {FILTERS.map((f) => (
                <button key={f.id} onClick={() => setFilter(f.id)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === f.id ? 'bg-indigo-500/25 text-white border border-indigo-400/40' : 'text-gray-400 hover:text-white border border-transparent'}`}>
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {loading && <div className="space-y-5">{[0, 1].map((n) => <div key={n} className="skeleton h-56 rounded-2xl" />)}</div>}

          {!loading && submissions.length === 0 && (
            <div className="glass rounded-2xl text-center py-16 px-6">
              <Inbox className="w-12 h-12 mx-auto mb-4 text-slate-600" />
              <p className="text-white font-semibold text-lg mb-1">No submissions yet</p>
              <p className="text-gray-400 mb-6">Solve your first challenge and it will show up here.</p>
              <Link to="/dashboard" className="inline-flex px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 transition-all">Go to challenges</Link>
            </div>
          )}

          {!loading && submissions.length > 0 && visible.length === 0 && (
            <div className="glass rounded-2xl text-center py-10 text-gray-400">Nothing in this filter.</div>
          )}

          <div className="space-y-5">
            {visible.map((sub, i) => <SubmissionCard key={sub.id} sub={sub} index={i} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MySubmissions;
