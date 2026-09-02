import { create } from "zustand";
import type { EmployeeSession, SafeUser } from "@shared/types";

interface AuthState {
  user: SafeUser | null;
  session: EmployeeSession | null;
  ready: boolean;
  error: string | null;
  init(): Promise<void>;
  login(username: string, password: string): Promise<void>;
  logout(): Promise<void>;
  endSession(): Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  ready: false,
  error: null,

  async init() {
    const user = await window.hkd.auth.currentUser();
    set({ user, ready: true });
  },

  async login(username, password) {
    set({ error: null });
    try {
      const result = await window.hkd.auth.login(username, password);
      set({ user: result.user, session: result.session });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Login failed" });
      throw err;
    }
  },

  async logout() {
    await window.hkd.auth.logout();
    set({ user: null, session: null });
  },

  async endSession() {
    await window.hkd.sessions.endMine();
    set({ user: null, session: null });
  }
}));
