import React from 'react';
import { useSleepTimerStore } from '../../stores/useSleepTimerStore';
import { X, Moon, Clock, Timer, Pause } from 'lucide-react';

const TIMER_OPTIONS = [
  { label: '5 min', value: 5 },
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '60 min', value: 60 },
  { label: '90 min', value: 90 },
  { label: 'End of track', value: 'end' }
];

export const SleepTimerModal = ({ isOpen, onClose }) => {
  const isActive = useSleepTimerStore((s) => s.isActive);
  const mode = useSleepTimerStore((s) => s.mode);
  const remainingSeconds = useSleepTimerStore((s) => s.remainingSeconds);
  const startTimer = useSleepTimerStore((s) => s.startTimer);
  const cancelTimer = useSleepTimerStore((s) => s.cancelTimer);
  const formatRemaining = useSleepTimerStore((s) => s.formatRemaining);

  if (!isOpen) return null;

  const remaining = formatRemaining();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md" onClick={onClose}>
      <div
        className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 font-syne"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Moon className="w-4 h-4 text-indigo-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Sleep Timer</h2>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Timer Display */}
        {isActive && (
          <div className="mb-5 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-indigo-400">
              <Timer className="w-4 h-4 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">Timer Active</span>
            </div>
            <div className="text-3xl font-black text-white font-mono tracking-wider">
              {remaining}
            </div>
            <button
              onClick={() => {
                cancelTimer();
                onClose();
              }}
              className="mt-2 flex items-center justify-center gap-2 mx-auto px-5 py-2 rounded-full border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition-colors"
            >
              <Pause className="w-3.5 h-3.5" />
              Cancel Timer
            </button>
          </div>
        )}

        {/* Timer Options */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
            {isActive ? 'Change Timer' : 'Stop music after'}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {TIMER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  startTimer(opt.value);
                  onClose();
                }}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 border border-white/5 text-sm font-bold text-zinc-300 hover:bg-white/10 hover:text-white hover:border-indigo-500/30 transition-all"
              >
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-600 pt-5 mt-3">
          <Moon className="w-3 h-3" />
          <span>Music will fade out when timer expires</span>
        </div>
      </div>
    </div>
  );
};
