import { create } from 'zustand';
import { clearSession, readSession, saveSession } from '../services/session';
export const useAuthStore = create(set => ({
  token: null,
  user: null,
  hydrated: false,
  hydrate: async () => {
    const session = await readSession();
    set({
      token: session?.token || null,
      user: session?.user || null,
      hydrated: true,
    });
  },
  setSession: async session => {
    await saveSession(session);
    set(session);
  },
  logout: async () => {
    await clearSession();
    set({ token: null, user: null });
  },
}));
