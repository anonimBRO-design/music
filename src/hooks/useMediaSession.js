import { useEffect } from 'react';
import { usePlayerStore } from '../stores/usePlayerStore';

export function useMediaSession() {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);

  // Update metadata when track changes
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentTrack) return;

    const thumbnail = currentTrack.thumbnail || `https://i.ytimg.com/vi/${currentTrack.id}/mqdefault.jpg`;
    const thumbnailHQ = currentTrack.thumbnailHQ || `https://i.ytimg.com/vi/${currentTrack.id}/hqdefault.jpg`;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title || 'NONIMSONG',
      artist: currentTrack.artist || 'Unknown Artist',
      album: 'NONIMSONG',
      artwork: [
        { src: thumbnail, sizes: '320x180', type: 'image/jpeg' },
        { src: thumbnailHQ, sizes: '480x360', type: 'image/jpeg' }
      ]
    });
  }, [currentTrack?.id, currentTrack?.title]);

  // Register action handlers
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    const player = usePlayerStore.getState;

    const handlers = {
      play: () => {
        const p = player();
        if (p.currentTrack && !p.isPlaying) p.togglePlay();
      },
      pause: () => {
        const p = player();
        if (p.isPlaying) p.togglePlay();
      },
      previoustrack: () => player().prev(),
      nexttrack: () => player().next(),
      seekbackward: (details) => {
        const p = player();
        const offset = details?.seekOffset || 10;
        p.seekTo(Math.max(p.currentTime - offset, 0));
      },
      seekforward: (details) => {
        const p = player();
        const offset = details?.seekOffset || 10;
        p.seekTo(Math.min(p.currentTime + offset, p.duration));
      },
      seekto: (details) => {
        if (details?.seekTime != null) {
          player().seekTo(details.seekTime);
        }
      }
    };

    for (const [action, handler] of Object.entries(handlers)) {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (e) {
        // Some browsers don't support all actions
      }
    }

    return () => {
      for (const action of Object.keys(handlers)) {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch (e) {}
      }
    };
  }, []);

  // Sync playback state
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }, [isPlaying]);

  // Sync position state
  useEffect(() => {
    if (!('mediaSession' in navigator) || !duration || duration <= 0) return;

    try {
      navigator.mediaSession.setPositionState({
        duration: Math.max(0, duration),
        playbackRate: 1,
        position: Math.max(0, Math.min(currentTime, duration))
      });
    } catch (e) {
      // Ignore position state errors
    }
  }, [currentTime, duration]);
}
