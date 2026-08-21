import React from 'react';
import { useUserStore } from '../../stores/useUserStore';
import { useToastStore } from '../../stores/useToastStore';
import { X, Trash2, Sliders, Moon, Keyboard } from 'lucide-react';

export const SettingsModal = ({ isOpen, onClose, onOpenSleepTimer, onOpenEqualizer }) => {
  const settings = useUserStore((s) => s.settings);
  const updateSettings = useUserStore((s) => s.updateSettings);
  const clearAllData = useUserStore((s) => s.clearAllData);
  const showToast = useToastStore((s) => s.showToast);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 font-syne">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <h2 className="text-lg font-bold text-white">Settings</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Playback Settings */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5">
            <div>
              <div className="text-xs font-bold text-white">Autoplay recommendations</div>
              <div className="text-[11px] text-zinc-400">Keep music playing when queue ends</div>
            </div>
            <input
              type="checkbox"
              checked={settings.autoplay !== false}
              onChange={(e) => updateSettings({ autoplay: e.target.checked })}
              className="accent-emerald-400 w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5">
            <div>
              <div className="text-xs font-bold text-white">High Quality Audio</div>
              <div className="text-[11px] text-zinc-400">Stream best available audio bitrate</div>
            </div>
            <input
              type="checkbox"
              checked={settings.highQuality !== false}
              onChange={(e) => updateSettings({ highQuality: e.target.checked })}
              className="accent-emerald-400 w-4 h-4 cursor-pointer"
            />
          </div>

          {/* Feature Shortcuts */}
          <div className="pt-3 border-t border-white/10">
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Audio & Features</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onOpenEqualizer?.()}
                className="flex items-center gap-2.5 p-3.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-violet-500/30 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                  <Sliders className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Equalizer</div>
                  <div className="text-[10px] text-zinc-500">5-band presets</div>
                </div>
              </button>

              <button
                onClick={() => onOpenSleepTimer?.()}
                className="flex items-center gap-2.5 p-3.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-indigo-500/30 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <Moon className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Sleep Timer</div>
                  <div className="text-[10px] text-zinc-500">Auto-stop music</div>
                </div>
              </button>
            </div>
          </div>

          {/* Keyboard Shortcuts Info */}
          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
              <Keyboard className="w-3.5 h-3.5" />
              Keyboard Shortcuts
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
              <div className="flex justify-between"><span className="text-zinc-500">Play/Pause</span><kbd className="text-zinc-300 bg-white/5 px-1.5 py-0.5 rounded text-[10px] font-mono">Space</kbd></div>
              <div className="flex justify-between"><span className="text-zinc-500">Seek ±5s</span><kbd className="text-zinc-300 bg-white/5 px-1.5 py-0.5 rounded text-[10px] font-mono">← →</kbd></div>
              <div className="flex justify-between"><span className="text-zinc-500">Volume</span><kbd className="text-zinc-300 bg-white/5 px-1.5 py-0.5 rounded text-[10px] font-mono">↑ ↓</kbd></div>
              <div className="flex justify-between"><span className="text-zinc-500">Mute</span><kbd className="text-zinc-300 bg-white/5 px-1.5 py-0.5 rounded text-[10px] font-mono">M</kbd></div>
              <div className="flex justify-between"><span className="text-zinc-500">Like</span><kbd className="text-zinc-300 bg-white/5 px-1.5 py-0.5 rounded text-[10px] font-mono">L</kbd></div>
              <div className="flex justify-between"><span className="text-zinc-500">Fullscreen</span><kbd className="text-zinc-300 bg-white/5 px-1.5 py-0.5 rounded text-[10px] font-mono">F</kbd></div>
              <div className="flex justify-between"><span className="text-zinc-500">Queue</span><kbd className="text-zinc-300 bg-white/5 px-1.5 py-0.5 rounded text-[10px] font-mono">Q</kbd></div>
              <div className="flex justify-between"><span className="text-zinc-500">Shuffle</span><kbd className="text-zinc-300 bg-white/5 px-1.5 py-0.5 rounded text-[10px] font-mono">S</kbd></div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-3 border-t border-white/10">
            <div className="text-xs font-bold text-rose-400 mb-2">Danger Zone</div>
            <button
              onClick={() => {
                if (window.confirm('Clear all NONIMSONG data (liked songs, playlists, history)?')) {
                  clearAllData();
                  showToast('All data cleared successfully', 'info');
                  onClose();
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear all app storage
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500 pt-5 mt-2">
          <img src="/icons/logo.png" alt="NONIMSONG" className="w-4 h-4 object-contain" />
          <span>NONIMSONG v3.0 · Powered by YouTube Engine</span>
        </div>
      </div>
    </div>
  );
};
