import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../api';
import Navbar from '../components/Navbar';
import Starfield from '../components/Starfield';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Zap, Send, Sparkles, CheckCircle2, ChevronLeft, Play, FileCode, X, ChevronDown, AlertCircle, BookOpen, Target, Lightbulb, Lock, ArrowRight, Crown } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import AITutor from '../components/AITutor';
import { AuthContext } from '../context/AuthContext';
import { TESTS_BY_TITLE } from '../data/testCases';

const LANGUAGES = [
  { id: 'python', label: 'Python 3.10', ext: '.py', monacoLang: 'python' },
  { id: 'javascript', label: 'Node.js 18', ext: '.js', monacoLang: 'javascript' },
];

// Test cases now live in ../data/testCases.js (generated from backend/data/curriculum.js).
const getTestCases = (title) => {
  const list = title ? TESTS_BY_TITLE[title.trim().toLowerCase()] : null;
  if (!list) return { tests: [{ id: 1, input: 'Custom', expected: 'Success', call: 'print("Success")' }] };
  return { tests: list.map((t, i) => ({ id: i + 1, input: t.call, expected: t.expected, call: t.call })) };
};

// Exact match (True/False are case-insensitive because JavaScript prints them in lowercase).
const sameOutput = (actual, expected) =>
  /^(true|false)$/i.test(expected) ? actual.toLowerCase() === expected.toLowerCase() : actual === expected;

