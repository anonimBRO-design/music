import React, { useState } from 'react';
import { useToastStore } from '../stores/useToastStore';
import { Shield, Key, Users, CheckCircle, Database } from 'lucide-react';

export const AdminPage = () => {
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const showToast = useToastStore((s) => s.showToast);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'L' && password === 'lawlieto') {
      setAuthed(true);
      showToast('Welcome back Administrator L', 'success');
    } else {
      showToast('Invalid administrator credentials', 'error');
    }
  };

  return (
    <div className="space-y-8 p-6 md:p-8 font-syne select-none max-w-4xl">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full">
          Super Admin Console
        </span>
        <h1 className="text-2xl md:text-4xl font-extrabold text-white mt-2">Administrator Panel</h1>
      </div>

      {!authed ? (
        <form onSubmit={handleLogin} className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 max-w-md space-y-4 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-pink-400" />
            <h2 className="text-base font-bold text-white">Admin Authentication</h2>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full bg-pink-500 hover:bg-pink-400 text-white font-bold text-xs transition-all shadow-lg shadow-pink-500/20"
          >
            Authenticate
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase">
                <Users className="w-4 h-4 text-emerald-400" />
                Active Sessions
              </div>
              <div className="text-2xl font-black text-white">1</div>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase">
                <Database className="w-4 h-4 text-cyan-400" />
                Serverless Functions
              </div>
              <div className="text-2xl font-black text-white">Healthy (Vercel)</div>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase">
                <CheckCircle className="w-4 h-4 text-pink-400" />
                Admin Status
              </div>
              <div className="text-2xl font-black text-emerald-400">Authenticated</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
