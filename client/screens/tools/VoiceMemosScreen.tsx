import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { Audio, AVPlaybackStatus } from "expo-av";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Spacing, BorderRadius } from "@/constants/theme";

interface VoiceMemo {
  id: string;
  title: string;
  audio_url: string;
  storage_path: string | null;
  duration_seconds: number;
  created_at: string;
  user_id: string;
}

export default function VoiceMemosScreen() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const queryClient = useQueryClient();

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playingSound, setPlayingSound] = useState<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [showTitleInput, setShowTitleInput] = useState(false);
  const [memoTitle, setMemoTitle] = useState("");
  const [pendingAudioUri, setPendingAudioUri] = useState<string | null>(null);
  const [pendingDuration, setPendingDuration] = useState(0);

  const coupleId = profile?.couple_id;

  const { data: memos = [], isLoading } = useQuery({
    queryKey: ["voice-memos", coupleId],
    queryFn: async () => {
      if (!coupleId) return [];
      const { data, error } = await supabase
        .from("voice_memos")
        .select("*")
        .eq("couple_id", coupleId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as VoiceMemo[];
    },
    enabled: !!coupleId,
  });

  const createMemoMutation = useMutation({
    mutationFn: async ({
      title,
      audioUri,
      duration,
    }: {
      title: string;
      audioUri: string;
      duration: number;
    }) => {
      if (!coupleId || !profile) throw new Error("Not authenticated");

      const { data, error } = await supabase.from("voice_memos").insert({
        couple_id: coupleId,
        user_id: profile.id,
        title,
        audio_url: audioUri,
        duration_seconds: duration,
      }).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voice-memos", coupleId] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowTitleInput(false);
      setMemoTitle("");
      setPendingAudioUri(null);
      setPendingDuration(0);
    },
    onError: () => {
      Alert.alert("Error", "Failed to save voice memo");
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((d) => d + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (playingSound) {
        playingSound.unloadAsync();
      }
    };
  }, [playingSound]);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission Required", "Please allow access to the microphone");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error("Failed to start recording", error);
      Alert.alert("Error", "Failed to start recording");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (uri) {
        setPendingAudioUri(uri);
        setPendingDuration(recordingDuration);
        setShowTitleInput(true);
      }
    } catch (error) {
      console.error("Failed to stop recording", error);
    }

    setRecording(null);
  };

  const saveMemo = () => {
    if (!memoTitle.trim() || !pendingAudioUri) {
      Alert.alert("Error", "Please enter a title");
      return;
    }

    createMemoMutation.mutate({
      title: memoTitle.trim(),
      audioUri: pendingAudioUri,
      duration: pendingDuration,
    });
  };

  const cancelSave = () => {
    setShowTitleInput(false);
    setMemoTitle("");
    setPendingAudioUri(null);
    setPendingDuration(0);
  };

  const playMemo = async (memo: VoiceMemo) => {
    try {
      if (playingId === memo.id && playingSound) {
        await playingSound.stopAsync();
        await playingSound.unloadAsync();
        setPlayingSound(null);
        setPlayingId(null);
        return;
      }

      if (playingSound) {
        await playingSound.stopAsync();
        await playingSound.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: memo.audio_url },
        { shouldPlay: true }
      );

      setPlayingSound(sound);
      setPlayingId(memo.id);

      sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingSound(null);
          setPlayingId(null);
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error("Failed to play audio", error);
      Alert.alert("Error", "Failed to play audio");
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: headerHeight + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        <ThemedText type="h2" style={styles.title}>
          Voice Memos
        </ThemedText>
        <ThemedText type="small" style={styles.subtitle}>
          Record and share voice messages with your partner
        </ThemedText>

        <Card style={styles.recordCard}>
          {showTitleInput ? (
            <View>
              <ThemedText type="body" style={styles.label}>
                Name your recording
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.inputBackground, color: theme.text },
                ]}
                value={memoTitle}
                onChangeText={setMemoTitle}
                placeholder="My Voice Memo"
                placeholderTextColor={theme.textSecondary}
              />
              <View style={styles.buttonRow}>
                <Button onPress={cancelSave} style={styles.cancelButton}>
                  Cancel
                </Button>
                <Button
                  onPress={saveMemo}
                  disabled={createMemoMutation.isPending}
                >
                  {createMemoMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </View>
            </View>
          ) : isRecording ? (
            <View style={styles.recordingContainer}>
              <View style={styles.recordingIndicator}>
                <View style={[styles.recordingDot, { backgroundColor: theme.error }]} />
                <ThemedText type="h4" style={{ color: theme.error }}>
                  Recording...
                </ThemedText>
              </View>
              <ThemedText type="h2" style={styles.duration}>
                {formatDuration(recordingDuration)}
              </ThemedText>
              <Button onPress={stopRecording}>
                Stop Recording
              </Button>
            </View>
          ) : (
            <Button onPress={startRecording}>
              <View style={styles.recordButtonContent}>
                <Feather name="mic" size={20} color={theme.buttonText} />
                <ThemedText style={{ color: theme.buttonText, marginLeft: Spacing.sm }}>
                  Start Recording
                </ThemedText>
              </View>
            </Button>
          )}
        </Card>

        {memos.length > 0 ? (
          <View style={styles.memosSection}>
            <ThemedText type="h4" style={styles.sectionTitle}>
              Your Voice Memos
            </ThemedText>
            {memos.map((memo) => (
              <Card key={memo.id} style={styles.memoCard}>
                <View style={styles.memoHeader}>
                  <View style={styles.memoInfo}>
                    <ThemedText type="body" style={styles.memoTitle}>
                      {memo.title}
                    </ThemedText>
                    <ThemedText type="small" style={styles.memoDate}>
                      {new Date(memo.created_at).toLocaleDateString()}
                    </ThemedText>
                  </View>
                  <ThemedText type="body" style={{ color: theme.link }}>
                    {formatDuration(memo.duration_seconds)}
                  </ThemedText>
                </View>

                <Button
                  onPress={() => playMemo(memo)}
                  style={[
                    styles.playButton,
                    playingId === memo.id && { backgroundColor: theme.accent },
                  ]}
                >
                  <View style={styles.playButtonContent}>
                    <Feather
                      name={playingId === memo.id ? "pause" : "play"}
                      size={18}
                      color={theme.buttonText}
                    />
                    <ThemedText style={{ color: theme.buttonText, marginLeft: Spacing.sm }}>
                      {playingId === memo.id ? "Pause" : "Play"}
                    </ThemedText>
                  </View>
                </Button>
              </Card>
            ))}
          </View>
        ) : !isLoading ? (
          <Card style={styles.emptyCard}>
            <Feather name="mic-off" size={48} color={theme.textSecondary} />
            <ThemedText type="body" style={styles.emptyText}>
              No voice memos yet
            </ThemedText>
            <ThemedText type="small" style={styles.emptySubtext}>
              Record your first message to share with your partner
            </ThemedText>
          </Card>
        ) : null}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    opacity: 0.7,
    marginBottom: Spacing.xl,
  },
  recordCard: {
    marginBottom: Spacing.xl,
  },
  recordingContainer: {
    alignItems: "center",
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  duration: {
    marginBottom: Spacing.xl,
  },
  recordButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    marginBottom: Spacing.sm,
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    opacity: 0.7,
  },
  memosSection: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  memoCard: {
    marginBottom: Spacing.md,
  },
  memoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  memoInfo: {
    flex: 1,
  },
  memoTitle: {
    marginBottom: Spacing.xs,
  },
  memoDate: {
    opacity: 0.6,
  },
  playButton: {
    height: 44,
  },
  playButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  emptyText: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    opacity: 0.6,
    textAlign: "center",
  },
});
