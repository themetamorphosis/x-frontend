import { Tabs } from "expo-router";
import { View } from "react-native";
import { ErrorBoundary } from "../../components/ErrorBoundary";

function TabIcon({ name: _name, focused }: { name: string; focused: boolean }) {
  return (
    <View
      style={{
        width: 24,
        height: 24,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: focused ? "#FFFFFF" : "#333333",
        }}
      />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <ErrorBoundary>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#000000",
          borderTopColor: "#1A1A1A",
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 28,
          paddingTop: 12,
        },
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#333333",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "500",
          letterSpacing: 0.5,
          textTransform: "uppercase",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => <TabIcon name="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: "Log",
          tabBarIcon: ({ focused }) => <TabIcon name="Log" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ focused }) => <TabIcon name="Progress" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => <TabIcon name="Profile" focused={focused} />,
        }}
      />
    </Tabs>
    </ErrorBoundary>
  );
}
