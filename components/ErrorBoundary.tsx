import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Sentry } from "../utils/sentry";
import { Colors } from "../utils/colors";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  resetKey: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, resetKey: 0 };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, resetKey: 0 };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
    Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
  }

  handleReset = () => {
    this.setState((prev) => ({ hasError: false, error: null, resetKey: prev.resetKey + 1 }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={styles.container}
          accessibilityLiveRegion="assertive"
          accessible
          accessibilityRole="alert"
        >
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message || "An unexpected error occurred."}
          </Text>
          <TouchableOpacity
            onPress={this.handleReset}
            style={styles.button}
            accessibilityRole="button"
            accessibilityLabel="Try again"
            accessibilityHint="Resets the app and attempts to recover from the error"
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return <View key={this.state.resetKey} style={{ flex: 1 }}>{this.props.children}</View>;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { color: Colors.white, fontSize: 20, fontWeight: "700", marginBottom: 12 },
  message: { color: Colors.gray500, fontSize: 14, textAlign: "center", marginBottom: 24 },
  button: { backgroundColor: Colors.white, paddingHorizontal: 24, paddingVertical: 12 },
  buttonText: { color: Colors.black, fontWeight: "600" },
});