const ChallengeDetail = () => {
  const { id } = useParams();
  const [challenge, setChallenge] = useState(null);
  const [content, setContent] = useState('');
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Waiting-for-Gemini state: { id, failed }  (null when not waiting)
  const [pending, setPending] = useState(null);

  // Learning path + hints
  const [allChallenges, setAllChallenges] = useState([]);
  const [progress, setProgress] = useState(null);
  const [hints, setHints] = useState([]);
  const [hintLoading, setHintLoading] = useState(false);
  const [waitSeconds, setWaitSeconds] = useState(0);
  const [skipping, setSkipping] = useState(false);
  const { refreshUser } = useContext(AuthContext);
  
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [testResults, setTestResults] = useState([]);
  
  // STATES FOR TABS & SOLUTION
  const [activeTab, setActiveTab] = useState('lesson'); 
  const [showSolution, setShowSolution] = useState(false);

  const [language, setLanguage] = useState(LANGUAGES[0]); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChallenge = async () => {
      // Moving to another step: reset everything from the previous one
      setSubmission(null); setPending(null); setSubmitting(false); setContent('');
      setHints([]); setTestResults([]); setShowTestPanel(false); setActiveTab('lesson'); setShowSolution(false);
      try {
        const [res, progRes] = await Promise.all([api.get('/challenges'), api.get('/challenges/progress')]);
        setAllChallenges(res.data);
        setProgress(progRes.data);
        const found = res.data.find((c) => c.id === id);
        setChallenge(found);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenge();
  }, [id]);

  // Show a finished grade (from Gemini OR the instant grader)
  const finishGrading = (data) => {
    setSubmission(data);
    setPending(null);
    setSubmitting(false);
    refreshUser?.();
    api.get('/challenges/progress').then((r) => setProgress(r.data)).catch(() => {});
    if (data.status === 'LOCAL_GRADED') toast('Instant grade applied (provisional)', { icon: '⚡' });
    else toast.success('AI Review Complete! 🎉');
  };

  // While waiting, poll the backend until Gemini is done (no 9-second limit)
  useEffect(() => {
    if (!pending || pending.failed) return;
    const startedAt = Date.now();
    setWaitSeconds(0);
    const timer = setInterval(() => setWaitSeconds(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    const poll = setInterval(async () => {
      try {
        const res = await api.get(`/submissions/${pending.id}`);
        if (res.data.status === 'REVIEWED' || res.data.status === 'LOCAL_GRADED') finishGrading(res.data);
        else if (res.data.status === 'AI_FAILED') setPending({ id: pending.id, failed: true });
      } catch (err) {
        // temporary network error: keep waiting
      }
    }, 3000);
    return () => { clearInterval(timer); clearInterval(poll); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending?.id, pending?.failed]);

  // "Skip waiting": ask the backend for the instant test-case grade
  const handleSkipWaiting = async () => {
    if (!pending) return;
    setSkipping(true);
    try {
      const res = await api.post(`/submissions/${pending.id}/quick-grade`, { language: language.id });
      finishGrading(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Instant grader failed. Try again.');
    } finally {
      setSkipping(false);
    }
  };

  // Progressive hints: level 1 (nudge) -> 2 (specific) -> 3 (approach). Never the full answer.
  const handleHint = async () => {
    if (hints.length >= 3 || hintLoading) return;
    setHintLoading(true);
    try {
      const res = await api.post('/ai/hint', { challengeId: id, level: hints.length + 1, userCode: content });
      setHints((prev) => [...prev, res.data.hint]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not get a hint right now.');
    } finally {
      setHintLoading(false);
    }
  };

  const handleRunTests = async () => {
    if (!content.trim()) {
      toast.error('Please write some code first!');
      return;
    }
    setIsRunningTests(true);
    setShowTestPanel(true);
    setTestResults([]);

    const testConfig = getTestCases(challenge?.title);

    try {
      const results = [];
      let hasError = false;

      for (const test of testConfig.tests) {
        // THE FIX IS HERE: We assign the result to a variable and only print it if it's not None
        const codeToRun = `${content}\n\nprint("---TEST-OUTPUT---")\nresult = ${test.call}\nif result is not None:\n    print(result)`;
        
        const res = await api.post('/execute', { code: codeToRun, language: language.id });

        if (!res.data || !res.data.run) throw new Error("Execution server error.");

        if (res.data.run.stderr) {
          results.push({ id: test.id, input: test.call, expected: test.expected, actual: 'Error', passed: false, error: res.data.run.stderr });
          hasError = true;
          break;
        }

        let actualOutput = res.data.run.stdout;
        if (actualOutput.includes('---TEST-OUTPUT---')) {
          actualOutput = actualOutput.split('---TEST-OUTPUT---')[1].trim();
        } else {
          actualOutput = actualOutput.trim();
        }

        // If the output is empty because the function just printed, we fallback to checking the whole stdout
        // This handles cases where the user's function has a print statement
        if (!actualOutput && res.data.run.stdout.trim().includes(test.expected)) {
           actualOutput = test.expected;
        }

        results.push({ id: test.id, input: test.call, expected: test.expected, actual: actualOutput, passed: sameOutput(actualOutput, test.expected) });
      }

      setTestResults(results);
      
      if (!hasError) {
        if (results.every(r => r.passed)) toast.success('All test cases passed! 🎉');
        else toast.error('Some test cases failed.');
      } else {
        toast.error('Syntax error detected.');
      }
    } catch (err) {
      setTestResults([{ id: 1, input: 'API Error', expected: 'Success', actual: 'Failed', passed: false, error: "Failed to connect to execution server." }]);
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Please write some code before submitting.');
      return;
    }
    setSubmitting(true);
    setShowTestPanel(false);
    try {
      // Returns immediately with a PENDING submission; Gemini reviews in the background
      const res = await api.post('/submissions', { content, challengeId: id, language: language.id });
      setPending({ id: res.data.id, failed: false });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
      setSubmitting(false);
    }
  };

  const difficultyStyle = (level) => {
    switch (level) {
      case 'VERY BASIC': return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
      case 'EASY': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'NORMAL': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'HARD': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  if (loading) return <div className="min-h-screen cosmic-bg flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!challenge) return <div className="min-h-screen cosmic-bg flex items-center justify-center"><Navbar /><p className="text-red-400 text-xl">Challenge not found</p></div>;

  // Premium question and the student has no Premium
  if (challenge.premiumLocked || (challenge.isPremium && progress && !progress.unlockedIds.includes(challenge.id))) {
    return (
      <div className="min-h-screen cosmic-bg relative">
        <Starfield />
        <div className="relative z-10">
          <Navbar />
          <div className="max-w-md mx-auto mt-32 glass rounded-2xl p-10 text-center border border-yellow-400/40">
            <Crown className="w-14 h-14 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2 font-display">Premium question</h2>
            <p className="text-gray-400 text-sm mb-6">“{challenge.title}” is part of Interview Prep. Upgrade to Premium, or earn free Premium days, to open it.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate('/premium')} className="px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900">Get Premium</button>
              <button onClick={() => navigate('/earn')} className="px-6 py-2.5 rounded-xl font-bold text-sm glass border border-slate-600 text-white">Earn it free</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (progress && !progress.unlockedIds.includes(challenge.id)) {
    return (
      <div className="min-h-screen cosmic-bg relative">
        <Starfield />
        <div className="relative z-10">
          <Navbar />
          <div className="max-w-md mx-auto mt-32 glass rounded-2xl p-10 text-center border border-slate-700/50">
            <Lock className="w-14 h-14 text-slate-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2 font-display">This step is locked</h2>
            <p className="text-gray-400 text-sm mb-6">Finish the previous step on your roadmap (score {progress.passScore}+) to unlock “{challenge.title}”.</p>
            <button onClick={() => navigate('/dashboard')} className="px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white">Back to Roadmap</button>
          </div>
        </div>
      </div>
    );
  }

  const passScore = progress?.passScore ?? 70;
  const nextChallenge = allChallenges
    .filter((c) => !c.creatorId && !c.isPremium && c.order > challenge.order)
    .sort((a, b) => a.order - b.order)[0];

  return (
    <div className="h-screen flex flex-col cosmic-bg relative overflow-hidden">
      <Starfield />
      <div className="relative z-10 flex flex-col h-full">
        <Navbar />
        <div className="flex-1 overflow-hidden max-w-[1600px] w-full mx-auto p-4 flex flex-col">
          
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <button onClick={() => navigate(challenge.isPremium ? '/interview' : '/dashboard')} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {challenge.isPremium ? 'Back to Interview Prep' : 'Back to Dashboard'}
            </button>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 pb-4">
            
            {/* Left Pane: Learn & Description */}
            <div className="lg:col-span-5 flex flex-col h-full min-h-0">
              <div className="glass-strong rounded-2xl border border-slate-700/50 flex flex-col h-full overflow-hidden">
                
                {/* TABS */}
                <div className="flex border-b border-slate-700/50 bg-slate-900/50 p-2 gap-2">
                  <button
                    onClick={() => setActiveTab('lesson')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                      activeTab === 'lesson' ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" /> Learn Concept
                  </button>
                  <button
                    onClick={() => setActiveTab('challenge')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                      activeTab === 'challenge' ? 'bg-purple-600/30 text-purple-400 border border-purple-500/30' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Target className="w-4 h-4" /> The Challenge
                  </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                  {/* TAB CONTENT */}
                  {activeTab === 'lesson' ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose prose-invert prose-sm max-w-none prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-slate-700">
                      {challenge.lesson ? (
                        <ReactMarkdown>{challenge.lesson}</ReactMarkdown>
                      ) : (
                        <div className="text-center py-10 text-gray-500">
                          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No lesson available for this topic yet.</p>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
                      <div className="flex-shrink-0 mb-4">
                        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                          <span>Step {challenge.order}</span>
                          <span>•</span>
                          <span>{challenge.topic}</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2 font-display">{challenge.title}</h1>
                        <div className="flex flex-wrap gap-2 mb-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${difficultyStyle(challenge.difficulty)}`}>{challenge.difficulty}</span>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold border border-yellow-500/30 text-yellow-400 bg-yellow-500/10 flex items-center gap-1"><Zap className="w-3 h-3" /> {challenge.xpReward} XP</span>
                        </div>
                      </div>

                      <div className="flex-1 text-gray-300 leading-relaxed text-sm">
                        <p className="whitespace-pre-line mb-8">{challenge.description}</p>

                        {/* Progressive Hints */}
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-3">
                            <span className="flex items-center gap-2 text-sm font-bold text-yellow-400"><Lightbulb className="w-4 h-4" /> Hints ({hints.length}/3 used)</span>
                            {hints.length < 3 && (
                              <button type="button" onClick={handleHint} disabled={hintLoading} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/20 transition-all disabled:opacity-50">
                                {hintLoading ? 'Thinking…' : hints.length === 0 ? 'Give me a hint' : 'I need a bigger hint'}
                              </button>
                            )}
                          </div>
                          {hints.map((h, i) => (
                            <div key={i} className="mb-2 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 text-sm text-gray-300 prose prose-invert prose-sm max-w-none">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-500/80 not-prose block mb-1">Hint {i + 1}</span>
                              <ReactMarkdown>{h}</ReactMarkdown>
                            </div>
                          ))}
                        </div>

                        {/* View Solution Button */}
                        {challenge.solution && (
                          <div className="mt-auto pt-6 border-t border-slate-700/50">
                            <button 
                              onClick={() => setShowSolution(!showSolution)}
                              className="flex items-center gap-2 text-sm font-bold text-sky-400 hover:text-sky-300 transition-colors bg-sky-500/10 px-4 py-2 rounded-lg border border-sky-500/20"
                            >
                              <FileCode className="w-4 h-4" />
                              {showSolution ? 'Hide Solution' : 'View Solution & Dry Run'}
                            </button>
                            <AnimatePresence>
                              {showSolution && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 p-4 rounded-xl bg-slate-900/80 border border-slate-700 overflow-hidden">
                                  <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-slate-700">
                                    <ReactMarkdown>{challenge.solution}</ReactMarkdown>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Pane: Editor */}
            <div className="lg:col-span-7 flex flex-col h-full min-h-0">
              <div className="flex-1 glass rounded-2xl border border-slate-700/50 flex flex-col overflow-hidden shadow-2xl relative">
                
                <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-700/50 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-md border border-slate-700 text-xs text-gray-400">
                    <FileCode className="w-3 h-3" /> solution{language.ext}
                  </div>
                  <select value={language.id} onChange={(e) => setLanguage(LANGUAGES.find(l => l.id === e.target.value))} className="bg-slate-800 border border-slate-700 text-xs text-gray-300 py-1.5 pl-3 pr-8 rounded-md cursor-pointer hover:bg-slate-700 focus:outline-none">
                    {LANGUAGES.map(lang => <option key={lang.id} value={lang.id}>{lang.label}</option>)}
                  </select>
                </div>

                <div className="flex-1 flex flex-col min-h-0 relative">
                  <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 relative bg-[#0d1117] overflow-hidden">
                      <Editor height="100%" language={language.monacoLang} theme="vs-dark" value={content} onChange={(val) => setContent(val || '')} options={{ minimap: { enabled: false }, fontSize: 14, fontFamily: "'Fira Code', monospace", lineHeight: 1.6, padding: { top: 16 }, scrollBeyondLastLine: false, formatOnPaste: true }} />
                    </div>

                    {!submission && (
                      <div className="bg-slate-900/90 px-4 py-3 border-t border-slate-700/50 flex items-center justify-between flex-shrink-0">
                        <button type="button" onClick={handleRunTests} disabled={isRunningTests} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isRunningTests ? 'bg-slate-800 text-gray-500' : 'bg-slate-800 hover:bg-slate-700 text-gray-300'}`}>
                          {isRunningTests ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play className="w-3 h-3" />} Run Tests
                        </button>
                        <button type="submit" disabled={submitting} className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${submitting ? 'bg-slate-700 text-gray-400' : 'bg-blue-600 hover:bg-blue-500 text-white glow-blue'}`}>
                          {submitting ? 'Evaluating...' : 'Submit Solution'}
                          {!submitting && <Send className="w-4 h-4" />}
                        </button>
                      </div>
                    )}
                  </form>

                  <AnimatePresence>
                    {showTestPanel && (
                      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="absolute bottom-0 left-0 right-0 h-64 bg-slate-900 border-t border-slate-700/80 shadow-2xl z-30 flex flex-col">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-950/50">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Test Results</span>
                          <button onClick={() => setShowTestPanel(false)} className="text-gray-500 hover:text-white p-1"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                          {isRunningTests ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" /><p className="text-xs">Executing...</p></div>
                          ) : (
                            testResults.map((result, index) => (
                              <div key={result.id} className={`border rounded-lg p-3 ${result.passed ? 'bg-slate-800/40 border-slate-700/50' : 'bg-red-500/10 border-red-500/30'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                  {result.passed ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                                  <span className={`text-xs font-bold ${result.passed ? 'text-green-400' : 'text-red-400'}`}>Test Case {index + 1}</span>
                                </div>
                                {result.error ? (
                                  <div className="text-xs font-mono text-red-400 bg-red-950/30 p-2 rounded mt-2 whitespace-pre-wrap">{result.error}</div>
                                ) : (
                                  <div className="grid grid-cols-3 gap-4 text-xs font-mono mt-3">
                                    <div><span className="text-gray-500 block mb-1">Input:</span><code className="text-gray-300 bg-slate-950/50 px-2 py-1 rounded block truncate">{result.input}</code></div>
                                    <div><span className="text-gray-500 block mb-1">Expected:</span><code className="text-gray-300 bg-slate-950/50 px-2 py-1 rounded block truncate">{result.expected}</code></div>
                                    <div><span className="text-gray-500 block mb-1">Actual:</span><code className={`bg-slate-950/50 px-2 py-1 rounded block truncate ${result.passed ? 'text-green-400' : 'text-red-400'}`}>{result.actual}</code></div>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <AnimatePresence>
                  {pending && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0d1117]/95 z-40 flex flex-col items-center justify-center p-8 text-center">
                      {pending.failed ? (
                        <>
                          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                          <h3 className="text-xl font-bold text-white mb-2">AI reviewer is unavailable</h3>
                          <p className="text-sm text-gray-400 max-w-md mb-6">Gemini could not review your code right now. You can get an instant provisional grade from automated tests, or go back and submit again later.</p>
                        </>
                      ) : (
                        <>
                          <div className="w-14 h-14 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-5" />
                          <h3 className="text-xl font-bold text-white mb-2">Gemini is reviewing your code…</h3>
                          <p className="text-sm text-gray-400 mb-1">Waiting {waitSeconds}s — the AI server may be busy, hang tight for the full review.</p>
                          <p className="text-xs text-gray-500 max-w-md mb-6">In a hurry? Skip for an instant score from automated tests only. It's provisional: 100 if all tests pass, 50 if any fail, 0 if empty.</p>
                        </>
                      )}
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={handleSkipWaiting} disabled={skipping} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/20 transition-all disabled:opacity-50">
                          <Zap className="w-4 h-4" /> {skipping ? 'Grading…' : 'Skip & get instant score'}
                        </button>
                        {pending.failed && (
                          <button type="button" onClick={() => { setPending(null); setSubmitting(false); }} className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-slate-800 text-gray-300 hover:bg-slate-700 transition-all">Back to editor</button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {submission && (
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-0 bg-[#0d1117] z-40 flex flex-col p-6 overflow-y-auto">
                      <div className="flex justify-between items-center mb-6 flex-shrink-0">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2"><CheckCircle2 className="w-6 h-6 text-green-400" /> Evaluation Complete</h3>
                        <button onClick={() => setSubmission(null)} className="p-2 hover:bg-slate-800 rounded-lg text-gray-400"><X className="w-5 h-5" /></button>
                      </div>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
                        <div className="bg-slate-900/80 rounded-2xl border border-slate-700/50 p-6 flex flex-col items-center justify-center text-center">
                          <span className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-4">{submission.status === 'LOCAL_GRADED' ? 'Instant Score (Provisional)' : 'AI Score'}</span>
                          <div className="text-6xl font-black text-white">{submission.score}<span className="text-lg text-gray-500">/100</span></div>
                          <div className="mt-6 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-400" /><span className="text-yellow-400 font-bold text-xl">+{submission.xpEarned} XP</span>
                          </div>
                          {submission.score >= passScore ? (
                            nextChallenge ? (
                              <button type="button" onClick={() => navigate(`/challenge/${nextChallenge.id}`)} className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white transition-all">
                                Next step: {nextChallenge.title} <ArrowRight className="w-4 h-4" />
                              </button>
                            ) : (
                              <button type="button" onClick={() => navigate('/dashboard')} className="mt-6 px-5 py-2.5 rounded-xl font-bold text-sm bg-green-600 hover:bg-green-500 text-white transition-all">🎉 Path complete — back to Roadmap</button>
                            )
                          ) : (
                            <div className="mt-6 text-center">
                              <p className="text-xs text-gray-400 mb-3">Score {passScore}+ to unlock the next step.</p>
                              <button type="button" onClick={() => setSubmission(null)} className="px-5 py-2.5 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-gray-200 transition-all">Try again</button>
                            </div>
                          )}
                        </div>
                        <div className="bg-slate-900/80 rounded-2xl border border-slate-700/50 p-6 flex flex-col min-h-0">
                          <h4 className="flex items-center gap-2 text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 border-b border-slate-700/50 pb-3 flex-shrink-0"><Sparkles className="w-4 h-4 text-purple-400" /> Detailed Feedback</h4>
                          <div className="flex-1 text-sm text-gray-300 leading-relaxed overflow-y-auto custom-scrollbar pr-2 prose prose-invert max-w-none">
                            <ReactMarkdown>{submission.feedback}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AITutor challengeDescription={challenge.description} userCode={content} />
    </div>
  );
};

export default ChallengeDetail;