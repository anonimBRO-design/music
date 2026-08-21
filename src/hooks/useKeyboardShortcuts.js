import { useEffect } from 'react';
import { usePlayerStore } from '../stores/usePlayerStore';
import { useUserStore } from '../stores/useUserStore';
import { useQueueStore } from '../stores/useQueueStore';
import { useToastStore } from '../stores/useToastStore';

const IGNORED_ELEMENTS = ['INPUT', 'TEXTAREA', 'SELECT'];

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in form fields
      const tag = e.target?.tagName;
      if (IGNORED_ELEMENTS.includes(tag)) return;
      if (e.target?.isContentEditable) return;

      const player = usePlayerStore.getState();

      switch (e.code) {
        case 'Space': {
          e.preventDefault();
          player.togglePlay();
          break;
        }

        case 'ArrowRight': {
          e.preventDefault();
          if (e.shiftKey) {
            player.next();
          } else {
            const newTime = Math.min(player.currentTime + 5, player.duration);
            player.seekTo(newTime);
          }
          break;
        }

        case 'ArrowLeft': {
          e.preventDefault();
          if (e.shiftKey) {
            player.prev();
          } else {
            const newTime = Math.max(player.currentTime - 5, 0);
            player.seekTo(newTime);
          }
          break;
        }

        case 'ArrowUp': {
          e.preventDefault();
          player.setVolume(Math.min(player.volume + 5, 100));
          break;
        }

        case 'ArrowDown': {
          e.preventDefault();
          player.setVolume(Math.max(player.volume - 5, 0));
          break;
        }

        case 'KeyM': {
          if (e.ctrlKey || e.metaKey || e.altKey) return;
          e.preventDefault();
          player.toggleMute();
          break;
        }

        case 'KeyL': {
          if (e.ctrlKey || e.metaKey || e.altKey) return;
          e.preventDefault();
          const track = player.currentTrack;
          if (track) {
            const nowLiked = useUserStore.getState().toggleLike(track);
            useToastStore.getState().showToast(
              nowLiked ? 'Added to Liked Songs ♥' : 'Removed from Liked Songs',
              nowLiked ? 'success' : 'info'
            );
          }
          break;
        }

        case 'KeyF': {
          if (e.ctrlKey || e.metaKey || e.altKey) return;
          e.preventDefault();
          player.setFullscreenOpen(!player.isFullscreenOpen);
          break;
        }

        case 'KeyQ': {
          if (e.ctrlKey || e.metaKey || e.altKey) return;
          e.preventDefault();
          useQueueStore.getState().toggleQueue();
          break;
        }

        case 'KeyS': {
          if (e.ctrlKey || e.metaKey || e.altKey) return;
          e.preventDefault();
          player.toggleShuffle();
          break;
        }

        case 'KeyR': {
          if (e.ctrlKey || e.metaKey || e.altKey) return;
          e.preventDefault();
          player.cycleRepeat();
          break;
        }

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
