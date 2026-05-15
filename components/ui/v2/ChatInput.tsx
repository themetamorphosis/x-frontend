import React, { useState, useCallback } from "react";
import { View, TextInput } from "react-native";
import { PressableScale } from "./PressableScale";
import { Camera, Plus, Send } from "lucide-react-native";
import { useTheme } from "../../../utils/theme";
import { fonts } from "../../../utils/typography-v2";
import { haptic } from "../../../utils/haptics";

interface ChatInputProps {
  onSend: (message: string) => void;
  onCamera?: () => void;
  onAttach?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ChatInput = React.memo(function ChatInput({
  onSend, onCamera, onAttach, placeholder = "Describe what you ate...", disabled = false,
}: ChatInputProps) {
  const { colors } = useTheme();
  const [text, setText] = useState("");

  const handleSend = useCallback(() => {
    if (text.trim() && !disabled) { haptic.light(); onSend(text.trim()); setText(""); }
  }, [text, onSend, disabled]);

  return (
    <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 16,
      borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface, gap: 10 }}>
      {onCamera && (
        <PressableScale onPress={() => { haptic.light(); onCamera(); }} accessibilityRole="button" accessibilityLabel="Take photo"
          style={{ padding: 8 }}>
          <Camera size={20} color={colors.textSecondary} />
        </PressableScale>
      )}
      {onAttach && (
        <PressableScale onPress={() => { haptic.light(); onAttach(); }} accessibilityRole="button" accessibilityLabel="Attach"
          style={{ padding: 8 }}>
          <Plus size={20} color={colors.textSecondary} />
        </PressableScale>
      )}
      <TextInput value={text} onChangeText={setText} placeholder={placeholder} placeholderTextColor={colors.textTertiary}
        editable={!disabled}
        style={{ flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.text, paddingVertical: 10, paddingHorizontal: 14,
          backgroundColor: colors.bg, borderRadius: 24, maxHeight: 100, opacity: disabled ? 0.5 : 1 }} multiline />
      <PressableScale onPress={handleSend} disabled={!text.trim() || disabled} accessibilityRole="button" accessibilityLabel="Send message"
        accessibilityState={{ disabled: !text.trim() || disabled }}
        style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: text.trim() && !disabled ? colors.primary : colors.border,
          alignItems: "center", justifyContent: "center" }}>
        <Send size={18} color={text.trim() && !disabled ? colors.primaryText : colors.textTertiary} />
      </PressableScale>
    </View>
  );
});
