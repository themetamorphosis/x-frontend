import { renderHook, act } from "@testing-library/react-native";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";

// Mock NetInfo
jest.mock("@react-native-community/netinfo", () => ({
  addEventListener: jest.fn(),
}));

// Mock Platform
jest.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

import NetInfo from "@react-native-community/netinfo";

describe("useNetworkStatus", () => {
  let listener: ((state: any) => void) | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    (NetInfo.addEventListener as jest.Mock).mockImplementation((cb: any) => {
      listener = cb;
      return jest.fn(); // unsubscribe
    });
  });

  it("should return true by default", () => {
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current).toBe(true);
  });

  it("should update when NetInfo reports disconnected", () => {
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      listener?.({ isConnected: false });
    });

    expect(result.current).toBe(false);
  });

  it("should update when NetInfo reports reconnected", () => {
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      listener?.({ isConnected: false });
    });
    expect(result.current).toBe(false);

    act(() => {
      listener?.({ isConnected: true });
    });
    expect(result.current).toBe(true);
  });

  it("should handle null isConnected as false", () => {
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      listener?.({ isConnected: null });
    });

    expect(result.current).toBe(false);
  });

  it("should unsubscribe on unmount", () => {
    const unsubscribe = jest.fn();
    (NetInfo.addEventListener as jest.Mock).mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useNetworkStatus());
    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});
