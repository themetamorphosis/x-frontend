import React from "react";
import { View } from "react-native";
import { Text } from "./Text";

interface StatBlockProps {
  value: string | number;
  label: string;
  align?: "left" | "center";
}

export const StatBlock = React.memo(function StatBlock({ value, label, align = "left" }: StatBlockProps) {
  return (
    <View style={{ alignItems: align === "center" ? "center" : "flex-start" }}>
      <Text preset="h2">{String(value)}</Text>
      <Text preset="caption" style={{ marginTop: 2 }}>{label}</Text>
    </View>
  );
});
