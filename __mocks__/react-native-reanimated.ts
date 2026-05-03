module.exports = {
  default: {
    View: "Animated.View",
    Text: "Animated.Text",
  },
  useSharedValue: (v: any) => ({ value: v }),
  useAnimatedStyle: (fn: () => any) => fn(),
  withTiming: (v: any) => v,
  withSpring: (v: any) => v,
  withDelay: (_d: any, v: any) => v,
  useAnimatedProps: (fn: () => any) => fn(),
  Easing: {
    linear: (v: any) => v,
    ease: (v: any) => v,
    out: (fn: any) => fn,
    cubic: (v: any) => v,
  },
};
