import { useEffect, useState } from "react";
import { Alert, View, Text, Button } from "react-native";
import supabase from "../utils/supabase";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

export function GoogleAuth() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [lib, setLib] = useState<any>(null);

  useEffect(() => {
    // Check if the native module is actually available in the binary
    // just requiring it might not be enough if it's auto-linked but the binary lacks it
    const checkNativeModule = () => {
      try {
        const { NativeModules } = require("react-native");
        if (!NativeModules.RNGoogleSignin) {
          throw new Error("RNGoogleSignin not found in NativeModules");
        }

        const GoogleSignInModule = require("@react-native-google-signin/google-signin");
        if (GoogleSignInModule && GoogleSignInModule.GoogleSignin) {
          GoogleSignInModule.GoogleSignin.configure({
            webClientId:
              "528907414432-vcigm7o23nlrpg172ck72tnff2hp2bvi.apps.googleusercontent.com",
          });
          setLib(GoogleSignInModule);
          setIsConfigured(true);
        }
      } catch (e) {
        console.warn(
          "Native Google Sign-In not available, using OAuth fallback.",
        );
        setLib(null);
        setIsConfigured(false);
      }
    };

    checkNativeModule();
  }, []);

  const handleGoogleOAuth = async () => {
    try {
      const redirectUrl = Linking.createURL("auth/callback");
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl,
        );

        if (result.type === "success" && result.url) {
          const { queryParams } = Linking.parse(result.url);
          const access_token = queryParams?.access_token as string;
          const refresh_token = queryParams?.refresh_token as string;

          if (access_token && refresh_token) {
            await supabase.auth.setSession({ access_token, refresh_token });
          }
        }
      }
    } catch (error: any) {
      Alert.alert("Google Sign-in failed", error.message);
    }
  };

  if (!lib || !isConfigured) {
    return (
      <View style={{ marginVertical: 10, width: "60%" }}>
        <Button
          title="Sign in with Google"
          onPress={handleGoogleOAuth}
          color="#4285F4"
        />
      </View>
    );
  }

  const { GoogleSignin, GoogleSigninButton, isSuccessResponse, statusCodes } =
    lib;

  return (
    <GoogleSigninButton
      size={GoogleSigninButton.Size.Standard}
      color={GoogleSigninButton.Color.Dark}
      onPress={async () => {
        try {
          await GoogleSignin.hasPlayServices();
          const response = await GoogleSignin.signIn();
          if (isSuccessResponse(response)) {
            const { data, error } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: response.data.idToken || "",
            });
            console.log(error, data);
          }
        } catch (error: any) {
          if (error.code === statusCodes.IN_PROGRESS) {
            // operation (e.g. sign in) is in progress already
          } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            // play services not available or outdated
          } else {
            // some other error happened
          }
        }
      }}
    />
  );
}
