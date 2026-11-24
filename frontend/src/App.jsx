import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ChallengeDetail from './pages/ChallengeDetail';
import MySubmissions from './pages/MySubmissions';
import Leaderboard from './pages/Leaderboard';
import CreateChallenge from './pages/CreateChallenge';
import ChallengeSubmissions from './pages/ChallengeSubmissions';
import Landing from './pages/Landing';
import Premium from './pages/Premium';
import Interview from './pages/Interview';
import Earn from './pages/Earn';

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Loading SkillArena...</p>
      </div>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/challenge/:id" element={user ? <ChallengeDetail /> : <Navigate to="/login" />} />
        <Route path="/my-submissions" element={user ? <MySubmissions /> : <Navigate to="/login" />} />
        <Route path="/leaderboard" element={user ? <Leaderboard /> : <Navigate to="/login" />} />
        <Route path="/create-challenge" element={user ? <CreateChallenge /> : <Navigate to="/login" />} />
        <Route path="/challenge/:id/submissions" element={user ? <ChallengeSubmissions /> : <Navigate to="/login" />} />
        <Route path="/premium" element={user ? <Premium /> : <Navigate to="/login" />} />
        <Route path="/interview" element={user ? <Interview /> : <Navigate to="/login" />} />
        <Route path="/earn" element={user ? <Earn /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;