import React, { useState } from "react";
import { Pressable, PressableProps, ViewStyle } from "react-native";

interface PressableScaleProps extends Omit<PressableProps, "style"> {
  scale?: number;
  style?: ViewStyle | ((pressed: boolean) => ViewStyle);
  /** @deprecated The animate prop is not used. Press scale is handled internally via the style function form. */
  animate?: (state: { pressed: boolean }) => ViewStyle;
}

export function PressableScale({
  scale = 0.97,
  onPress,
  children,
  style,
  animate: _animate,
  ...rest
}: PressableScaleProps) {
  const [pressed, setPressed] = useState(false);

  const resolvedStyle =
    typeof style === "function" ? style(pressed) : style;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        { transform: [{ scale: pressed ? scale : 1 }] },
        resolvedStyle,
      ]}
      {...rest}
    >
      {children}
    </Pressable>
  );
}
