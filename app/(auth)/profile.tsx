import { View, Text, Image, Button, StyleSheet, Alert } from "react-native";
import React from "react";
import * as imagePicker from "expo-image-picker";
import supabase from "@/utils/supabase";

export default function Page() {
  const [image, setImage] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    loadUserAvatar();
  }, []);

  const loadUserAvatar = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(`${user.id}/avatar.jpg`);

      if (data?.publicUrl) {
        // Only set the image if it actually exists or after a successful upload
        // We can check if it exists by doing a quick HEAD request or just trying to load it
        const checkRes = await fetch(data.publicUrl, { method: "HEAD" });
        if (checkRes.ok) {
          setImage(`${data.publicUrl}?t=${new Date().getTime()}`);
        }
      }
    } catch (error: any) {
      console.log("Error loading avatar:", error.message);
    }
  };

  const pickImage = async () => {
    try {
      const result = await imagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (result.canceled || !result.assets[0]) return;

      setLoading(true);
      const img = result.assets[0];
      setImage(img.uri);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert("Error", "User not found");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", {
        uri: img.uri,
        name: "avatar.jpg",
        type: img.mimeType || "image/jpeg",
      } as any);

      const filePath = `${user.id}/avatar.jpg`;
      const { error } = await supabase.storage
        .from("avatars")
        .upload(filePath, formData, {
          contentType: img.mimeType || "image/jpeg",
          upsert: true,
        });

      if (error) {
        Alert.alert("Error", "Could not upload image: " + error.message);
      } else {
        Alert.alert("Success", "Image uploaded successfully!");
        loadUserAvatar();
      }
    } catch (error: any) {
      Alert.alert("Error", "Could not pick image: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={
          image ? { uri: image } : { uri: "https://via.placeholder.com/150" }
        }
        style={styles.avatar}
      />
      <View style={{ width: "80%", gap: 10 }}>
        <Button title="Choose Photo" onPress={pickImage} color="#048433" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f8f8",
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: "#ddd",
  },
});
