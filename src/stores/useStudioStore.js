import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStudioStore = create(
  persist(
    (set) => ({
      // Inspector panel on the right
      isInspectorOpen: true,
      inspectorTab: 'now-playing', // 'now-playing' | 'lyrics' | 'queue'
      toggleInspector: () => set((s) => ({ isInspectorOpen: !s.isInspectorOpen })),
      setInspectorOpen: (open) => set({ isInspectorOpen: open }),
      setInspectorTab: (tab) => set({ inspectorTab: tab }),

      // Center Workspace view mode: 'table' or 'grid'
      viewMode: 'table', // 'table' | 'grid'
      toggleViewMode: () => set((s) => ({ viewMode: s.viewMode === 'table' ? 'grid' : 'table' })),
      setViewMode: (mode) => set({ viewMode: mode }),

      // Floating Mini-Player HUD
      isMiniPlayerOpen: false,
      toggleMiniPlayer: () => set((s) => ({ isMiniPlayerOpen: !s.isMiniPlayerOpen })),
      setMiniPlayerOpen: (open) => set({ isMiniPlayerOpen: open }),

      // Command Palette (Ctrl+K)
      isCommandPaletteOpen: false,
      toggleCommandPalette: () => set((s) => ({ isCommandPaletteOpen: !s.isCommandPaletteOpen })),
      setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),

      // Shortcut Cheat Sheet (?)
      isShortcutsOpen: false,
      toggleShortcuts: () => set((s) => ({ isShortcutsOpen: !s.isShortcutsOpen })),
      setShortcutsOpen: (open) => set({ isShortcutsOpen: open }),
    }),
    {
      name: 'nonimsong-studio-preferences',
      partialize: (state) => ({
        isInspectorOpen: state.isInspectorOpen,
        inspectorTab: state.inspectorTab,
        viewMode: state.viewMode,
      }),
    }
  )
);
