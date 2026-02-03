import React from "react";
import { Tabs } from "expo-router";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Alert, TouchableOpacity } from "react-native";
import supabase from "@/utils/supabase";
export default function AuthLayout() {
  const router = useRouter();

  const handleSignOut = async () => {
    console.log("Signing out...");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error.message);
        Alert.alert("Sign out failed", error.message);
      } else {
        console.log("Sign out successful");
        router.replace("/");
      }
    } catch (e: any) {
      console.error("Sign out exception:", e);
    }
  };
  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: "#302020" },
        tabBarStyle: { backgroundColor: "#302020" },
        headerTitleStyle: { color: "white" },
        headerTintColor: "white",
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#888",
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 12 },
        headerRight: () => (
          <TouchableOpacity
            onPress={handleSignOut}
            style={{ padding: 10 }}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ size, color }) => {
            return <Ionicons name="home-outline" size={size} color={color} />;
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ size, color }) => {
            return <Ionicons name="person-outline" size={size} color={color} />;
          },
        }}
      />
    </Tabs>
  );
}
