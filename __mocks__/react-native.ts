const React = require("react");

function mockComponent(name: string) {
  const component = (props: any) => {
    const { children, ...rest } = props;
    return React.createElement(name, rest, children);
  };
  component.displayName = name;
  return component;
}

module.exports = {
  View: mockComponent("View"),
  Text: mockComponent("Text"),
  TextInput: mockComponent("TextInput"),
  TouchableOpacity: mockComponent("TouchableOpacity"),
  ScrollView: mockComponent("ScrollView"),
  FlatList: mockComponent("FlatList"),
  Modal: mockComponent("Modal"),
  ActivityIndicator: mockComponent("ActivityIndicator"),
  RefreshControl: mockComponent("RefreshControl"),
  Alert: { alert: jest.fn() },
  StyleSheet: {
    create: (styles: any) => styles,
    flatten: (style: any) => style,
  },
  Animated: {
    Value: jest.fn(() => ({ current: 0, _value: 0 })),
    View: mockComponent("Animated.View"),
    Text: mockComponent("Animated.Text"),
    timing: jest.fn(() => ({ start: jest.fn((cb: () => void) => cb && cb()) })),
    sequence: jest.fn((animations: any[]) => ({ start: jest.fn((cb: () => void) => cb && cb()) })),
    delay: jest.fn(() => ({ start: jest.fn((cb: () => void) => cb && cb()) })),
    spring: jest.fn(() => ({ start: jest.fn((cb: () => void) => cb && cb()) })),
  },
  Platform: { OS: "ios", select: jest.fn((obj: any) => obj.ios) },
  PixelRatio: { getFontScale: jest.fn(() => 1) },
  Keyboard: { dismiss: jest.fn() },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812, scale: 3, fontScale: 1 })),
  },
};
