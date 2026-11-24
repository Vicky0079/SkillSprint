import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';

const ChallengeSubmissions = () => {
  const { id } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await api.get(`/challenges/${id}/submissions`);
        setSubmissions(res.data);
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || 'Failed to load submissions');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [id, navigate]);

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-white mb-8">👥 Student Submissions</h1>
        {loading && <p className="text-gray-400">Loading submissions...</p>}
        {!loading && submissions.length === 0 && (
          <div className="text-center py-16 bg-slate-800 rounded-xl border border-slate-700">
            <p className="text-gray-400 text-lg">No submissions yet for this challenge.</p>
          </div>
        )}
        <div className="space-y-6">
          {submissions.map((sub) => (
            <div key={sub.id} className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-bold text-blue-400">{sub.user.name}</h2>
                  <p className="text-xs text-gray-500">{sub.user.email} | XP: {sub.user.xp}</p>
                </div>
                <span className="text-sm text-gray-500">{new Date(sub.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-lg mb-4 border border-slate-700">
                <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Student's Work</p>
                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">{sub.content}</pre>
              </div>
              {sub.status === 'REVIEWED' ? (
                <div className="bg-green-600/10 border border-green-600/20 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-green-400">✅ AI Reviewed</span>
                    <span className="text-lg font-bold text-yellow-400">Score: {sub.score}/100</span>
                  </div>
                  <p className="text-sm text-gray-300">{sub.feedback}</p>
                </div>
              ) : (
                <div className="bg-yellow-600/10 border border-yellow-600/20 p-4 rounded-lg">
                  <p className="text-sm text-yellow-400">⏳ Pending AI Review</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChallengeSubmissions;