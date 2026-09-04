import React, { useState } from 'react';
import { useUserStore } from '../stores/useUserStore';
import { useToastStore } from '../stores/useToastStore';
import { User, Calendar, Disc, Heart, Clock, Edit2, Save } from 'lucide-react';

export const ProfilePage = () => {
  const profile = useUserStore((s) => s.profile);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const likedSongs = useUserStore((s) => s.likedSongs);
  const history = useUserStore((s) => s.history);
  const stats = useUserStore((s) => s.stats);
  const showToast = useToastStore((s) => s.showToast);

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(profile.username || 'Listener');

  const handleSave = (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    updateProfile({ username: username.trim() });
    setIsEditing(false);
    showToast('Profile updated', 'success');
  };

  const totalMinutes = Math.floor((stats.seconds || 0) / 60);

  return (
    <div className="space-y-8 p-6 md:p-8 font-syne select-none max-w-4xl">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-3xl bg-white/[0.03] border border-white/5 shadow-xl">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-extrabold shadow-2xl shrink-0">
          {profile.username ? profile.username[0].toUpperCase() : 'L'}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-3 py-0.5 rounded-full">
            Listener Profile
          </span>
          {isEditing ? (
            <form onSubmit={handleSave} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-base font-bold text-white focus:outline-none focus:border-emerald-500"
                autoFocus
              />
              <button
                type="submit"
                className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-emerald-400 text-black text-xs font-bold ios-btn-spring cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" /> Save
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <h1 className="text-2xl font-black text-white">{profile.username || 'Listener'}</h1>
              <button
                onClick={() => setIsEditing(true)}
                className="text-zinc-400 hover:text-white p-1 ios-btn-icon cursor-pointer"
                title="Edit username"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="text-xs text-zinc-400 flex items-center justify-center sm:justify-start gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Member since {(() => {
              try {
                const d = new Date(profile.memberSince || Date.now());
                return !isNaN(d.getTime()) ? d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : '2026';
              } catch (e) {
                return '2026';
              }
            })()}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <Disc className="w-4 h-4 text-emerald-400" />
            Total Plays
          </div>
          <div className="text-2xl font-black text-white">{stats.plays || 0}</div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <Heart className="w-4 h-4 text-pink-400" />
            Liked Songs
          </div>
          <div className="text-2xl font-black text-white">{likedSongs.length}</div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <Clock className="w-4 h-4 text-cyan-400" />
            Time Streamed
          </div>
          <div className="text-2xl font-black text-white">{totalMinutes} min</div>
        </div>
      </div>
    </div>
  );
};
