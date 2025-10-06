import "react-native-gesture-handler";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { View, ActivityIndicator, StyleSheet } from "react-native";

// Import authentication
import { AuthProvider, useAuth } from "./hooks/useAuth";

// Import screens
import MessagesScreen from "./screens/MessagesScreen";
import ConversationScreen from "./screens/ConversationScreen";
import RoomsScreen from "./screens/RoomsScreen";
import RoomDetailsScreen from "./screens/RoomDetailsScreen";
import MyTasksScreen from "./screens/MyTasksScreen";
import CalendarScreen from "./screens/CalendarScreen";
import ProfileScreen from "./screens/ProfileScreen";
import LoginScreen from "./screens/LoginScreen";
import GuestConversationScreen from "./screens/GuestConversationScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Messages Stack Navigator
const MessagesStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MessagesList" component={MessagesScreen} />
      <Stack.Screen name="Conversation" component={ConversationScreen} />
    </Stack.Navigator>
  );
};

// Main app component with authentication check
const AppContent = () => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5A5F" />
      </View>
    );
  }

  // Show login screen if user is not authenticated
  if (!user) {
    return <LoginScreen />;
  }

  // Show main app if user is authenticated
  const RoomsStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RoomsScreen" component={RoomsScreen} />
      <Stack.Screen name="RoomDetailsScreen" component={RoomDetailsScreen} />
      <Stack.Screen
        name="GuestConversationScreen"
        component={GuestConversationScreen}
      />
    </Stack.Navigator>
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Messages") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline";
          } else if (route.name === "Rooms") {
            iconName = focused ? "bed" : "bed-outline";
          } else if (route.name === "My Tasks") {
            iconName = focused ? "clipboard" : "clipboard-outline";
          } else if (route.name === "Calendar") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#FF5A5F",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E8E8E8",
          borderTopWidth: 1,
          paddingTop: 12,
          paddingBottom: 34,
          height: 90,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 6,
          marginBottom: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Messages"
        component={MessagesStack}
        options={{ tabBarLabel: "Messages" }}
      />
      <Tab.Screen
        name="Rooms"
        component={RoomsStack}
        options={{ tabBarLabel: "Rooms" }}
      />
      <Tab.Screen
        name="My Tasks"
        component={MyTasksScreen}
        options={{ tabBarLabel: "My Tasks" }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ tabBarLabel: "Calendar" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profile" }}
      />
    </Tab.Navigator>
  );
};

// Main app component wrapped with AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="dark" backgroundColor="#FFFFFF" />
        <AppContent />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});
