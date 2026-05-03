import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../services/api";

interface Profile {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  sex: string | null;
  goal: string | null;
  activity_level: string | null;
  pace: string | null;
}

interface Targets {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  water_ml: number;
}

interface OnboardingData {
  goal: string | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  sex: string | null;
  activity_level: string | null;
  pace: string | null;
}

interface ProfileState {
  profile: Profile | null;
  targets: Targets | null;
  onboarding: OnboardingData;
  isLoading: boolean;
  profileLoaded: boolean;

  setProfile: (profile: Profile) => void;
  setTargets: (targets: Targets) => void;
  setOnboarding: (data: Partial<OnboardingData>) => void;
  resetOnboarding: () => void;
  isOnboardingComplete: () => boolean;

  fetchProfile: () => Promise<void>;
  saveProfile: (data: Partial<Profile>) => Promise<void>;
  calculateTargets: () => Promise<Targets>;
  saveOnboarding: () => Promise<Targets>;
}

const emptyOnboarding: OnboardingData = {
  goal: null,
  age: null,
  height_cm: null,
  weight_kg: null,
  sex: null,
  activity_level: null,
  pace: null,
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: null,
      targets: null,
      onboarding: { ...emptyOnboarding },
      isLoading: false,
      profileLoaded: false,

      setProfile: (profile) => set({ profile }),
      setTargets: (targets) => set({ targets }),
      setOnboarding: (data) =>
        set((state) => ({ onboarding: { ...state.onboarding, ...data } })),
      resetOnboarding: () => set({ onboarding: { ...emptyOnboarding } }),

      isOnboardingComplete: () => {
        const p = get().profile;
        return !!(p?.age && p?.height_cm && p?.weight_kg && p?.sex && p?.goal && p?.activity_level);
      },

      fetchProfile: async () => {
        set({ isLoading: true });
        try {
          const profile = await api.get<Profile>("/user/profile");
          set({ profile, isLoading: false, profileLoaded: true });
        } catch {
          set({ isLoading: false, profileLoaded: true });
        }
      },

      saveProfile: async (data) => {
        const profile = await api.put<Profile>("/user/profile", data);
        set({ profile });
      },

      calculateTargets: async () => {
        const targets = await api.post<Targets>("/user/calculate-targets");
        set({ targets });
        return targets;
      },

      saveOnboarding: async () => {
        const { onboarding } = get();
        await api.put("/user/profile", {
          goal: onboarding.goal,
          age: onboarding.age,
          height_cm: onboarding.height_cm,
          weight_kg: onboarding.weight_kg,
          sex: onboarding.sex,
          activity_level: onboarding.activity_level,
          pace: onboarding.pace,
        });
        const targets = await api.post<Targets>("/user/calculate-targets");
        set({ targets });
        await get().fetchProfile();
        return targets;
      },
    }),
    {
      name: "nutrilog-profile",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ targets: state.targets }),
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.error("[profileStore] Failed to rehydrate:", error);
        }
      },
    }
  )
);
