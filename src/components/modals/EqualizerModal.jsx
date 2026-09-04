import React from 'react';
import { useEqualizerStore } from '../../stores/useEqualizerStore';
import { X, RotateCcw, Sliders } from 'lucide-react';

export const EqualizerModal = ({ isOpen, onClose }) => {
  const isEnabled = useEqualizerStore((s) => s.isEnabled);
  const activePreset = useEqualizerStore((s) => s.activePreset);
  const gains = useEqualizerStore((s) => s.gains);
  const labels = useEqualizerStore((s) => s.labels);
  const presets = useEqualizerStore((s) => s.presets);
  const toggleEnabled = useEqualizerStore((s) => s.toggleEnabled);
  const applyPreset = useEqualizerStore((s) => s.applyPreset);
  const setBandGain = useEqualizerStore((s) => s.setBandGain);
  const resetToFlat = useEqualizerStore((s) => s.resetToFlat);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-modal-backdrop-in" onClick={onClose}>
      <div
        className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-modal-card-in font-syne"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Sliders className="w-4 h-4 text-violet-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Equalizer</h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Enable Toggle */}
            <button
              onClick={toggleEnabled}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                isEnabled ? 'bg-emerald-500' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  isEnabled ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
            <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors ios-btn-icon ios-btn-spring cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preset Chips */}
        <div className="mb-6">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Presets</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(presets).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ios-pill-spring cursor-pointer ${
                  activePreset === key
                    ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20'
                    : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5-Band Vertical Sliders */}
        <div className={`transition-opacity ${isEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          <div className="flex items-end justify-between gap-3 px-4 py-6 rounded-xl bg-white/[0.02] border border-white/5">
            {/* dB Scale Labels */}
            <div className="flex flex-col justify-between h-40 text-[10px] text-zinc-600 font-mono shrink-0 w-8 text-right">
              <span>+12</span>
              <span>+6</span>
              <span>0</span>
              <span>-6</span>
              <span>-12</span>
            </div>

            {/* Sliders */}
            {gains.map((gain, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                {/* Gain Value */}
                <span className={`text-[10px] font-bold font-mono ${
                  gain > 0 ? 'text-emerald-400' : gain < 0 ? 'text-rose-400' : 'text-zinc-500'
                }`}>
                  {gain > 0 ? '+' : ''}{gain}
                </span>

                {/* Vertical Slider */}
                <div className="relative h-40 w-6 flex items-center justify-center">
                  <input
                    type="range"
                    min={-12}
                    max={12}
                    step={1}
                    value={gain}
                    onChange={(e) => setBandGain(idx, parseInt(e.target.value, 10))}
                    className="eq-vertical-slider"
                    style={{
                      writingMode: 'vertical-lr',
                      direction: 'rtl',
                      width: '160px',
                      height: '24px',
                      WebkitAppearance: 'none',
                      appearance: 'none',
                      background: 'transparent',
                      cursor: 'pointer'
                    }}
                  />
                  {/* Visual Bar */}
                  <div className="absolute inset-x-1 top-0 bottom-0 rounded-full bg-zinc-800 pointer-events-none overflow-hidden">
                    <div
                      className="absolute left-0 right-0 bg-gradient-to-t from-violet-500/40 to-violet-400/20 rounded-full transition-all"
                      style={{
                        bottom: '0%',
                        height: `${((gain + 12) / 24) * 100}%`
                      }}
                    />
                    {/* Center line */}
                    <div className="absolute left-0 right-0 top-1/2 h-px bg-zinc-600" />
                  </div>
                </div>

                {/* Frequency Label */}
                <span className="text-[10px] text-zinc-500 font-medium">{labels[idx]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reset Button */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={resetToFlat}
            className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white font-bold transition-colors ios-btn-spring cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Flat
          </button>
          <span className="text-[10px] text-zinc-600 italic">Visual preset — audio DSP coming soon</span>
        </div>
      </div>
    </div>
  );
};
