import React from 'react';
import { useUserStore } from '../../stores/useUserStore';
import { useToastStore } from '../../stores/useToastStore';
import { X, Trash2, Sliders, Moon, Sun, Keyboard } from 'lucide-react';

export const SettingsModal = ({ isOpen, onClose, onOpenSleepTimer, onOpenEqualizer }) => {
  const settings = useUserStore((s) => s.settings);
  const theme = useUserStore((s) => s.theme);
  const setTheme = useUserStore((s) => s.setTheme);
  const updateSettings = useUserStore((s) => s.updateSettings);
  const clearAllData = useUserStore((s) => s.clearAllData);
  const showToast = useToastStore((s) => s.showToast);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
      <div className="ios-glass-dock rounded-[28px] w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 font-syne select-none">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
          <h2 className="text-lg font-bold text-white">Settings</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 ios-btn-icon ios-btn-spring transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Theme Appearance Selector */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
            <div>
              <div className="text-xs font-bold text-white">Appearance Theme</div>
              <div className="text-[11px] text-zinc-400">Spatial Dark or Sky Light</div>
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.06] border border-white/10">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ios-btn-spring cursor-pointer ${
                  theme === 'dark' ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Moon className="w-3 h-3" />
                Dark
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ios-btn-spring cursor-pointer ${
                  theme === 'light' ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Sun className="w-3 h-3 text-amber-500" />
                Light
              </button>
            </div>
          </div>

          {/* Playback Settings */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
            <div>
              <div className="text-xs font-bold text-white">Autoplay recommendations</div>
              <div className="text-[11px] text-zinc-400">Keep music playing when queue ends</div>
            </div>
            <input
              type="checkbox"
              checked={settings.autoplay !== false}
              onChange={(e) => updateSettings({ autoplay: e.target.checked })}
              className="accent-iosEmerald w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
            <div>
              <div className="text-xs font-bold text-white">High Quality Audio</div>
              <div className="text-[11px] text-zinc-400">Stream best available audio bitrate</div>
            </div>
            <input
              type="checkbox"
              checked={settings.highQuality !== false}
              onChange={(e) => updateSettings({ highQuality: e.target.checked })}
              className="accent-iosEmerald w-4 h-4 cursor-pointer"
            />
          </div>

          {/* Feature Shortcuts */}
          <div className="pt-3 border-t border-white/[0.08]">
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Audio & Features</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onOpenEqualizer?.()}
                className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-iosPurple/40 ios-btn-spring transition-all text-left cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-iosPurple/15 flex items-center justify-center shrink-0">
                  <Sliders className="w-4 h-4 text-iosPurple" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Equalizer</div>
                  <div className="text-[10px] text-zinc-400">5-band presets</div>
                </div>
              </button>

              <button
                onClick={() => onOpenSleepTimer?.()}
                className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-iosIndigo/40 ios-btn-spring transition-all text-left cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-iosIndigo/15 flex items-center justify-center shrink-0">
                  <Moon className="w-4 h-4 text-iosIndigo" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Sleep Timer</div>
                  <div className="text-[10px] text-zinc-400">Auto-stop music</div>
                </div>
              </button>
            </div>
          </div>

          {/* Keyboard Shortcuts Info */}
          <div className="pt-3 border-t border-white/[0.08]">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
              <Keyboard className="w-3.5 h-3.5" />
              Keyboard Shortcuts
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
              <div className="flex justify-between"><span className="text-zinc-400">Play/Pause</span><kbd className="text-zinc-200 bg-white/10 px-2 py-0.5 rounded-lg text-[10px] font-mono border border-white/10">Space</kbd></div>
              <div className="flex justify-between"><span className="text-zinc-400">Seek ±5s</span><kbd className="text-zinc-200 bg-white/10 px-2 py-0.5 rounded-lg text-[10px] font-mono border border-white/10">← →</kbd></div>
              <div className="flex justify-between"><span className="text-zinc-400">Volume</span><kbd className="text-zinc-200 bg-white/10 px-2 py-0.5 rounded-lg text-[10px] font-mono border border-white/10">↑ ↓</kbd></div>
              <div className="flex justify-between"><span className="text-zinc-400">Mute</span><kbd className="text-zinc-200 bg-white/10 px-2 py-0.5 rounded-lg text-[10px] font-mono border border-white/10">M</kbd></div>
              <div className="flex justify-between"><span className="text-zinc-400">Like</span><kbd className="text-zinc-200 bg-white/10 px-2 py-0.5 rounded-lg text-[10px] font-mono border border-white/10">L</kbd></div>
              <div className="flex justify-between"><span className="text-zinc-400">Fullscreen</span><kbd className="text-zinc-200 bg-white/10 px-2 py-0.5 rounded-lg text-[10px] font-mono border border-white/10">F</kbd></div>
              <div className="flex justify-between"><span className="text-zinc-400">Queue</span><kbd className="text-zinc-200 bg-white/10 px-2 py-0.5 rounded-lg text-[10px] font-mono border border-white/10">Q</kbd></div>
              <div className="flex justify-between"><span className="text-zinc-400">Shuffle</span><kbd className="text-zinc-200 bg-white/10 px-2 py-0.5 rounded-lg text-[10px] font-mono border border-white/10">S</kbd></div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-3 border-t border-white/[0.08]">
            <div className="text-xs font-bold text-iosPink mb-2">Danger Zone</div>
            <button
              onClick={() => {
                if (window.confirm('Clear all NONIMSONG data (liked songs, playlists, history)?')) {
                  clearAllData();
                  showToast('All data cleared successfully', 'info');
                  onClose();
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-iosPink/30 text-iosPink hover:bg-iosPink/10 text-xs font-bold ios-btn-spring transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Clear all app storage
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500 pt-5 mt-2">
          <img src="/icons/logo.png" alt="NONIMSONG" className="w-4 h-4 object-contain" />
          <span>NONIMSONG v3.0 · iOS 27 Edition</span>
        </div>
      </div>
    </div>
  );
};
