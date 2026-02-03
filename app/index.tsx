import supabase from "@/utils/supabase";
import React from "react";
import { GoogleAuth } from "@/components/Google.native";
import { AppleAuth } from "@/components/Auth.native";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";

function Page() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const onSignInPress = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        Alert.alert("Error signing in ", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const onSignUpPress = async () => {
    setLoading(true);
    try {
      const {
        error,
        data: { session },
      } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        Alert.alert("Error signing up ", error.message);
      }
      if (!session) {
        Alert.alert("Session not found");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={{ color: "white", fontWeight: "bold" }}>Loading...</Text>
        </View>
      )}
      <Text style={styles.header}>TodoXo</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable
        style={[styles.button, { margin: 10 }]}
        onPress={onSignInPress}
      >
        <Text style={styles.buttonText}>Sign In</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={onSignUpPress}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </Pressable>

      <View style={styles.divider} />
      <AppleAuth />
      <GoogleAuth />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1d0c0c",
  },
  header: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "white",
    color: "black",
    width: "80%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "60%",
    marginTop: 20,
  },
  button: {
    backgroundColor: "#048433",
    padding: 10,
    borderRadius: 5,
    width: "80%",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    elevation: 1,
    gap: 10,
  },
  divider: {
    height: 1,
    width: "80%",
    backgroundColor: "#3b2a2a",
    marginVertical: 16,
  },
});

export default Page;
