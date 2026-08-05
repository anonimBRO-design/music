// Player Manager - Core playback logic with YouTube IFrame API

import { eventBus } from '../core/events.js';
import { store, StoreHelpers } from '../core/store.js';
import { STORAGE_KEYS, REPEAT_MODES, YOUTUBE_PLAYER_STATES, DEFAULT_VOLUME, CROSSFADE_MAX_SECONDS } from '../core/constants.js';
import { queueManager } from './QueueManager.js';
import { formatSeconds } from '../core/utils.js';

class PlayerManager {
  constructor() {
    this.player = null;
    this.ready = false;
    this.currentTrack = null;
    this.isPlaying = false;
    this.isShuffle = false;
    this.repeatMode = REPEAT_MODES.OFF;
    this.isMuted = false;
    this.volume = DEFAULT_VOLUME;
    this.playbackSpeed = 1;
    this.currentTime = 0;
    this.duration = 0;
    this.progressInterval = null;
    this.crossfadeDuration = 0; // 0-12 seconds
    this.collection = []; // Current playback collection
    this.collectionIndex = -1;
    this.isCrossfading = false;
    this.gainNode = null;
    this.audioContext = null;

    this.init();
  }

  async init() {
    // Load persisted state
    this.loadState();

    // Initialize YouTube IFrame API
    this.initYouTubeAPI();

    // Initialize Web Audio for crossfade
    this.initWebAudio();

    // Listen for events
    eventBus.subscribe('queue:playTrack', (track) => this.play(track));
    eventBus.subscribe('player:togglePlay', () => this.togglePlay());
    eventBus.subscribe('player:next', () => this.next());
    eventBus.subscribe('player:prev', () => this.prev());
    eventBus.subscribe('player:seek', (time) => this.seek(time));
    eventBus.subscribe('player:setVolume', (vol) => this.setVolume(vol));
    eventBus.subscribe('player:toggleMute', () => this.toggleMute());
    eventBus.subscribe('player:toggleShuffle', () => this.toggleShuffle());
    eventBus.subscribe('player:cycleRepeat', () => this.cycleRepeat());
    eventBus.subscribe('player:setSpeed', (speed) => this.setPlaybackSpeed(speed));
    eventBus.subscribe('player:setCrossfade', (seconds) => this.setCrossfade(seconds));
  }

  /**
   * Load persisted playback state
   */
  loadState() {
    const state = StoreHelpers.getPlaybackState();
    this.isShuffle = state.shuffle;
    this.repeatMode = state.repeat;
    this.volume = state.volume || StoreHelpers.getVolume();
    this.playbackSpeed = state.speed || 1;
    this.crossfadeDuration = store.get(STORAGE_KEYS.CROSSFADE, 0);

    const lastTrack = StoreHelpers.getLastTrack();
    if (lastTrack) {
      this.currentTrack = lastTrack;
    }
  }

