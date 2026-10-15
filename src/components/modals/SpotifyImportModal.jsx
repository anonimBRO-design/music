import React, { useEffect, useMemo } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  ExternalLink,
  Link2,
  Loader2,
  Music2,
  SkipForward,
  X
} from 'lucide-react';
import { isSpotifyConfigured } from '../../services/spotifyApi';
import { useSpotifyImportStore } from '../../stores/useSpotifyImportStore';

const STATUS_LABELS = {
  matched: 'Matched',
  ambiguous: 'Needs review',
  unmatched: 'Not found',
  skipped: 'Skipped'
};

export const SpotifyImportModal = () => {
  const isOpen = useSpotifyImportStore((state) => state.isOpen);
  const step = useSpotifyImportStore((state) => state.step);
  const playlistUrl = useSpotifyImportStore((state) => state.playlistUrl);
  const playlist = useSpotifyImportStore((state) => state.playlist);
  const results = useSpotifyImportStore((state) => state.results);
  const progress = useSpotifyImportStore((state) => state.progress);
  const importedCount = useSpotifyImportStore((state) => state.importedCount);
  const error = useSpotifyImportStore((state) => state.error);
  const handleCallback = useSpotifyImportStore((state) => state.handleCallback);
  const close = useSpotifyImportStore((state) => state.close);
  const connect = useSpotifyImportStore((state) => state.connect);
  const disconnect = useSpotifyImportStore((state) => state.disconnect);
  const setPlaylistUrl = useSpotifyImportStore((state) => state.setPlaylistUrl);
  const importPlaylist = useSpotifyImportStore((state) => state.importPlaylist);
  const selectCandidate = useSpotifyImportStore((state) => state.selectCandidate);
  const confirmImport = useSpotifyImportStore((state) => state.confirmImport);

  useEffect(() => {
    handleCallback();
  }, [handleCallback]);

  const selectedCount = useMemo(
    () => results.filter((result) => result.selected).length,
    [results]
  );

  if (!isOpen) return null;

  const renderStatus = (result) => {
    const status = result.selected ? 'matched' : result.status;
    const tone = status === 'matched'
      ? 'text-emerald-400'
      : status === 'ambiguous'
      ? 'text-amber-300'
      : 'text-zinc-400';
    return <span className={`text-[10px] font-bold uppercase tracking-wider ${tone}`}>{STATUS_LABELS[status]}</span>;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-modal-backdrop-in"
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="ios-glass-dock rounded-[28px] w-full max-w-2xl p-5 md:p-6 shadow-2xl animate-modal-card-in font-syne select-none max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Music2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-white truncate">Import from Spotify</h2>
              <p className="text-[11px] text-zinc-400">Match Spotify metadata to playable YouTube tracks.</p>
            </div>
          </div>
          <button onClick={close} className="text-zinc-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 ios-btn-icon ios-btn-spring cursor-pointer" title="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2.5 p-3 rounded-2xl bg-rose-500/10 text-rose-200 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-5 min-h-0 overflow-y-auto pr-1">
          {step === 'connect' && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/5 space-y-2">
                <h3 className="text-sm font-bold text-white">Connect your Spotify account</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  NONIMSONG requests playlist read access only. Your Spotify password never reaches this app, and the session token is kept only in this browser session.
                </p>
              </div>

              {!isSpotifyConfigured() && (
                <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-100 text-xs leading-relaxed">
                  Add <code className="font-mono text-amber-200">VITE_SPOTIFY_CLIENT_ID</code> and the matching redirect URI before connecting Spotify.
                </div>
              )}

              <button
                type="button"
                onClick={connect}
                disabled={!isSpotifyConfigured()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-400 text-black font-bold text-xs ios-btn-primary cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Link2 className="w-4 h-4" /> Connect Spotify
              </button>
              <p className="text-[10px] text-zinc-500 text-center">
                Official API import only. Spotify audio is not downloaded.
              </p>
            </div>
          )}

          {step === 'input' && (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                importPlaylist();
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-white">Paste a playlist link</div>
                  <div className="text-[11px] text-zinc-400">Public, private, and collaborative playlists are supported after authorization.</div>
                </div>
                <button type="button" onClick={disconnect} className="text-[10px] font-bold text-zinc-400 hover:text-rose-300 uppercase tracking-wider ios-btn-spring cursor-pointer">
                  Disconnect
                </button>
              </div>
              <div className="relative">
                <ExternalLink className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  value={playlistUrl}
                  onChange={(event) => setPlaylistUrl(event.target.value)}
                  placeholder="https://open.spotify.com/playlist/..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none"
                  autoFocus
                />
              </div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-400 text-black font-bold text-xs ios-btn-primary cursor-pointer">
                <Download className="w-4 h-4" /> Load playlist
              </button>
            </form>
          )}

          {step === 'loading' && (
            <div className="py-10 space-y-5 text-center">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
              <div>
                <div className="text-sm font-bold text-white">Matching tracks to YouTube</div>
                <div className="text-xs text-zinc-400 mt-1 truncate">{progress.current || 'Preparing import...'}</div>
              </div>
              <div className="max-w-sm mx-auto space-y-2">
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all"
                    style={{ width: `${progress.total ? (progress.completed / progress.total) * 100 : 8}%` }}
                  />
                </div>
                <div className="text-[10px] text-zinc-500">{progress.completed} / {progress.total || '?'} tracks checked</div>
              </div>
            </div>
          )}

          {step === 'preview' && playlist && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/5">
                {playlist.image ? (
                  <img src={playlist.image} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <Music2 className="w-5 h-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-white truncate">{playlist.name}</div>
                  <div className="text-[11px] text-zinc-400 truncate">{selectedCount} of {results.length} tracks ready to import</div>
                </div>
              </div>

              <div className="space-y-2 max-h-[42vh] overflow-y-auto pr-1">
                {results.map((result) => {
                  const selected = result.selected;
                  return (
                    <div key={result.source.spotifyId} className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={selected?.thumbnail || result.source.image || ''} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0 bg-zinc-900" />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-white truncate">{result.source.title}</div>
                          <div className="text-[10px] text-zinc-400 truncate">{result.source.artist}</div>
                        </div>
                        {renderStatus(result)}
                      </div>

                      {result.status === 'ambiguous' && !selected && (
                        <div className="space-y-1.5 pl-12">
                          {result.candidates.slice(0, 3).map((candidate) => (
                            <button
                              key={candidate.id}
                              type="button"
                              onClick={() => selectCandidate(result.source.spotifyId, candidate)}
                              className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-left transition-colors ios-btn-spring cursor-pointer"
                            >
                              <span className="text-[10px] text-zinc-300 truncate">{candidate.title} · {candidate.artist}</span>
                              <span className="text-[10px] font-mono text-amber-300 shrink-0">{Math.round(candidate.matchScore * 100)}%</span>
                            </button>
                          ))}
                          <button type="button" onClick={() => selectCandidate(result.source.spotifyId, null)} className="flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-rose-300 ios-btn-spring cursor-pointer">
                            <SkipForward className="w-3 h-3" /> Skip this track
                          </button>
                        </div>
                      )}

                      {result.status === 'unmatched' && (
                        <div className="pl-12 text-[10px] text-zinc-500">No reliable YouTube match found; this track will be skipped.</div>
                      )}

                      {selected && (
                        <div className="pl-12 flex items-center justify-between gap-3 text-[10px] text-emerald-300">
                          <span className="truncate">YouTube: {selected.title}</span>
                          <button type="button" onClick={() => selectCandidate(result.source.spotifyId, null)} className="text-zinc-500 hover:text-rose-300 shrink-0 ios-btn-spring cursor-pointer">Remove</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button type="button" onClick={() => useSpotifyImportStore.setState({ step: 'input', error: '' })} className="px-4 py-2.5 rounded-full text-xs font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 ios-btn-spring cursor-pointer">
                  Back
                </button>
                <button type="button" onClick={confirmImport} disabled={!selectedCount} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-400 text-black font-bold text-xs ios-btn-primary cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                  <Download className="w-4 h-4" /> Import {selectedCount} tracks
                </button>
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="py-10 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <div>
                <h3 className="text-lg font-bold text-white">Playlist imported</h3>
                <p className="text-xs text-zinc-400 mt-1">{importedCount} matched tracks were added to Your Library.</p>
              </div>
              <button type="button" onClick={close} className="px-6 py-2.5 rounded-full bg-emerald-400 text-black font-bold text-xs ios-btn-primary cursor-pointer">
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
