import { useProfileStore } from "../../stores/profileStore";
import { api } from "../../services/api";

describe("profileStore", () => {
  beforeEach(() => {
    useProfileStore.setState({
      profile: null,
      targets: null,
      onboarding: { goal: null, age: null, height_cm: null, weight_kg: null, sex: null, activity_level: null, pace: null },
      isLoading: false,
      profileLoaded: false,
    });
    jest.restoreAllMocks();
  });

  describe("setProfile", () => {
    it("sets the profile", () => {
      const p = { id: "1", name: "A", email: "a@b.com", avatar_url: null, age: 25, height_cm: 175, weight_kg: 70, sex: "male", goal: "maintain", activity_level: "moderate", pace: "moderate" };
      useProfileStore.getState().setProfile(p);
      expect(useProfileStore.getState().profile).toEqual(p);
    });
  });

  describe("setTargets", () => {
    it("sets the targets", () => {
      const t = { calories: 2000, protein_g: 150, carbs_g: 200, fat_g: 65, fiber_g: 30, water_ml: 2500 };
      useProfileStore.getState().setTargets(t);
      expect(useProfileStore.getState().targets).toEqual(t);
    });
  });

  describe("setOnboarding", () => {
    it("merges partial data", () => {
      useProfileStore.getState().setOnboarding({ goal: "lose_fat" });
      useProfileStore.getState().setOnboarding({ age: 30 });
      const o = useProfileStore.getState().onboarding;
      expect(o.goal).toBe("lose_fat");
      expect(o.age).toBe(30);
      expect(o.sex).toBeNull();
    });
  });

  describe("resetOnboarding", () => {
    it("resets to empty", () => {
      useProfileStore.getState().setOnboarding({ goal: "lose_fat", age: 30 });
      useProfileStore.getState().resetOnboarding();
      const o = useProfileStore.getState().onboarding;
      expect(o.goal).toBeNull();
      expect(o.age).toBeNull();
    });
  });

  describe("isOnboardingComplete", () => {
    it("returns false when profile is null", () => {
      expect(useProfileStore.getState().isOnboardingComplete()).toBe(false);
    });

    it("returns false when fields missing", () => {
      useProfileStore.getState().setProfile({ id: "1", name: "A", email: "a@b.com", avatar_url: null, age: null, height_cm: 175, weight_kg: 70, sex: "male", goal: "maintain", activity_level: "moderate", pace: "moderate" });
      expect(useProfileStore.getState().isOnboardingComplete()).toBe(false);
    });

    it("returns true when all fields present", () => {
      useProfileStore.getState().setProfile({ id: "1", name: "A", email: "a@b.com", avatar_url: null, age: 25, height_cm: 175, weight_kg: 70, sex: "male", goal: "maintain", activity_level: "moderate", pace: "moderate" });
      expect(useProfileStore.getState().isOnboardingComplete()).toBe(true);
    });
  });

  describe("fetchProfile", () => {
    it("sets profile on success", async () => {
      const p = { id: "1", name: "A", email: "a@b.com" };
      jest.spyOn(api, "get").mockResolvedValueOnce(p);
      await useProfileStore.getState().fetchProfile();
      expect(useProfileStore.getState().profile).toEqual(p);
      expect(useProfileStore.getState().profileLoaded).toBe(true);
      expect(useProfileStore.getState().isLoading).toBe(false);
    });

    it("sets profileLoaded on failure", async () => {
      jest.spyOn(api, "get").mockRejectedValueOnce(new Error("fail"));
      await useProfileStore.getState().fetchProfile();
      expect(useProfileStore.getState().profileLoaded).toBe(true);
      expect(useProfileStore.getState().isLoading).toBe(false);
    });
  });

  describe("saveProfile", () => {
    it("calls PUT and sets profile", async () => {
      const p = { id: "1", name: "Updated", email: "a@b.com" };
      jest.spyOn(api, "put").mockResolvedValueOnce(p);
      await useProfileStore.getState().saveProfile({ name: "Updated" });
      expect(api.put).toHaveBeenCalledWith("/user/profile", { name: "Updated" });
      expect(useProfileStore.getState().profile).toEqual(p);
    });
  });

  describe("calculateTargets", () => {
    it("calls POST and sets targets", async () => {
      const t = { calories: 2200, protein_g: 160, carbs_g: 220, fat_g: 70, fiber_g: 30, water_ml: 2500 };
      jest.spyOn(api, "post").mockResolvedValueOnce(t);
      const result = await useProfileStore.getState().calculateTargets();
      expect(result).toEqual(t);
      expect(useProfileStore.getState().targets).toEqual(t);
    });
  });

  describe("saveOnboarding", () => {
    it("PUTs profile, POSTs targets, fetches profile", async () => {
      useProfileStore.getState().setOnboarding({ goal: "lose_fat", age: 30, height_cm: 175, weight_kg: 80, sex: "male", activity_level: "moderate", pace: "moderate" });
      const t = { calories: 1800, protein_g: 140, carbs_g: 180, fat_g: 55, fiber_g: 30, water_ml: 2500 };
      jest.spyOn(api, "put").mockResolvedValueOnce({});
      jest.spyOn(api, "post").mockResolvedValueOnce(t);
      jest.spyOn(api, "get").mockResolvedValueOnce({ id: "1", name: "A", email: "a@b.com" });

      const result = await useProfileStore.getState().saveOnboarding();
      expect(api.put).toHaveBeenCalled();
      expect(api.post).toHaveBeenCalledWith("/user/calculate-targets");
      expect(api.get).toHaveBeenCalledWith("/user/profile");
      expect(result).toEqual(t);
    });
  });
});
