import React from 'react';
import { useStudioStore } from '../../stores/useStudioStore';
import { Keyboard, X } from 'lucide-react';

export const ShortcutHelpModal = () => {
  const isOpen = useStudioStore((s) => s.isShortcutsOpen);
  const close = useStudioStore((s) => s.toggleShortcuts);

  if (!isOpen) return null;

  const shortcutGroups = [
    {
      category: 'Playback Controls',
      items: [
        { key: 'Space', desc: 'Play / Pause' },
        { key: '← / →', desc: 'Seek 5 seconds back / forward' },
        { key: 'Shift + ← / →', desc: 'Previous / Next track' },
        { key: '↑ / ↓', desc: 'Volume up / down 5%' },
        { key: 'M', desc: 'Mute / Unmute audio' },
        { key: 'S', desc: 'Toggle Smart Shuffle' },
        { key: 'R', desc: 'Cycle Repeat mode (Off / All / One)' }
      ]
    },
    {
      category: 'Workspace & Studio',
      items: [
        { key: 'Ctrl + K', desc: 'Open Command Palette' },
        { key: 'Ctrl + I', desc: 'Toggle Right Studio Inspector' },
        { key: 'F', desc: 'Toggle Fullscreen Theater mode' },
        { key: 'L', desc: 'Like / Unlike currently playing track' },
        { key: 'Q', desc: 'Toggle Queue drawer' },
        { key: '?', desc: 'Open this Keyboard Shortcut reference' }
      ]
    },
    {
      category: 'Pro Table Navigation',
      items: [
        { key: '↑ / ↓ (in table)', desc: 'Move row focus cursor' },
        { key: 'Enter (in table)', desc: 'Play currently focused track' },
        { key: 'Double Click', desc: 'Directly play clicked row' }
      ]
    }
  ];

  return (
    <div
      onClick={close}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 font-mono select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-dawSurface border border-dawBorderBright rounded shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="daw-header daw-header-amber h-9 px-3">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-dawAmber" />
            <span className="text-white font-bold text-xs">STUDIO SHORTCUT CHEAT SHEET</span>
          </div>
          <button
            onClick={close}
            className="p-1 text-dawMuted hover:text-white rounded hover:bg-dawHover"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Shortcuts Body */}
        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {shortcutGroups.map((grp) => (
            <div key={grp.category} className="space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-dawAmber tracking-wider pb-1 border-b border-dawBorder">
                {grp.category}
              </div>
              <div className="grid grid-cols-1 gap-1">
                {grp.items.map((it) => (
                  <div
                    key={it.key}
                    className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-dawHover text-xs"
                  >
                    <span className="text-dawMuted">{it.desc}</span>
                    <kbd className="px-2 py-0.5 rounded bg-dawBg border border-dawBorder text-white text-[10px] font-bold shadow-sm">
                      {it.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-3 py-2 border-t border-dawBorder bg-dawBg text-right text-[10px] text-dawMuted">
          Press <kbd className="px-1.5 py-0.5 rounded bg-dawPanel border border-dawBorder text-white">ESC</kbd> to dismiss
        </div>
      </div>
    </div>
  );
};
