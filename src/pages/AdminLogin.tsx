/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db, supabase } from '../lib/supabase';
import { toast } from '../components/Toast';
import { KeyRound, ShieldAlert, Sparkles, User, Info } from 'lucide-react';
import Logo from '../components/Logo';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    // If already logged in, redirect
    const authed = localStorage.getItem('driveeaze_admin_authed');
    if (authed === 'true') {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in email & password.");
      return;
    }

    setLogging(true);

    setTimeout(() => {
      setLogging(false);
      const isEmailValid = email.trim().toLowerCase() === 'admin@driveeaze.in';
      const isPasswordValid = password === 'Admin@5678956789';

      if (isEmailValid && isPasswordValid) {
        localStorage.setItem('driveeaze_admin_authed', 'true');
        localStorage.setItem('driveeaze_admin_email', email.trim());
        toast.success("🔑 Admin portal access authorized!");
        navigate('/admin/dashboard');
      } else {
        toast.error("Invalid administrator credentials. Try again.");
      }
    }, 850);
  };

  return (
    <div className="bg-[#070c0e] min-h-[85vh] flex items-center justify-center p-4 relative" id="admin-login-viewport">
      
      {/* Decorative vector sparks mapped to cyber teal */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#00dfc1]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-[#008b81]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-[#0c1518] border border-[#132125] rounded-xl p-8 space-y-6 shadow-2xl relative" id="admin-login-box">
        
        {/* Branding header with circular Logo Badge */}
        <div className="text-center space-y-4 flex flex-col items-center justify-center">
          <Link to="/" className="focus:outline-none">
            <Logo size={135} variant="badge" />
          </Link>
          <h1 className="font-display text-xl font-bold text-white tracking-tight pt-1">Staff Administrator Portal</h1>
          <p className="text-xs text-[#8da4a8] max-w-xs mx-auto">Access Lucknow fleet listings, active rental bookings, and review approval queues.</p>
        </div>


        <form onSubmit={handleLogin} className="space-y-4" id="admin-login-form">
          {/* Email input */}
          <div className="space-y-1 text-left">
            <label className="text-xs font-mono font-medium text-white block">Official Staff Email</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"><User size={14} /></span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@driveeaze.in"
                className="w-full pl-10 pr-4 py-3 bg-[#0d0d0d] border border-[#262626] text-white text-xs rounded-lg focus:outline-none focus:border-[#f97316]"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1 text-left">
            <label className="text-xs font-mono font-medium text-white block">Access Key</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"><KeyRound size={14} /></span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 bg-[#0d0d0d] border border-[#262626] text-white text-xs rounded-lg focus:outline-none focus:border-[#f97316]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={logging}
            className="w-full py-3.5 bg-[#f97316] hover:bg-orange-600 disabled:bg-[#202020] text-black font-display font-black text-sm rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {logging ? "Decrypting Session Keys..." : "Authorize Portal Access 🔑"}
          </button>
        </form>

        <div className="text-center">
          <Link to="/" className="text-xs font-mono text-[#525252] hover:text-white underline transition-colors">
            Cancel and Return to Homepage
          </Link>
        </div>

      </div>
    </div>
  );
}
