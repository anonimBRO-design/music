import React, { useState } from 'react';
import { usePlayerStore } from '../stores/usePlayerStore';
import { useToastStore } from '../stores/useToastStore';
import { Radio, Users, Copy, Sparkles, Music2 } from 'lucide-react';

export const PartyPage = () => {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const showToast = useToastStore((s) => s.showToast);

  const [roomCode, setRoomCode] = useState('NONIM-8842');
  const [inRoom, setInRoom] = useState(false);
  const [joinInput, setJoinInput] = useState('');

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    showToast('Room code copied to clipboard!', 'success');
  };

  return (
    <div className="space-y-8 p-6 md:p-8 font-syne select-none max-w-4xl">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full">
          Realtime Audio Sync
        </span>
        <h1 className="text-2xl md:text-4xl font-extrabold text-white mt-2">Listening Party</h1>
        <p className="text-xs md:text-sm text-zinc-400 mt-1">
          Listen along with friends in real-time with synchronized playback.
        </p>
      </div>

      {!inRoom ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Host Card */}
          <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Host a Party</h2>
              <p className="text-xs text-zinc-400 mt-1">Start a room and invite your friends to listen together.</p>
            </div>
            <button
              onClick={() => {
                setInRoom(true);
                showToast('Party room created!', 'success');
              }}
              className="w-full py-3 rounded-full bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-xs transition-all shadow-lg shadow-emerald-500/20"
            >
              Start Hosting
            </button>
          </div>

          {/* Join Card */}
          <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Join a Room</h2>
              <p className="text-xs text-zinc-400 mt-1">Enter a room code from your friend to tune in.</p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={joinInput}
                onChange={(e) => setJoinInput(e.target.value.toUpperCase())}
                placeholder="e.g. NONIM-8842"
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-xs text-white uppercase tracking-wider focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={() => {
                  if (!joinInput.trim()) return;
                  setRoomCode(joinInput.trim());
                  setInRoom(true);
                  showToast(`Joined party room ${joinInput.trim()}`, 'success');
                }}
                className="px-6 py-2.5 rounded-full bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs transition-all"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 md:p-8 rounded-3xl bg-white/[0.03] border border-white/10 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <div className="text-xs text-zinc-400">Active Room Code</div>
                <div className="text-xl font-black text-white font-mono tracking-widest">{roomCode}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyCode}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-colors"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Code
              </button>
              <button
                onClick={() => setInRoom(false)}
                className="px-4 py-2 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-colors"
              >
                Leave Room
              </button>
            </div>
          </div>

          {/* Currently Streaming in Room */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
              Synchronized Track
            </div>
            {currentTrack ? (
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                <img src={currentTrack.thumbnail} alt="" className="w-14 h-14 rounded-xl object-cover" />
                <div>
                  <div className="text-sm font-bold text-white">{currentTrack.title}</div>
                  <div className="text-xs text-zinc-400">{currentTrack.artist}</div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-zinc-500 bg-white/[0.01] rounded-2xl">
                Play any track to start broadcasting to room members
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
