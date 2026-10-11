import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "STUDENT" | "TEACHER" | "ADMIN";
export type AccessProfile = "STANDARD" | "VISUAL" | "AUDITORY" | "MOTOR" | "DYSLEXIA" | "ADHD" | "AUTISM" | "ADVANCED" | "LANGUAGE" | "NIGHT";

export interface AuthUser {
  id: string;
  dni: string;
  fullName: string;
  role: Role;
  grade?: string | null;
  accessProfile: AccessProfile;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: "ecoeduca-auth" }
  )
);