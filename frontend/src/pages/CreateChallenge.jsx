import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';

const CreateChallenge = () => {
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'CODING', difficulty: 'EASY', xpReward: 100, deadline: '2026-12-31',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/challenges', formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700">
          <h1 className="text-3xl font-bold text-white mb-6">Create a New Challenge</h1>
          {error && <p className="text-red-400 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Title</label>
              <input type="text" name="title" onChange={handleChange} className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:border-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Description</label>
              <textarea name="description" rows="4" onChange={handleChange} className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:border-blue-500" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Category</label>
                <select name="category" onChange={handleChange} className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:border-blue-500">
                  <option value="CODING">Coding</option>
                  <option value="DESIGN">Design</option>
                  <option value="WRITING">Writing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Difficulty</label>
                <select name="difficulty" onChange={handleChange} className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:border-blue-500">
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">XP Reward</label>
                <input type="number" name="xpReward" onChange={handleChange} className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:border-blue-500" defaultValue={100} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Deadline</label>
                <input type="date" name="deadline" onChange={handleChange} className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:border-blue-500" defaultValue="2026-12-31" required />
              </div>
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all mt-4">
              Create Challenge
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateChallenge;