import { create } from 'zustand';

export const useToastStore = create((set) => ({
  toasts: [],
  showToast: (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }]
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    }, 3000);
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }));
  }
}));
