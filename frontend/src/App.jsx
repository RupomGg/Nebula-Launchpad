import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TokenPage from './pages/TokenPage';
import LaunchToken from './pages/LaunchToken';
import Profile from './pages/Profile';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <div className="min-h-screen text-white relative">
      {/* Global Background Image */}
      <div className="fixed inset-0 -z-50 pointer-events-none">
        <img 
            src="https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2342&auto=format&fit=crop" 
            alt="Background" 
            className="w-full h-full object-cover opacity-50" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0E14]/90 via-[#0B0E14]/50 to-[#0B0E14]"></div>
      </div>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/launch" element={<LaunchToken />} />
        <Route path="/token/:address" element={<TokenPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </div>
  );
}

export default App;
