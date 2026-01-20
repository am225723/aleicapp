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
import { createJournalEntry } from "@/services/journalService";

export default function AddJournalScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { profile } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (!title.trim() || !content.trim()) return;
    if (!profile?.couple_id) {
      setError("You must be part of a couple to save journal entries.");
      return;
    }

    setIsLoading(true);
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await createJournalEntry({
        couple_id: profile.couple_id,
        title: title.trim(),
        content: content.trim(),
        image_url: imageUri || undefined,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (err) {
      console.error("Error saving journal entry:", err);
      setError("Failed to save. Please try again.");
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
        <ThemedText type="h3">Journal Entry</ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: theme.textSecondary }]}
        >
          Record your thoughts and reflections
        </ThemedText>
      </View>

      {error ? (
        <View style={[styles.errorContainer, { backgroundColor: Colors.light.error + "20" }]}>
          <ThemedText type="small" style={{ color: Colors.light.error }}>
            {error}
          </ThemedText>
        </View>
      ) : null}

      <Input
        label="Title"
        placeholder="Give your entry a title..."
        value={title}
        onChangeText={setTitle}
      />

      <Input
        label="Your Thoughts"
        placeholder="Write about your feelings, experiences, or insights..."
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={6}
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
        disabled={!title.trim() || !content.trim() || isLoading}
        style={styles.saveButton}
      >
        {isLoading ? "Saving..." : "Save Entry"}
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
  errorContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  textArea: {
    height: 150,
    paddingTop: Spacing.md,
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
