import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { BorderRadius } from "@/constants/theme";

interface AvatarUploadProps {
  size?: number;
  onPress?: () => void;
  editable?: boolean;
}

const AvatarColors = {
  background: "rgba(201, 169, 98, 0.2)",
  border: "rgba(201, 169, 98, 0.5)",
  icon: "#C9A962",
  editBadge: "#C9A962",
};

export function AvatarUpload({ size = 56, onPress, editable = false }: AvatarUploadProps) {
  const { profile } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (profile?.avatar_url) {
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile?.avatar_url]);

  const handlePress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (editable) {
      await pickAndUploadImage();
    } else if (onPress) {
      onPress();
    }
  };

  const pickAndUploadImage = async () => {
    if (Platform.OS === "web") {
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    if (!profile?.id) return;

    setIsUploading(true);
    try {
      const filename = `avatar-${profile.id}-${Date.now()}.jpg`;
      const response = await fetch(uri);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(filename, blob, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filename);

      const publicUrl = urlData.publicUrl;

      await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", profile.id);

      setAvatarUrl(publicUrl);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error uploading avatar:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Pressable
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
      onPress={handlePress}
    >
      {isUploading ? (
        <ActivityIndicator size="small" color={AvatarColors.icon} />
      ) : avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={[
            styles.image,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
          contentFit="cover"
        />
      ) : (
        <Feather name="user" size={size * 0.5} color={AvatarColors.icon} />
      )}

      {editable && !isUploading ? (
        <View style={styles.editBadge}>
          <Feather name="camera" size={12} color="#FFFFFF" />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: AvatarColors.background,
    borderWidth: 2,
    borderColor: AvatarColors.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: AvatarColors.editBadge,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#0D0D0F",
  },
});
