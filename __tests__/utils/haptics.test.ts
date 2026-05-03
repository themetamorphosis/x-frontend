import { haptic } from "../../utils/haptics";
import * as Haptics from "expo-haptics";

describe("haptic", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls impactAsync with Light for light()", () => {
    haptic.light();
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
  });

  it("calls impactAsync with Medium for medium()", () => {
    haptic.medium();
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
  });

  it("calls impactAsync with Heavy for heavy()", () => {
    haptic.heavy();
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Heavy);
  });

  it("calls notificationAsync with Success for success()", () => {
    haptic.success();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Success);
  });

  it("calls notificationAsync with Error for error()", () => {
    haptic.error();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Error);
  });

  it("calls selectionAsync for selection()", () => {
    haptic.selection();
    expect(Haptics.selectionAsync).toHaveBeenCalled();
  });
});
