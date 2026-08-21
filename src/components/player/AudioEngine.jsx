import React, { useEffect, useRef } from 'react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useUserStore } from '../../stores/useUserStore';

export const AudioEngine = () => {
  const playerRef = useRef(null);
  const isReadyRef = useRef(false);
  const progressIntervalRef = useRef(null);

  const _audioCommand = usePlayerStore((state) => state._audioCommand);
  const volume = usePlayerStore((state) => state.volume);
  const repeatMode = usePlayerStore((state) => state.repeatMode);
  const syncAudioState = usePlayerStore((state) => state.syncAudioState);
  const next = usePlayerStore((state) => state.next);
  const addPlayedSeconds = useUserStore((state) => state.addPlayedSeconds);

  useEffect(() => {
    // Load YouTube IFrame API script once
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    const initYT = () => {
      if (window.YT && window.YT.Player) {
        playerRef.current = new window.YT.Player('yt-hidden-player-mount', {
          height: '1',
          width: '1',
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            playsinline: 1,
            rel: 0
          },
          events: {
            onReady: (event) => {
              isReadyRef.current = true;
              event.target.setVolume(volume);
            },
            onStateChange: (event) => {
              if (event.data === 1) { // Playing
                syncAudioState({ isPlaying: true });
                startProgressLoop();
              } else if (event.data === 2) { // Paused
                syncAudioState({ isPlaying: false });
                stopProgressLoop();
              } else if (event.data === 0) { // Ended
                syncAudioState({ isPlaying: false });
                stopProgressLoop();
                if (repeatMode === 2) {
                  playerRef.current?.seekTo(0);
                  playerRef.current?.playVideo();
                } else {
                  next();
                }
              }
            },
            onError: (err) => {
              console.warn('YT Audio Engine Error:', err);
              next();
            }
          }
        });
      } else {
        setTimeout(initYT, 100);
      }
    };

    if (!playerRef.current) {
      initYT();
    }

    return () => {
      stopProgressLoop();
    };
  }, []);

  const startProgressLoop = () => {
    stopProgressLoop();
    progressIntervalRef.current = setInterval(() => {
      if (playerRef.current && isReadyRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        const currentTime = playerRef.current.getCurrentTime() || 0;
        const duration = playerRef.current.getDuration() || 180;
        syncAudioState({ currentTime, duration });
        addPlayedSeconds(0.5);
      }
    }, 500);
  };

  const stopProgressLoop = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  // Handle commands sent through Zustand
  useEffect(() => {
    if (!_audioCommand || !playerRef.current || !isReadyRef.current) return;

    const { type, payload } = _audioCommand;
    try {
      if (type === 'LOAD') {
        playerRef.current.loadVideoById(payload);
      } else if (type === 'PLAY') {
        playerRef.current.playVideo();
      } else if (type === 'PAUSE') {
        playerRef.current.pauseVideo();
      } else if (type === 'SEEK') {
        playerRef.current.seekTo(payload, true);
      } else if (type === 'VOLUME') {
        playerRef.current.setVolume(payload);
      }
    } catch (e) {
      console.warn('AudioEngine command execution error:', e);
    }
  }, [_audioCommand]);

  return (
    <div style={{ position: 'fixed', bottom: -100, left: -100, width: 1, height: 1, pointerEvents: 'none', opacity: 0 }}>
      <div id="yt-hidden-player-mount"></div>
    </div>
  );
};
