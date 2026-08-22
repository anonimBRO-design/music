import React, { useEffect, useRef } from 'react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useUserStore } from '../../stores/useUserStore';
import { useSleepTimerStore } from '../../stores/useSleepTimerStore';
import { useToastStore } from '../../stores/useToastStore';
import { useTasteStore } from '../../stores/useTasteStore';
import { useMediaSession } from '../../hooks/useMediaSession';

export const AudioEngine = React.memo(() => {
  const playerRef = useRef(null);
  const isReadyRef = useRef(false);
  const progressIntervalRef = useRef(null);
  const pendingCommandRef = useRef(null);
  const currentLoadedVideoIdRef = useRef(null);
  const isTransitioningRef = useRef(false);

  // Taste Tracking Refs
  const loggedNormalPlayTrackIdRef = useRef(null);
  const loggedFinishTrackIdRef = useRef(null);
  const trackPlayStartRef = useRef(0);
  const lastActiveTrackRef = useRef(null);
  const lastTrackSecondsRef = useRef(0);

  // Subscribed values
  const _audioCommand = usePlayerStore((state) => state._audioCommand);
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const volume = usePlayerStore((state) => state.volume);
  const repeatMode = usePlayerStore((state) => state.repeatMode);
  const syncAudioState = usePlayerStore((state) => state.syncAudioState);
  const addPlayedSeconds = useUserStore((state) => state.addPlayedSeconds);

  // Sync refs to avoid stale closures in YouTube callbacks
  const repeatModeRef = useRef(repeatMode);
  repeatModeRef.current = repeatMode;

  const currentTrackRef = useRef(currentTrack);
  currentTrackRef.current = currentTrack;

  const volumeRef = useRef(volume);
  volumeRef.current = volume;

  // Mount Media Session API (lockscreen/browser media controls)
  useMediaSession();

  // Watch track changes for Skip detection
  useEffect(() => {
    if (lastActiveTrackRef.current && currentTrack?.id !== lastActiveTrackRef.current.id) {
      const playedSec = lastTrackSecondsRef.current;
      const prevTrack = lastActiveTrackRef.current;
      // If previous track played between 3s and 30s without reaching normal play -> SKIP
      if (playedSec >= 3 && playedSec < 30 && loggedNormalPlayTrackIdRef.current !== prevTrack.id) {
        useTasteStore.getState().logTrackEvent(prevTrack, 'SKIP', { playedSeconds: playedSec, playedRatio: playedSec / 180 });
      }
    }

    if (currentTrack?.id) {
      lastActiveTrackRef.current = currentTrack;
      lastTrackSecondsRef.current = 0;
      trackPlayStartRef.current = Date.now();
      loggedNormalPlayTrackIdRef.current = null;
      loggedFinishTrackIdRef.current = null;
    }
  }, [currentTrack?.id]);

  const startProgressLoop = () => {
    stopProgressLoop();
    progressIntervalRef.current = setInterval(() => {
      if (playerRef.current && isReadyRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const currentTime = playerRef.current.getCurrentTime() || 0;
          const duration = playerRef.current.getDuration() || 180;
          syncAudioState({ currentTime, duration });
          addPlayedSeconds(0.5);
          lastTrackSecondsRef.current = currentTime;

          const track = currentTrackRef.current;
          if (track?.id) {
            // Log NORMAL_PLAY at 30s
            if (currentTime >= 30 && loggedNormalPlayTrackIdRef.current !== track.id) {
              loggedNormalPlayTrackIdRef.current = track.id;
              useTasteStore.getState().logTrackEvent(track, 'NORMAL_PLAY', { playedSeconds: currentTime, playedRatio: currentTime / duration });
            }

            // Log PLAY_FINISH at 80% duration
            if (duration > 10 && currentTime >= duration * 0.8 && loggedFinishTrackIdRef.current !== track.id) {
              loggedFinishTrackIdRef.current = track.id;
              useTasteStore.getState().logTrackEvent(track, 'PLAY_FINISH', { playedSeconds: currentTime, playedRatio: currentTime / duration });
            }
          }
        } catch (e) {}
      }
    }, 500);
  };

  const stopProgressLoop = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const executeCommand = (cmd) => {
    if (!cmd) return;

    if (!playerRef.current || !isReadyRef.current) {
      pendingCommandRef.current = cmd;
      return;
    }

    const { type, payload, trackId } = cmd;
    try {
      if (type === 'LOAD') {
        const vid = payload || trackId;
        if (vid) {
          currentLoadedVideoIdRef.current = vid;
          playerRef.current.loadVideoById(vid);
        }
      } else if (type === 'PLAY') {
        const targetId = trackId || currentTrackRef.current?.id;
        if (targetId && currentLoadedVideoIdRef.current !== targetId) {
          currentLoadedVideoIdRef.current = targetId;
          playerRef.current.loadVideoById(targetId);
        } else {
          playerRef.current.playVideo();
        }
      } else if (type === 'PAUSE') {
        playerRef.current.pauseVideo();
      } else if (type === 'SEEK') {
        playerRef.current.seekTo(payload, true);
      } else if (type === 'VOLUME') {
        playerRef.current.setVolume(payload);
      }
    } catch (e) {
      console.warn('[AudioEngine] Command execution error:', e);
    }
  };

  // Initialize YouTube IFrame API once
  useEffect(() => {
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
          host: 'https://www.youtube-nocookie.com',
          playerVars: {
            autoplay: 0, // Never force autoplay on initial mount to respect browser policy
            controls: 0,
            disablekb: 1,
            fs: 0,
            playsinline: 1,
            rel: 0,
            enablejsapi: 1,
            origin: window.location.origin
          },
          events: {
            onReady: (event) => {
              isReadyRef.current = true;
              event.target.setVolume(volumeRef.current);

              // 1. If user initiated a play command while script was loading, execute now
              if (pendingCommandRef.current) {
                const cmd = pendingCommandRef.current;
                pendingCommandRef.current = null;
                executeCommand(cmd);
              } else if (currentTrackRef.current?.id) {
                // 2. Prime player with last played track without autoplaying audio
                try {
                  event.target.cueVideoById(currentTrackRef.current.id);
                  currentLoadedVideoIdRef.current = currentTrackRef.current.id;
                } catch (e) {}
              }
            },
            onStateChange: (event) => {
              // 1: Playing
              if (event.data === 1) {
                isTransitioningRef.current = false;
                syncAudioState({ isPlaying: true });
                startProgressLoop();
              }
              // 2: Paused
              else if (event.data === 2) {
                syncAudioState({ isPlaying: false });
                stopProgressLoop();
              }
              // 0: Ended
              else if (event.data === 0) {
                syncAudioState({ isPlaying: false });
                stopProgressLoop();

                // Notify Sleep Timer
                useSleepTimerStore.getState().onTrackEnded();

                // Repeat one
                if (repeatModeRef.current === 2) {
                  try {
                    playerRef.current?.seekTo(0);
                    playerRef.current?.playVideo();
                  } catch (e) {}
                }
                // Play next with transition lock
                else if (!isTransitioningRef.current) {
                  isTransitioningRef.current = true;
                  setTimeout(() => {
                    isTransitioningRef.current = false;
                  }, 3500);
                  usePlayerStore.getState().next();
                }
              }
              // 3: Buffering
              else if (event.data === 3) {
                syncAudioState({ isPlaying: true });
              }
            },
            onError: (err) => {
              console.warn('[AudioEngine] YouTube Player Error:', err?.data);
              // Error codes 100, 101, 150 mean video is deleted, private, or embedding restricted
              const isUnplayable = [100, 101, 150].includes(err?.data);
              if (isUnplayable && !isTransitioningRef.current) {
                isTransitioningRef.current = true;
                setTimeout(() => {
                  isTransitioningRef.current = false;
                }, 3500);
                useToastStore.getState().showToast('Track unavailable for embed, playing next...', 'info');
                usePlayerStore.getState().next();
              }
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

  // Handle commands dispatched through Zustand
  useEffect(() => {
    if (_audioCommand) {
      executeCommand(_audioCommand);
    }
  }, [_audioCommand]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        bottom: -100,
        left: -100,
        width: 1,
        height: 1,
        pointerEvents: 'none',
        opacity: 0,
        zIndex: -9999
      }}
    >
      <div id="yt-hidden-player-mount"></div>
    </div>
  );
});
