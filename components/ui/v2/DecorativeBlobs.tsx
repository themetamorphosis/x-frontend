import React from "react";
import { View, Dimensions } from "react-native";
import Svg, { Circle, Ellipse } from "react-native-svg";
import { useTheme } from "../../../utils/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface DecorativeBlobsProps {
  variant?: "circles" | "dots" | "waves";
}

export const DecorativeBlobs = React.memo(function DecorativeBlobs({
  variant = "circles",
}: DecorativeBlobsProps) {
  const { colors } = useTheme();

  if (variant === "circles") {
    return (
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none" }}>
        <Svg width={SCREEN_WIDTH} height="100%" style={{ position: "absolute" }}>
          <Circle cx={SCREEN_WIDTH * 0.85} cy={80} r={60} fill={colors.border} opacity={0.3} />
          <Circle cx={SCREEN_WIDTH * 0.1} cy={200} r={40} fill={colors.border} opacity={0.2} />
          <Circle cx={SCREEN_WIDTH * 0.7} cy={400} r={25} fill={colors.border} opacity={0.15} />
        </Svg>
      </View>
    );
  }

  if (variant === "dots") {
    return (
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none" }}>
        <Svg width={SCREEN_WIDTH} height="100%" style={{ position: "absolute" }}>
          {[...Array(12)].map((_, i) => (
            <Circle
              key={i}
              cx={40 + (i % 4) * ((SCREEN_WIDTH - 80) / 3)}
              cy={60 + Math.floor(i / 4) * 80}
              r={3}
              fill={colors.textTertiary}
              opacity={0.15}
            />
          ))}
        </Svg>
      </View>
    );
  }

  // waves
  return (
    <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, pointerEvents: "none" }}>
      <Svg width={SCREEN_WIDTH} height={120}>
        <Ellipse cx={SCREEN_WIDTH / 2} cy={80} rx={SCREEN_WIDTH * 0.6} ry={40} fill={colors.border} opacity={0.2} />
        <Ellipse cx={SCREEN_WIDTH * 0.3} cy={100} rx={SCREEN_WIDTH * 0.3} ry={20} fill={colors.border} opacity={0.15} />
      </Svg>
    </View>
  );
});
