import React from 'react';
import { useQueueStore } from '../../stores/useQueueStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useUserStore } from '../../stores/useUserStore';
import { X, GripVertical, Trash2, Heart, Play } from 'lucide-react';

export const QueuePanel = () => {
  const isOpen = useQueueStore((s) => s.isQueueOpen);
  const close = useQueueStore((s) => s.toggleQueue);
  const userQueue = useQueueStore((s) => s.userQueue);
  const contextQueue = useQueueStore((s) => s.contextQueue);
  const context = useQueueStore((s) => s.context);
  const removeFromUserQueue = useQueueStore((s) => s.removeFromUserQueue);
  const reorderUserQueue = useQueueStore((s) => s.reorderUserQueue);
  const clearUserQueue = useQueueStore((s) => s.clearUserQueue);

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playTrack = usePlayerStore((s) => s.playTrack);

  const isLiked = useUserStore((s) => s.isLiked);
  const toggleLike = useUserStore((s) => s.toggleLike);

  if (!isOpen) return null;

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (!isNaN(sourceIndex) && sourceIndex !== targetIndex) {
      reorderUserQueue(sourceIndex, targetIndex);
    }
  };

  return (
    <aside className="fixed top-0 right-0 bottom-24 w-80 md:w-96 bg-zinc-950/95 backdrop-blur-2xl border-l border-white/10 z-40 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 font-syne">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Queue</h2>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
            {userQueue.length + contextQueue.length}
          </span>
        </div>
        <button onClick={close} className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* 1. Now Playing */}
        <div>
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2.5">
            Now Playing
          </div>
          {currentTrack ? (
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
              <img
                src={currentTrack.thumbnail || `https://i.ytimg.com/vi/${currentTrack.id}/mqdefault.jpg`}
                alt=""
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = `https://i.ytimg.com/vi/${currentTrack.id}/mqdefault.jpg`;
                }}
                className="w-12 h-12 rounded-lg object-cover shrink-0 shadow bg-zinc-900"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-emerald-400 truncate">{currentTrack.title}</div>
                <div className="text-[11px] text-zinc-400 truncate">{currentTrack.artist}</div>
              </div>
              <button
                onClick={() => toggleLike(currentTrack)}
                className="text-zinc-400 hover:text-white p-1 transition-colors"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isLiked(currentTrack.id) ? 'text-pink-500 fill-pink-500' : 'text-zinc-400'
                  }`}
                />
              </button>
            </div>
          ) : (
            <div className="text-xs text-zinc-500 italic p-2">Nothing playing right now</div>
          )}
        </div>

        {/* 2. Next In Queue (Manual) */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              Next In Queue <span className="text-zinc-500 font-normal">({userQueue.length})</span>
            </div>
            {userQueue.length > 0 && (
              <button
                onClick={clearUserQueue}
                className="text-[10px] font-bold text-zinc-400 hover:text-rose-400 transition-colors uppercase tracking-wider"
              >
                Clear
              </button>
            )}
          </div>

          {userQueue.length === 0 ? (
            <div className="text-xs text-zinc-500 italic p-2 bg-white/[0.02] rounded-xl text-center">
              No manual tracks queued
            </div>
          ) : (
            <div className="space-y-1.5">
              {userQueue.map((track, idx) => (
                <div
                  key={`${track.id}-${idx}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, idx)}
                  onClick={() => playTrack(track)}
                  className="flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-colors group"
                >
                  <GripVertical className="w-3.5 h-3.5 text-zinc-500 shrink-0 cursor-grab opacity-40 group-hover:opacity-100" />
                  <img
                    src={track.thumbnail || `https://i.ytimg.com/vi/${track.id}/mqdefault.jpg`}
                    alt=""
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = `https://i.ytimg.com/vi/${track.id}/mqdefault.jpg`;
                    }}
                    className="w-9 h-9 rounded-md object-cover shrink-0 bg-zinc-900"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                      {track.title}
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate">{track.artist}</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromUserQueue(idx);
                    }}
                    className="text-zinc-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Next From Collection */}
        <div>
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2.5">
            Next from: {context.title || 'Collection'}
          </div>

          {contextQueue.length === 0 ? (
            <div className="text-xs text-zinc-500 italic p-2 bg-white/[0.02] rounded-xl text-center">
              No upcoming tracks from collection
            </div>
          ) : (
            <div className="space-y-1.5">
              {contextQueue.slice(0, 20).map((track, idx) => (
                <div
                  key={`${track.id}-${idx}`}
                  onClick={() => playTrack(track)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
                >
                  <span className="w-4 text-center text-[10px] font-bold text-zinc-500 group-hover:hidden">
                    {idx + 1}
                  </span>
                  <Play className="w-3.5 h-3.5 text-emerald-400 hidden group-hover:block shrink-0" />
                  <img
                    src={track.thumbnail || `https://i.ytimg.com/vi/${track.id}/mqdefault.jpg`}
                    alt=""
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = `https://i.ytimg.com/vi/${track.id}/mqdefault.jpg`;
                    }}
                    className="w-9 h-9 rounded-md object-cover shrink-0 bg-zinc-900"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-zinc-200 truncate group-hover:text-white transition-colors">
                      {track.title}
                    </div>
                    <div className="text-[10px] text-zinc-500 truncate">{track.artist}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
