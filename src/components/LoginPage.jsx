import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase'; // Import auth
import { Leaf, Lock, Mail, ArrowRight } from 'lucide-react';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // THIS IS THE REAL LOGIN
      await signInWithEmailAndPassword(auth, email, password);
      onLogin(); // Tell App.jsx we are in
    } catch (err) {
      setError("Login failed: " + err.message);
    }
  };

  return (
    // ... (Keep your existing UI code exactly the same, just use handleSubmit above)
    // You can copy the JSX from your previous LoginPage.jsx here
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
       <div className="bg-white p-8 rounded shadow-md w-96">
          <h2 className="text-2xl font-bold mb-4 text-center">Nursery Login</h2>
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}
              className="w-full border p-2 rounded"
            />
            <input 
              type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}
              className="w-full border p-2 rounded"
            />
            <button className="w-full bg-green-700 text-white p-2 rounded">Sign In</button>
          </form>
       </div>
    </div>
  );
};

export default LoginPage;