  /**
   * Initialize YouTube IFrame API
   */
  initYouTubeAPI() {
    return new Promise((resolve) => {
      if (window.YT && window.YT.Player) {
        this.createPlayer();
        resolve();
        return;
      }

      // Load IFrame API
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);

      window.onYouTubeIframeAPIReady = () => {
        this.createPlayer();
        resolve();
      };
    });
  }

  /**
   * Create YouTube player instance
   */
  createPlayer() {
    const container = document.createElement('div');
    container.id = '_yt_iframe_host';
    container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;';
    document.body.appendChild(container);

    this.player = new YT.Player('_yt_iframe_host', {
      height: '1',
      width: '1',
      playerVars: {
        autoplay: 0,
        controls: 0,
        playsinline: 1,
        origin: location.origin,
        enablejsapi: 1,
        modestbranding: 1,
        rel: 0,
        iv_load_policy: 3
      },
      events: {
        onReady: (e) => this.onPlayerReady(e),
        onStateChange: (e) => this.onStateChange(e.data),
        onError: (e) => this.onPlayerError(e.data),
        onPlaybackRateChange: (e) => this.onPlaybackRateChange(e.data)
      }
    });
  }

  /**
   * Initialize Web Audio API for crossfade
   */
  initWebAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = this.volume / 100;
    } catch (error) {
      console.warn('Web Audio API not available:', error);
    }
  }

  /**
   * Player ready callback
   */
  onPlayerReady(event) {
    this.ready = true;
    event.target.setVolume(this.volume);
    event.target.setPlaybackRate(this.playbackSpeed);

    // Restore last track if exists
    if (this.currentTrack) {
      this.cueVideo(this.currentTrack.id);
      this.seek(StoreHelpers.getPlaybackState().currentTime || 0);
    }

    eventBus.publish('player:ready');
  }

  /**
   * Player state change handler
   */
  onStateChange(state) {
    switch (state) {
      case YOUTUBE_PLAYER_STATES.PLAYING:
        this.isPlaying = true;
        this.startProgress();
        eventBus.publish('player:play');
        break;

      case YOUTUBE_PLAYER_STATES.PAUSED:
        this.isPlaying = false;
        this.stopProgress();
        eventBus.publish('player:pause');
        break;

      case YOUTUBE_PLAYER_STATES.ENDED:
        this.onTrackEnded();
        break;

      case YOUTUBE_PLAYER_STATES.BUFFERING:
        eventBus.publish('player:buffering');
        break;

      case YOUTUBE_PLAYER_STATES.CUED:
        eventBus.publish('player:cued');
        break;
    }
  }

  /**
   * Player error handler
   */
  onPlayerError(errorCode) {
    console.warn('YouTube Player Error:', errorCode);
    // 100: video not found, 101: embedding not allowed, 150: same as 101
    if ([100, 101, 150].includes(errorCode)) {
      eventBus.publish('toast:show', { message: 'This video is unavailable', type: 'error' });
      this.next();
    }
  }

  /**
   * Playback rate change
   */
  onPlaybackRateChange(rate) {
    this.playbackSpeed = rate;
    this.saveState();
  }

  /**
   * Load and play a track
   * @param {Object} track - Track object
   * @param {Object} options - Play options
   */
  async play(track, options = {}) {
    if (!track || !track.id) return;

    // Show loading state
    eventBus.publish('player:loading', true);

    try {
      // Get video details (optional, for duration verification)
      // await this.getVideoDetails(track.id);

      this.currentTrack = track;
      this.isPlaying = true;
      this.collection = options.collection || [];
      this.collectionIndex = options.collectionIndex ?? (this.collection.findIndex(t => t.id === track.id));

      // Update context in queue
      if (options.context) {
        queueManager.setContext(options.context.type, options.context.id);
      }

      // Rebuild queue from collection if provided
      if (this.collection.length && !options.preventQueueRebuild) {
        queueManager.rebuildFromCollection(this.collection, track.id);
      }

      // Update UI
      this.updateUI(track, true);

      // Persist
      StoreHelpers.setLastTrack(track);
      this.saveState();

      // Add to history
      this.addToHistory(track);

      // Play video
      if (this.ready) {
        this.loadVideo(track.id);
      } else {
        this.pendingTrack = track;
      }

      eventBus.publish('player:trackChanged', track);
      eventBus.publish('player:loading', false);

    } catch (error) {
      console.error('Play error:', error);
      eventBus.publish('player:loading', false);
      eventBus.publish('toast:show', { message: 'Failed to play track', type: 'error' });
    }
  }

  /**
   * Load video by ID
   */
  loadVideo(videoId) {
    if (!this.ready) return;
    this.player.loadVideoById(videoId);
  }

  /**
   * Cue video (prepare without playing)
   */
  cueVideo(videoId) {
    if (!this.ready) return;
    this.player.cueVideoById(videoId);
  }

  /**
   * Toggle play/pause
   */
  togglePlay() {
    if (!this.currentTrack) return;
    if (this.isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  /**
   * Resume playback
   */
  resume() {
    if (!this.ready || !this.currentTrack) return;
    this.player.playVideo();
  }

  /**
   * Pause playback
   */
  pause() {
    if (!this.ready) return;
    this.player.pauseVideo();
  }

  /**
   * Play next track
   */
  next() {
    // Check queue first
    if (queueManager.length > 0) {
      const nextTrack = queueManager.shift();
      if (nextTrack) {
        this.play(nextTrack);
        return;
      }
    }

    // Check collection
    if (this.collection.length > 0) {
      let nextIndex = this.collectionIndex + 1;

      if (this.isShuffle) {
        nextIndex = Math.floor(Math.random() * this.collection.length);
      } else if (nextIndex >= this.collection.length) {
        if (this.repeatMode === REPEAT_MODES.QUEUE) {
          nextIndex = 0;
        } else {
          // End of collection
          this.stop();
          return;
        }
      }

      if (nextIndex < this.collection.length) {
        this.collectionIndex = nextIndex;
        this.play(this.collection[nextIndex], {
          collection: this.collection,
          collectionIndex: nextIndex,
          preventQueueRebuild: true
        });
      }
    }
  }

  /**
   * Play previous track
   */
  prev() {
    const currentTime = this.getCurrentTime();

    // If more than 3 seconds in, restart current track
    if (currentTime > 3) {
      this.seek(0);
      return;
    }

    // Check collection
    if (this.collection.length > 0 && this.collectionIndex > 0) {
      this.collectionIndex--;
      this.play(this.collection[this.collectionIndex], {
        collection: this.collection,
        collectionIndex: this.collectionIndex,
        preventQueueRebuild: true
      });
    }
  }

  /**
   * Seek to time
   * @param {number} time - Time in seconds
   */
  seek(time) {
    if (!this.ready) return;
    const clampedTime = Math.max(0, Math.min(time, this.duration));
    this.player.seekTo(clampedTime, true);
    this.currentTime = clampedTime;
    this.updateProgressUI();
  }

  /**
   * Set volume (0-100)
   * @param {number} volume - Volume level
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(100, volume));
    if (this.ready) {
      this.player.setVolume(this.volume);
    }
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume / 100;
    }
    if (this.volume > 0 && this.isMuted) {
      this.toggleMute();
    }
    StoreHelpers.setVolume(this.volume);
    this.saveState();
    this.updateVolumeUI();
  }

  /**
   * Toggle mute
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.ready) {
      if (this.isMuted) {
        this.player.mute();
      } else {
        this.player.unMute();
      }
    }
    this.updateVolumeUI();
  }

  /**
   * Toggle shuffle
   */
  toggleShuffle() {
    this.isShuffle = !this.isShuffle;
    this.saveState();
    eventBus.publish('player:shuffleChanged', this.isShuffle);
    eventBus.publish('toast:show', {
      message: this.isShuffle ? 'Smart Shuffle on' : 'Shuffle off',
      type: 'info'
    });
  }

  /**
   * Cycle repeat mode
   */
  cycleRepeat() {
    this.repeatMode = (this.repeatMode + 1) % 3;
    this.saveState();
    const labels = ['Repeat off', 'Repeat queue', 'Repeat one'];
    eventBus.publish('player:repeatChanged', this.repeatMode);
    eventBus.publish('toast:show', { message: labels[this.repeatMode], type: 'info' });
  }

  /**
   * Set playback speed
   * @param {number} speed - Speed (0.5-2.0)
   */
  setPlaybackSpeed(speed) {
    const clampedSpeed = Math.max(0.5, Math.min(2.0, speed));
    this.playbackSpeed = clampedSpeed;
    if (this.ready) {
      this.player.setPlaybackRate(clampedSpeed);
    }
    this.saveState();
  }

  /**
   * Set crossfade duration
   * @param {number} seconds - Crossfade duration (0-12)
   */
  setCrossfade(seconds) {
    this.crossfadeDuration = Math.max(0, Math.min(CROSSFADE_MAX_SECONDS, seconds));
    store.set(STORAGE_KEYS.CROSSFADE, this.crossfadeDuration);
  }

  /**
   * Called when track ends
   */
  onTrackEnded() {
    this.isPlaying = false;
    this.stopProgress();
    eventBus.publish('player:ended');

    if (this.repeatMode === REPEAT_MODES.ONE) {
      this.seek(0);
      this.resume();
      return;
    }

    // Autoplay next
    const settings = store.get(STORAGE_KEYS.SETTINGS, { autoplay: true });
    if (settings.autoplay !== false) {
      this.next();
    }
  }

  /**
   * Stop playback
   */
  stop() {
    this.pause();
    this.currentTrack = null;
    this.collection = [];
    this.collectionIndex = -1;
    this.updateUI(null, false);
    eventBus.publish('player:stopped');
  }

  /**
   * Get current playback time
   */
  getCurrentTime() {
    if (!this.ready) return this.currentTime;
    return this.player.getCurrentTime() || 0;
  }

  /**
   * Get track duration
   */
  getDuration() {
    if (!this.ready) return this.duration;
    return this.player.getDuration() || 0;
  }

  /**
   * Get player state
   */
  getState() {
    if (!this.ready) return YOUTUBE_PLAYER_STATES.UNSTARTED;
    return this.player.getPlayerState();
  }

  /**
   * Start progress interval
   */
  startProgress() {
    this.stopProgress();
    this.progressInterval = setInterval(() => this.updateProgress(), 250);
  }

  /**
   * Stop progress interval
   */
  stopProgress() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  /**
   * Update progress
   */
  updateProgress() {
    this.currentTime = this.getCurrentTime();
    this.duration = this.getDuration();

    if (this.duration > 0) {
      const progress = (this.currentTime / this.duration) * 100;
      eventBus.publish('player:progress', {
        currentTime: this.currentTime,
        duration: this.duration,
        progress
      });
      this.updateProgressUI();
    }

    // Accumulate listening time
    if (this.isPlaying) {
      StoreHelpers.addListeningTime(0.25);
    }
  }

  /**
   * Update UI elements
   */
  updateUI(track, playing) {
    eventBus.publish('player:uiUpdate', { track, playing });
  }

  /**
   * Update progress UI
   */
  updateProgressUI() {
    eventBus.publish('player:progressUpdate', {
      currentTime: this.currentTime,
      duration: this.duration,
      progress: this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0
    });
  }

  /**
   * Update volume UI
   */
  updateVolumeUI() {
    eventBus.publish('player:volumeUpdate', {
      volume: this.volume,
      isMuted: this.isMuted
    });
  }

  /**
   * Save playback state
   */
  saveState() {
    StoreHelpers.setPlaybackState({
      currentTime: this.currentTime,
      isPlaying: this.isPlaying,
      shuffle: this.isShuffle,
      repeat: this.repeatMode,
      speed: this.playbackSpeed
    });
  }

  /**
   * Add track to history
   */
  addToHistory(track) {
    eventBus.publish('history:add', track);
  }

  /**
   * Open fullscreen player
   */
  openFullscreen() {
    eventBus.publish('fullscreen:open', this.currentTrack);
  }

  /**
   * Close fullscreen player
   */
  closeFullscreen() {
    eventBus.publish('fullscreen:close');
  }

  /**
   * Get current track
   */
  getCurrentTrack() {
    return this.currentTrack;
  }

  /**
   * Check if playing
   */
  getIsPlaying() {
    return this.isPlaying;
  }

  /**
   * Get volume
   */
  getVolume() {
    return this.volume;
  }

  /**
   * Get repeat mode
   */
  getRepeatMode() {
    return this.repeatMode;
  }

  /**
   * Get shuffle state
   */
  getShuffle() {
    return this.isShuffle;
  }

  /**
   * Serialize state for sync
   */
  serialize() {
    return {
      currentTrack: this.currentTrack,
      currentTime: this.currentTime,
      volume: this.volume,
      isMuted: this.isMuted,
      isShuffle: this.isShuffle,
      repeatMode: this.repeatMode,
      playbackSpeed: this.playbackSpeed,
      crossfadeDuration: this.crossfadeDuration,
      collection: this.collection,
      collectionIndex: this.collectionIndex
    };
  }

  /**
   * Restore state
   */
  restore(data) {
    if (data.currentTrack) this.currentTrack = data.currentTrack;
    if (data.currentTime !== undefined) this.currentTime = data.currentTime;
    if (data.volume !== undefined) this.setVolume(data.volume);
    if (data.isMuted !== undefined) this.isMuted = data.isMuted;
    if (data.isShuffle !== undefined) this.isShuffle = data.isShuffle;
    if (data.repeatMode !== undefined) this.repeatMode = data.repeatMode;
    if (data.playbackSpeed !== undefined) this.setPlaybackSpeed(data.playbackSpeed);
    if (data.crossfadeDuration !== undefined) this.setCrossfade(data.crossfadeDuration);
    if (data.collection) this.collection = data.collection;
    if (data.collectionIndex !== undefined) this.collectionIndex = data.collectionIndex;
  }
}

// Singleton instance
export const playerManager = new PlayerManager();