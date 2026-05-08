import React, { useState, useCallback } from "react";
import { View, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { MotiPressable } from "moti/interactions";
import { Camera, Plus, Send } from "lucide-react-native";
import { useTheme } from "../../../utils/theme";
import { fonts } from "../../../utils/typography-v2";
import { haptic } from "../../../utils/haptics";

interface ChatInputProps {
  onSend: (message: string) => void;
  onCamera?: () => void;
  onAttach?: () => void;
  placeholder?: string;
}

export const ChatInput = React.memo(function ChatInput({
  onSend, onCamera, onAttach, placeholder = "Describe what you ate...",
}: ChatInputProps) {
  const { colors } = useTheme();
  const [text, setText] = useState("");

  const handleSend = useCallback(() => {
    if (text.trim()) { haptic.light(); onSend(text.trim()); setText(""); }
  }, [text, onSend]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={90}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 12,
        borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface, gap: 8 }}>
        {onCamera && (
          <MotiPressable onPress={() => { haptic.light(); onCamera(); }} accessibilityRole="button" accessibilityLabel="Take photo"
            animate={({ pressed }) => ({ scale: pressed ? 0.9 : 1 })} style={{ padding: 6 }}>
            <Camera size={20} color={colors.textSecondary} />
          </MotiPressable>
        )}
        {onAttach && (
          <MotiPressable onPress={() => { haptic.light(); onAttach(); }} accessibilityRole="button" accessibilityLabel="Attach"
            animate={({ pressed }) => ({ scale: pressed ? 0.9 : 1 })} style={{ padding: 6 }}>
            <Plus size={20} color={colors.textSecondary} />
          </MotiPressable>
        )}
        <TextInput value={text} onChangeText={setText} placeholder={placeholder} placeholderTextColor={colors.textTertiary}
          style={{ flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.text, paddingVertical: 8, paddingHorizontal: 12,
            backgroundColor: colors.bg, borderRadius: 20, maxHeight: 100 }} multiline />
        <MotiPressable onPress={handleSend} disabled={!text.trim()} accessibilityRole="button" accessibilityLabel="Send message"
          animate={({ pressed }) => ({ scale: pressed ? 0.9 : 1 })}
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: text.trim() ? colors.primary : colors.border,
            alignItems: "center", justifyContent: "center" }}>
          <Send size={16} color={text.trim() ? colors.primaryText : colors.textTertiary} />
        </MotiPressable>
      </View>
    </KeyboardAvoidingView>
  );
});
