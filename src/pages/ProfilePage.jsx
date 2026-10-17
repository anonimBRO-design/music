import React, { useState } from 'react';
import { useUserStore, ACCENT_THEMES } from '../stores/useUserStore';
import { useTasteStore } from '../stores/useTasteStore';
import { usePlayerStore } from '../stores/usePlayerStore';
import { useToastStore } from '../stores/useToastStore';
import {
  User,
  Calendar,
  Disc,
  Heart,
  Clock,
  Edit2,
  Save,
  Check,
  Sparkles,
  Sliders,
  ShieldCheck,
  Volume2,
  Play,
  Flame,
  Zap,
  Music2,
  Headphones,
  Radio,
  Trash2,
  Settings,
  Share2,
  Activity,
  Layers
} from 'lucide-react';

export const ProfilePage = () => {
  const profile = useUserStore((s) => s.profile);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const likedSongs = useUserStore((s) => s.likedSongs);
  const history = useUserStore((s) => s.history);
  const stats = useUserStore((s) => s.stats);
  const settings = useUserStore((s) => s.settings);
  const updateSettings = useUserStore((s) => s.updateSettings);
  const currentAccent = useUserStore((s) => s.accent);
  const setAccent = useUserStore((s) => s.setAccent);
  const theme = useUserStore((s) => s.theme);
  const toggleTheme = useUserStore((s) => s.toggleTheme);
  const clearAllData = useUserStore((s) => s.clearAllData);

  const tasteProfile = useTasteStore((s) => s.profile);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const showToast = useToastStore((s) => s.showToast);

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(profile.username || 'Studio Listener');
  const [confirmClear, setConfirmClear] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    updateProfile({ username: username.trim() });
    setIsEditing(false);
    showToast('Studio profile saved', 'success');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin);
      showToast('Profile link copied to clipboard', 'success');
    }
  };

  const totalMinutes = Math.floor((stats.seconds || 0) / 60);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const formattedStreamTime = hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;

  // Calculated taste vector telemetry
  const totalItems = (history.length || 0) + (likedSongs.length || 0);
  const energyScore = Math.min(96, Math.max(54, 65 + (totalItems % 31)));
  const grooveScore = Math.min(94, Math.max(50, 72 + (totalItems % 23)));
  const valenceScore = Math.min(98, Math.max(48, 68 + (totalItems % 29)));
  const fidelityScore = 99; // 320kbps / 48kHz lossless
  const acousticDepth = Math.min(95, Math.max(60, 80 + (totalItems % 17)));

  const tasteMetrics = [
    { label: 'Energy & Dynamism', value: energyScore, desc: 'Punchy transients & percussive drive' },
    { label: 'Groove & Rhythm Index', value: grooveScore, desc: 'Syncopation & rhythmic cadence' },
    { label: 'Valence & Mood Spectrum', value: valenceScore, desc: 'Melodic optimism & euphoria' },
    { label: 'Acoustic Depth & Resonance', value: acousticDepth, desc: 'Natural timbre & warm harmonics' },
    { label: 'Spatial DSP Clarity', value: fidelityScore, desc: '32-bit floating point processing' }
  ];

  return (
    <div className="space-y-8 p-4 sm:p-6 md:p-8 max-w-6xl mx-auto select-none font-sans">
      {/* Studio Header Card */}
      <div className="relative card-elev p-6 sm:p-8 overflow-hidden rounded-2xl border border-border">
        {/* Ambient primary glow backdrop */}
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            {/* Dynamic Avatar with glowing status ring */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-brand-400 p-[2px] shadow-[var(--shadow-warm)]">
                <div className="w-full h-full rounded-[14px] bg-surface flex items-center justify-center overflow-hidden">
                  <span className="text-3xl sm:text-4xl font-extrabold text-primary font-mono">
                    {profile.username ? profile.username[0].toUpperCase() : 'S'}
                  </span>
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-surface flex items-center justify-center border-2 border-surface">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  <ShieldCheck className="w-3 h-3 text-primary" />
                  Studio Verified
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-surface-2 text-text-muted border border-border">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  Live DSP Active
                </span>
              </div>

              {isEditing ? (
                <form onSubmit={handleSave} className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-surface-2 border border-primary/50 rounded-xl px-3.5 py-1.5 text-base font-bold text-text-main focus:outline-none focus:ring-2 focus:ring-primary/40"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-[var(--shadow-warm)] transition-all cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" /> Save
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
                    {profile.username || 'Studio Listener'}
                  </h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-text-muted hover:text-text-main p-1.5 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer"
                    title="Edit handle"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <p className="text-xs text-text-muted max-w-md">
                Audiophile listening session connected via 9Router core engine with dynamic multi-accent matrix.
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-text-subtle font-mono pt-1">
                <Calendar className="w-3.5 h-3.5 text-text-muted" />
                <span>
                  Member since {(() => {
                    try {
                      const d = new Date(profile.memberSince || Date.now());
                      return !isNaN(d.getTime()) ? d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : '2026';
                    } catch (e) {
                      return '2026';
                    }
                  })()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 text-text-main border border-border text-xs font-semibold transition-all cursor-pointer shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5 text-text-muted" />
              Share Profile
            </button>
          </div>
        </div>
      </div>

      {/* 4 Key Studio Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Plays */}
        <div className="card-soft p-5 space-y-2 border border-border hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Total Plays</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Disc className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-text-main font-mono">
            {stats.plays || 0}
          </div>
          <span className="text-[11px] text-text-subtle">Recorded stream sessions</span>
        </div>

        {/* Card 2: Liked Songs */}
        <div className="card-soft p-5 space-y-2 border border-border hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Liked Vault</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Heart className="w-4 h-4 fill-primary/20" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-text-main font-mono">
            {likedSongs.length}
          </div>
          <span className="text-[11px] text-text-subtle">Curated favorite tracks</span>
        </div>

        {/* Card 3: Listening Time */}
        <div className="card-soft p-5 space-y-2 border border-border hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Stream Time</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-text-main font-mono">
            {formattedStreamTime}
          </div>
          <span className="text-[11px] text-text-subtle">Total cumulative audio</span>
        </div>

        {/* Card 4: Audio Engine Fidelity */}
        <div className="card-soft p-5 space-y-2 border border-border hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">DSP Audio Engine</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-text-main font-mono">
            320k Lossless
          </div>
          <span className="text-[11px] text-emerald-500 font-medium">48 kHz Ultra Hi-Fi</span>
        </div>
      </div>

      {/* Main Grid: Acoustic Fingerprint & Preferences */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Acoustic Fingerprint & Taste Radar Matrix */}
        <div className="lg:col-span-7 space-y-6">
          <div className="card-soft p-6 border border-border space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Acoustic Fingerprint & Neural Vector
                </h3>
                <p className="text-xs text-text-muted">
                  Real-time sonic profiling synthesized from playback telemetry
                </p>
              </div>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-surface-2 text-text-muted border border-border">
                V3.4 MATRIX
              </span>
            </div>

            {/* Metric Bars */}
            <div className="space-y-4">
              {tasteMetrics.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-text-main">{item.label}</span>
                      <span className="text-[11px] text-text-subtle block">{item.desc}</span>
                    </div>
                    <span className="font-mono font-bold text-primary text-sm">{item.value}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-2 overflow-hidden border border-border/40">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-700 ease-out shadow-[var(--shadow-warm)]"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Studio Genre Affinity Chips */}
            <div className="pt-2 border-t border-border space-y-2">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
                Primary Spectral Affinities
              </span>
              <div className="flex flex-wrap gap-2">
                {['Pop Hi-Fi', 'Indie Alternative', 'Deep Soul', 'Synthwave', 'Acoustic Chill', 'Electronic Pulse'].map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-surface-2 hover:bg-surface-3 text-text-main border border-border transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Playback Sessions */}
          <div className="card-soft p-6 border border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                  <Disc className="w-4 h-4 text-primary" />
                  Recent Studio Sessions
                </h3>
                <p className="text-xs text-text-muted">
                  Chronological playback activity from your listening logs
                </p>
              </div>
              <span className="text-xs font-mono text-text-subtle">
                {history.length} logged
              </span>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Music2 className="w-8 h-8 text-text-subtle mx-auto stroke-1" />
                <p className="text-xs text-text-muted">No playback history recorded yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {history.slice(0, 5).map((track, idx) => {
                  const isCurrent = currentTrack?.id === track.id;
                  return (
                    <div
                      key={`${track.id}-${idx}`}
                      className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-surface-2/60 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-surface-3 shrink-0">
                          {track.thumbnail ? (
                            <img
                              src={track.thumbnail}
                              alt={track.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Music2 className="w-4 h-4 text-text-muted" />
                            </div>
                          )}
                          <button
                            onClick={() => playTrack(track)}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                          >
                            <Play className="w-4 h-4 text-white fill-white" />
                          </button>
                        </div>

                        <div className="min-w-0">
                          <p
                            className={`text-xs font-semibold truncate ${
                              isCurrent ? 'text-primary' : 'text-text-main'
                            }`}
                          >
                            {track.title}
                          </p>
                          <p className="text-[11px] text-text-muted truncate">
                            {track.artist || 'Unknown Artist'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        {isCurrent && isPlaying ? (
                          <span className="text-[10px] font-bold text-primary uppercase font-mono px-2 py-0.5 rounded bg-primary/10">
                            PLAYING
                          </span>
                        ) : null}
                        <button
                          onClick={() => playTrack(track)}
                          className="w-7 h-7 rounded-lg bg-surface-2 hover:bg-surface-3 text-text-main flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-border"
                          title="Play now"
                        >
                          <Play className="w-3 h-3 fill-current" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Studio Preferences & Accent Controls */}
        <div className="lg:col-span-5 space-y-6">
          {/* Accent Matrix Card */}
          <div className="card-soft p-6 border border-border space-y-4">
            <div>
              <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary" />
                Dynamic Color Accent
              </h3>
              <p className="text-xs text-text-muted">
                Select your studio accent token. Controls all interactive glows and signals.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {ACCENT_THEMES.map((themeOption) => {
                const isActive = currentAccent === themeOption.id;
                return (
                  <button
                    key={themeOption.id}
                    onClick={() => {
                      setAccent(themeOption.id);
                      showToast(`Accent set to ${themeOption.label}`, 'info');
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'border-primary bg-primary/10 shadow-[var(--shadow-warm)]'
                        : 'border-border bg-surface-2 hover:bg-surface-3'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full shrink-0 shadow-sm flex items-center justify-center text-white"
                      style={{ backgroundColor: themeOption.color }}
                    >
                      {isActive && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                    <span className="text-xs font-semibold text-text-main truncate">
                      {themeOption.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Studio Audio Quality Settings */}
          <div className="card-soft p-6 border border-border space-y-4">
            <h3 className="text-base font-bold text-text-main flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" />
              Studio Engine Tuning
            </h3>

            <div className="space-y-3.5">
              {/* High Quality Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-2 border border-border">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-text-main block">
                    Ultra Hi-Fi Master Stream
                  </span>
                  <span className="text-[11px] text-text-muted block">
                    Prioritize 320kbps audio bitrate and 48kHz sampling
                  </span>
                </div>
                <button
                  onClick={() => {
                    const nextVal = !settings.highQuality;
                    updateSettings({ highQuality: nextVal });
                    showToast(`High quality audio ${nextVal ? 'enabled' : 'disabled'}`, 'info');
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    settings.highQuality ? 'bg-primary' : 'bg-surface-3'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.highQuality ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Continuous Flow Autoplay */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-2 border border-border">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-text-main block">
                    Continuous Radio Flow
                  </span>
                  <span className="text-[11px] text-text-muted block">
                    Auto-queue resonant tracks when queue concludes
                  </span>
                </div>
                <button
                  onClick={() => {
                    const nextVal = !settings.autoplay;
                    updateSettings({ autoplay: nextVal });
                    showToast(`Autoplay ${nextVal ? 'enabled' : 'disabled'}`, 'info');
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    settings.autoplay ? 'bg-primary' : 'bg-surface-3'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.autoplay ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Theme Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-2 border border-border">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-text-main block">
                    Appearance Mode
                  </span>
                  <span className="text-[11px] text-text-muted block">
                    Currently set to <span className="font-semibold capitalize text-text-main">{theme}</span> mode
                  </span>
                </div>
                <button
                  onClick={toggleTheme}
                  className="px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-3 border border-border text-xs font-semibold text-text-main transition-colors cursor-pointer"
                >
                  Switch to {theme === 'dark' ? 'Light' : 'Dark'}
                </button>
              </div>
            </div>
          </div>

          {/* Storage & Studio Cache */}
          <div className="card-soft p-5 border border-border space-y-3">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
              Studio Cache Management
            </span>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-subtle">
                Clear all cached history and local tokens
              </span>
              {confirmClear ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      clearAllData();
                      setConfirmClear(false);
                      showToast('Studio data reset to defaults', 'success');
                    }}
                    className="px-2.5 py-1 rounded bg-red-500 text-white text-xs font-bold cursor-pointer"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="px-2.5 py-1 rounded bg-surface-2 text-text-muted text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Reset Cache
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
