import React, { useState } from 'react';
import { Leaf, Lock, Mail, ArrowRight } from 'lucide-react';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // --- HARDCODED CREDENTIALS ---
    if (email === 'admin@nursery.com' && password === 'admin123') {
      onLogin(); // Success! Call the parent function
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Login Form Section */}
        <div className="w-full p-8 md:p-10">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Leaf className="text-green-600" size={32} />
            </div>
          </div>
          
          <h2 className="text-2xl font-black text-center text-gray-800 mb-1">Welcome Back</h2>
          <p className="text-center text-gray-500 text-sm mb-8">Sign in to access your Invoice Dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-sm font-medium"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-sm font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded animate-pulse">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-green-500/30 transition-all flex items-center justify-center gap-2 group"
            >
              Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Default Login: <span className="font-mono text-gray-600">admin@nursery.com</span> / <span className="font-mono text-gray-600">admin123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;