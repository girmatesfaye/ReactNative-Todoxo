import { Platform, Alert, Button, View } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import supabase from "@/utils/supabase";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

export function AppleAuth() {
  const handleAppleOAuth = async () => {
    try {
      const redirectUrl = Linking.createURL("auth/callback");
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
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
    } catch (e: any) {
      Alert.alert("Apple Sign-in failed", e.message);
    }
  };

  if (Platform.OS === "ios")
    return (
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={
          AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE
        }
        cornerRadius={5}
        style={{ width: 220, height: 44 }}
        onPress={async () => {
          try {
            const credential = await AppleAuthentication.signInAsync({
              requestedScopes: [
                AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                AppleAuthentication.AppleAuthenticationScope.EMAIL,
              ],
            });
            // Sign in via Supabase Auth.
            if (credential.identityToken) {
              const {
                error,
                data: { user },
              } = await supabase.auth.signInWithIdToken({
                provider: "apple",
                token: credential.identityToken,
              });
              console.log(JSON.stringify({ error, user }, null, 2));
              if (!error) {
                // Apple only provides the user's full name on the first sign-in
                // Save it to user metadata if available
                if (credential.fullName) {
                  const nameParts = [];
                  if (credential.fullName.givenName)
                    nameParts.push(credential.fullName.givenName);
                  if (credential.fullName.middleName)
                    nameParts.push(credential.fullName.middleName);
                  if (credential.fullName.familyName)
                    nameParts.push(credential.fullName.familyName);

                  const fullName = nameParts.join(" ");

                  await supabase.auth.updateUser({
                    data: {
                      full_name: fullName,
                      given_name: credential.fullName.givenName,
                      family_name: credential.fullName.familyName,
                    },
                  });
                }
                // User is signed in.
              }
            } else {
              throw new Error("No identityToken.");
            }
          } catch (e: any) {
            if (e.code === "ERR_REQUEST_CANCELED") {
              // handle that the user canceled the sign-in flow
            } else {
              // handle other errors
            }
          }
        }}
      />
    );
  return (
    <>
      {/*
        On Android, Sign in with Apple is not natively supported.
        You have two options:
        1. Use the OAuth flow via signInWithOAuth (see Flutter Android example below)
        2. Use a web-based solution like react-native-app-auth

        For most cases, we recommend using the OAuth flow:
      */}
      <View style={{ marginVertical: 10, width: "60%" }}>
        <Button title="Sign in with Apple" onPress={handleAppleOAuth} />
      </View>
    </>
  );
}
