import React, { useEffect, useState } from "react";
import { Slot, useRouter, useSegments, Redirect } from "expo-router";
import "react-native-reanimated";
import supabase from "@/utils/supabase";

export default function RootLayout() {
  const [session, setSession] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const segment = useSegments();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth Event:", event, "Session exists:", !!session);
      setSession(session?.access_token ?? null);
      setInitializing(false);
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  if (initializing) return null;

  const inAuthGroup = segment[0] === "(auth)";

  if (session && !inAuthGroup) {
    return <Redirect href="/(auth)" />;
  } else if (!session && inAuthGroup) {
    return <Redirect href="/" />;
  }

  return <Slot />;
}
