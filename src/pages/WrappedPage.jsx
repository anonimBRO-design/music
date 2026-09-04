import React, { useState } from 'react';
import { useUserStore } from '../stores/useUserStore';
import { Sparkles, Disc, Flame, Heart, ChevronRight, ChevronLeft, RotateCcw } from 'lucide-react';

export const WrappedPage = ({ onExit }) => {
  const [slide, setSlide] = useState(0);
  const stats = useUserStore((s) => s.stats);
  const history = useUserStore((s) => s.history);
  const likedSongs = useUserStore((s) => s.likedSongs);
  const profile = useUserStore((s) => s.profile);

  const totalMin = Math.floor((stats.seconds || 0) / 60);
  const topTrack = history[0] || { title: 'Lofi Chill Night', artist: 'Lofi Girl' };

  const slides = [
    {
      bg: 'from-emerald-950 via-zinc-950 to-black',
      tag: 'Wrapped 2026',
      title: `Welcome to your year in music, ${profile.username || 'Listener'}`,
      subtitle: "Let's uncover the rhythms and audio vibes that defined your year.",
      icon: Sparkles
    },
    {
      bg: 'from-purple-950 via-zinc-950 to-black',
      tag: 'Time Streamed',
      title: `You explored ${totalMin > 0 ? totalMin : '1,420'} minutes of pure sound.`,
      subtitle: `Across ${stats.plays || 38} track sessions on NONIMSONG.`,
      icon: Disc
    },
    {
      bg: 'from-pink-950 via-zinc-950 to-black',
      tag: 'Top Track & Favorites',
      title: `Your soundtrack was led by "${topTrack.title}"`,
      subtitle: `By ${topTrack.artist} • with ${likedSongs.length} tracks in your Liked vault.`,
      icon: Flame
    }
  ];

  const currentSlide = slides[slide];

  return (
    <div className={`min-h-[80vh] flex flex-col justify-between p-8 md:p-16 rounded-3xl bg-gradient-to-br ${currentSlide.bg} border border-white/10 shadow-2xl font-syne select-none relative overflow-hidden transition-all duration-700 m-6`}>
      {/* Top progress indicators */}
      <div className="flex gap-2 w-full max-w-md mx-auto z-10">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i <= slide ? 'bg-emerald-400' : 'bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* Main Slide Content */}
      <div className="max-w-xl mx-auto text-center space-y-4 my-auto z-10 animate-in fade-in zoom-in-95 duration-300">
        <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-4 py-1.5 rounded-full">
          {currentSlide.tag}
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
          {currentSlide.title}
        </h1>
        <p className="text-sm md:text-base text-zinc-300 font-medium">
          {currentSlide.subtitle}
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between max-w-xl mx-auto w-full z-10 pt-6">
        <button
          onClick={() => setSlide(Math.max(0, slide - 1))}
          disabled={slide === 0}
          className="flex items-center gap-1 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white font-bold text-xs transition-colors ios-btn-spring cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        {slide < slides.length - 1 ? (
          <button
            onClick={() => setSlide(slide + 1)}
            className="flex items-center gap-1 px-6 py-2.5 rounded-full bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 ios-btn-primary cursor-pointer"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => setSlide(0)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black font-bold text-xs transition-all ios-btn-primary cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Replay Wrapped
          </button>
        )}
      </div>
    </div>
  );
};
