import React, { useState } from "react";
import { StyleSheet, View, Image, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { addGratitudeEntry } from "@/lib/storage";

export default function AddGratitudeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { profile } = useAuth();

  const [content, setContent] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) return;

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await addGratitudeEntry({
        coupleId: profile?.couple_id || "couple-1",
        content: content.trim(),
        imageUri: imageUri || undefined,
        authorId: profile?.id || "user-1",
        authorName: profile?.full_name || "You",
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing["2xl"],
        },
      ]}
    >
      <View style={styles.header}>
        <ThemedText type="h3">What are you grateful for?</ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: theme.textSecondary }]}
        >
          Share something you appreciate about your partner or relationship
        </ThemedText>
      </View>

      <Input
        placeholder="I'm grateful for..."
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={4}
        style={styles.textArea}
        textAlignVertical="top"
      />

      {imageUri ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <Pressable
            style={styles.removeImage}
            onPress={() => setImageUri(null)}
          >
            <Feather name="x" size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={[styles.addImageButton, { borderColor: theme.border }]}
          onPress={handlePickImage}
        >
          <Feather name="image" size={24} color={theme.textSecondary} />
          <ThemedText
            type="body"
            style={[styles.addImageText, { color: theme.textSecondary }]}
          >
            Add a photo
          </ThemedText>
        </Pressable>
      )}

      <Button
        onPress={handleSave}
        disabled={!content.trim() || isLoading}
        style={styles.saveButton}
      >
        {isLoading ? "Saving..." : "Save Gratitude"}
      </Button>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  subtitle: {
    marginTop: Spacing.sm,
  },
  textArea: {
    height: 120,
    paddingTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  imageContainer: {
    position: "relative",
    marginBottom: Spacing.xl,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: BorderRadius.md,
  },
  removeImage: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  addImageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 80,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderStyle: "dashed",
    marginBottom: Spacing.xl,
  },
  addImageText: {
    marginLeft: Spacing.sm,
  },
  saveButton: {
    marginTop: "auto",
  },
});
