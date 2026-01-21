import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  Text,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import Slider from "@react-native-community/slider";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

type InputMode = "express" | "structured";

interface SavedSession {
  id: string;
  title: string | null;
  input_mode: string;
  feeling: string | null;
  situation: string | null;
  because: string | null;
  request: string | null;
  free_text: string | null;
  firmness: number;
  enhanced_statement: string | null;
  impact_preview: string | null;
  ai_suggestions: any[] | null;
  created_at: string;
}

interface Suggestion {
  title: string;
  content: string;
  category: string;
}

export default function ConflictResolutionScreen() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const [inputMode, setInputMode] = useState<InputMode>("express");
  const [freeText, setFreeText] = useState("");
  const [feeling, setFeeling] = useState("");
  const [situation, setSituation] = useState("");
  const [because, setBecause] = useState("");
  const [request, setRequest] = useState("");
  const [firmness, setFirmness] = useState(30);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [enhancedStatement, setEnhancedStatement] = useState("");
  const [impactPreview, setImpactPreview] = useState("");
  const [toneDescription, setToneDescription] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [sessionTitle, setSessionTitle] = useState("");

  const getToneLabel = (value: number) => {
    if (value <= 33) return "Gentle";
    if (value <= 66) return "Balanced";
    return "Assertive";
  };

  const isValidInput = () => {
    if (inputMode === "express") {
      return freeText.trim().length >= 10;
    }
    return feeling.trim().length > 0 && situation.trim().length > 0;
  };

  const loadSessions = async () => {
    if (!profile?.id) return;

    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from("Couples_conflict_sessions")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setSavedSessions(data || []);
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [profile?.id]);

  const handleGenerate = async () => {
    if (!isValidInput()) {
      Alert.alert(
        "Missing Input",
        inputMode === "express"
          ? "Please enter at least 10 characters."
          : "Please fill in at least your feeling and the situation."
      );
      return;
    }

    setIsGenerating(true);
    setEnhancedStatement("");
    setImpactPreview("");
    setToneDescription("");
    setSuggestions([]);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error("Not authenticated");
      }

      const payload = {
        mode: inputMode,
        firmness,
        feeling: inputMode === "structured" ? feeling : "",
        situation: inputMode === "structured" ? situation : "",
        because: inputMode === "structured" ? because : "",
        request: inputMode === "structured" ? request : "",
        free_text: inputMode === "express" ? freeText : undefined,
      };

      const { data, error } = await supabase.functions.invoke(
        "conflict-generate-statement",
        { body: payload }
      );

      if (error) throw error;

      setEnhancedStatement(data.enhanced_statement || "");
      setImpactPreview(data.impact_preview || "");
      setToneDescription(data.tone_description || "");

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (data.enhanced_statement) {
        try {
          const { data: suggestionsData } = await supabase.functions.invoke(
            "conflict-generate-suggestions",
            {
              body: {
                ...payload,
                enhanced_statement: data.enhanced_statement,
              },
            }
          );
          setSuggestions(suggestionsData?.suggestions || []);
        } catch (suggestError) {
          console.error("Suggestions error:", suggestError);
        }
      }
    } catch (error: any) {
      console.error("Generate error:", error);
      Alert.alert("Error", error.message || "Failed to generate statement");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (enhancedStatement) {
      await Clipboard.setStringAsync(enhancedStatement);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Copied", "Statement copied to clipboard");
    }
  };

  const handleSave = async () => {
    if (!profile?.id) {
      Alert.alert("Error", "Please log in to save");
      return;
    }

    if (!profile?.couple_id) {
      Alert.alert(
        "Partner Required",
        "Please link with your partner before saving conflict sessions. You can do this in Settings > Couple Setup."
      );
      return;
    }

    if (!enhancedStatement) {
      Alert.alert("Error", "Generate a statement first");
      return;
    }

    setIsSaving(true);
    try {
      const autoTitle =
        sessionTitle.trim() ||
        enhancedStatement.split(" ").slice(0, 6).join(" ") + "...";

      const { error } = await supabase.from("Couples_conflict_sessions").insert({
        user_id: profile.id,
        couple_id: profile.couple_id,
        input_mode: inputMode,
        free_text: inputMode === "express" ? freeText : null,
        feeling: inputMode === "structured" ? feeling : null,
        situation: inputMode === "structured" ? situation : null,
        because: inputMode === "structured" ? because : null,
        request: inputMode === "structured" ? request : null,
        firmness,
        enhanced_statement: enhancedStatement,
        impact_preview: impactPreview,
        ai_suggestions: suggestions,
        title: autoTitle,
      });

      if (error) throw error;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Saved", "Your I-statement has been saved");
      setSessionTitle("");
      loadSessions();
    } catch (error: any) {
      console.error("Save error:", error);
      Alert.alert("Error", error.message || "Failed to save session");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSession = (sessionId: string) => {
    setExpandedSessionId(expandedSessionId === sessionId ? null : sessionId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={[styles.headerIcon, { backgroundColor: theme.link }]}>
            <Feather name="message-circle" size={24} color="#fff" />
          </View>
          <ThemedText type="h2" style={styles.title}>
            I-Statement Generator
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.subtitle, { color: theme.textSecondary }]}
          >
            Transform your thoughts into constructive communication
          </ThemedText>
        </View>

        <View style={styles.modeSelector}>
          <Pressable
            style={[
              styles.modeButton,
              inputMode === "express" && [
                styles.modeButtonActive,
                { backgroundColor: theme.link },
              ],
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setInputMode("express");
            }}
          >
            <Feather
              name="edit-3"
              size={16}
              color={inputMode === "express" ? "#fff" : theme.textSecondary}
            />
            <ThemedText
              style={[
                styles.modeButtonText,
                inputMode === "express" && styles.modeButtonTextActive,
              ]}
            >
              Express Freely
            </ThemedText>
          </Pressable>
          <Pressable
            style={[
              styles.modeButton,
              inputMode === "structured" && [
                styles.modeButtonActive,
                { backgroundColor: theme.link },
              ],
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setInputMode("structured");
            }}
          >
            <Feather
              name="list"
              size={16}
              color={inputMode === "structured" ? "#fff" : theme.textSecondary}
            />
            <ThemedText
              style={[
                styles.modeButtonText,
                inputMode === "structured" && styles.modeButtonTextActive,
              ]}
            >
              Structured
            </ThemedText>
          </Pressable>
        </View>

        <Card style={styles.inputCard}>
          {inputMode === "express" ? (
            <>
              <ThemedText type="small" style={styles.inputLabel}>
                Express what you want to say
              </ThemedText>
              <TextInput
                style={[
                  styles.textArea,
                  { color: theme.text, borderColor: theme.border },
                ]}
                placeholder="Let it all out - say what you really feel, even if it's messy or harsh. I'll help transform it into a healthy I-statement..."
                placeholderTextColor={theme.textSecondary}
                value={freeText}
                onChangeText={setFreeText}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              <ThemedText
                type="small"
                style={{ color: theme.textSecondary, marginTop: 4 }}
              >
                {freeText.length}/10 characters minimum
              </ThemedText>
            </>
          ) : (
            <>
              <View style={styles.structuredField}>
                <ThemedText type="small" style={styles.inputLabel}>
                  I feel... (emotion)
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    { color: theme.text, borderColor: theme.border },
                  ]}
                  placeholder="frustrated, hurt, anxious..."
                  placeholderTextColor={theme.textSecondary}
                  value={feeling}
                  onChangeText={setFeeling}
                />
              </View>

              <View style={styles.structuredField}>
                <ThemedText type="small" style={styles.inputLabel}>
                  When... (situation)
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    { color: theme.text, borderColor: theme.border },
                  ]}
                  placeholder="you come home late without texting..."
                  placeholderTextColor={theme.textSecondary}
                  value={situation}
                  onChangeText={setSituation}
                />
              </View>

              <View style={styles.structuredField}>
                <ThemedText type="small" style={styles.inputLabel}>
                  Because... (impact)
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    { color: theme.text, borderColor: theme.border },
                  ]}
                  placeholder="I worry about your safety..."
                  placeholderTextColor={theme.textSecondary}
                  value={because}
                  onChangeText={setBecause}
                />
              </View>

              <View style={styles.structuredField}>
                <ThemedText type="small" style={styles.inputLabel}>
                  Could we... (request)
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    { color: theme.text, borderColor: theme.border },
                  ]}
                  placeholder="agree to send a quick text..."
                  placeholderTextColor={theme.textSecondary}
                  value={request}
                  onChangeText={setRequest}
                />
              </View>
            </>
          )}
        </Card>

        <Card style={styles.sliderCard}>
          <View style={styles.sliderHeader}>
            <ThemedText type="small">Tone: {getToneLabel(firmness)}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {firmness}%
            </ThemedText>
          </View>
          <View style={styles.sliderLabels}>
            <ThemedText
              type="small"
              style={{ color: theme.textSecondary }}
            >
              Gentle
            </ThemedText>
            <ThemedText
              type="small"
              style={{ color: theme.textSecondary }}
            >
              Assertive
            </ThemedText>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            step={1}
            value={firmness}
            onValueChange={setFirmness}
            minimumTrackTintColor={theme.link}
            maximumTrackTintColor={theme.border}
            thumbTintColor={theme.link}
          />
        </Card>

        <Button
          onPress={handleGenerate}
          disabled={isGenerating || !isValidInput()}
          style={styles.generateButton}
        >
          {isGenerating ? "Generating..." : "Generate I-Statement"}
        </Button>

        {enhancedStatement ? (
          <Card style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Feather name="check-circle" size={20} color={theme.link} />
              <ThemedText type="h4" style={{ marginLeft: Spacing.sm }}>
                Your I-Statement
              </ThemedText>
            </View>

            <ThemedText style={styles.statement}>{enhancedStatement}</ThemedText>

            {impactPreview ? (
              <View style={styles.impactSection}>
                <ThemedText
                  type="small"
                  style={{ color: theme.textSecondary }}
                >
                  Impact Preview
                </ThemedText>
                <ThemedText type="body" style={{ marginTop: 4 }}>
                  {impactPreview}
                </ThemedText>
              </View>
            ) : null}

            {toneDescription ? (
              <View style={styles.toneSection}>
                <ThemedText
                  type="small"
                  style={{ color: theme.textSecondary }}
                >
                  Tone: {toneDescription}
                </ThemedText>
              </View>
            ) : null}

            <View style={styles.actionButtons}>
              <Pressable style={styles.actionButton} onPress={handleCopy}>
                <Feather name="copy" size={18} color={theme.link} />
                <ThemedText style={[styles.actionButtonText, { color: theme.link }]}>
                  Copy
                </ThemedText>
              </Pressable>
            </View>

            {suggestions.length > 0 ? (
              <View style={styles.suggestionsSection}>
                <ThemedText type="small" style={{ marginBottom: Spacing.sm }}>
                  Suggestions
                </ThemedText>
                {suggestions.map((suggestion, index) => (
                  <View key={index} style={styles.suggestionItem}>
                    <ThemedText type="small" style={{ color: theme.link }}>
                      {suggestion.title}
                    </ThemedText>
                    <ThemedText type="body" style={{ marginTop: 2 }}>
                      {suggestion.content}
                    </ThemedText>
                  </View>
                ))}
              </View>
            ) : null}

            <View style={styles.saveSection}>
              <TextInput
                style={[
                  styles.input,
                  { color: theme.text, borderColor: theme.border },
                ]}
                placeholder="Session title (optional)"
                placeholderTextColor={theme.textSecondary}
                value={sessionTitle}
                onChangeText={setSessionTitle}
              />
              <Button
                onPress={handleSave}
                disabled={isSaving}
                style={{ marginTop: Spacing.sm }}
              >
                {isSaving ? "Saving..." : "Save Session"}
              </Button>
            </View>
          </Card>
        ) : null}

        <View style={styles.historySection}>
          <ThemedText type="h4" style={styles.historyTitle}>
            Your Saved Sessions
          </ThemedText>

          {isLoadingHistory ? (
            <ActivityIndicator color={theme.link} style={{ marginTop: Spacing.lg }} />
          ) : savedSessions.length === 0 ? (
            <ThemedText
              type="body"
              style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.lg }}
            >
              No saved sessions yet. Generate and save an I-statement to see it here.
            </ThemedText>
          ) : (
            savedSessions.map((session) => (
              <Pressable
                key={session.id}
                onPress={() => toggleSession(session.id)}
                style={({ pressed }) => [
                  styles.sessionCard,
                  { backgroundColor: pressed ? Colors.dark.backgroundSecondary : Colors.dark.backgroundDefault },
                ]}
              >
                <View style={styles.sessionHeader}>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="small" numberOfLines={1}>
                      {session.title || "Untitled"}
                    </ThemedText>
                    <ThemedText
                      type="small"
                      style={{ color: theme.textSecondary }}
                    >
                      {formatDate(session.created_at)}
                    </ThemedText>
                  </View>
                  <Feather
                    name={expandedSessionId === session.id ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={theme.textSecondary}
                  />
                </View>

                {expandedSessionId === session.id ? (
                  <View style={styles.sessionContent}>
                    <ThemedText type="body" style={{ marginTop: Spacing.sm }}>
                      {session.enhanced_statement}
                    </ThemedText>
                    {session.impact_preview ? (
                      <ThemedText
                        type="small"
                        style={{ color: theme.textSecondary, marginTop: Spacing.sm }}
                      >
                        Impact: {session.impact_preview}
                      </ThemedText>
                    ) : null}
                  </View>
                ) : null}
              </Pressable>
            ))
          )}
        </View>
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
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  title: {
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginTop: Spacing.xs,
  },
  modeSelector: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  modeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: "rgba(255,255,255,0.05)",
    gap: Spacing.xs,
  },
  modeButtonActive: {
    backgroundColor: undefined,
  },
  modeButtonText: {
    fontSize: 14,
  },
  modeButtonTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  inputCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  inputLabel: {
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    minHeight: 120,
  },
  structuredField: {
    marginBottom: Spacing.md,
  },
  sliderCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  generateButton: {
    marginBottom: Spacing.lg,
  },
  resultCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  statement: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: "italic",
  },
  impactSection: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  toneSection: {
    marginTop: Spacing.sm,
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  suggestionsSection: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  suggestionItem: {
    marginBottom: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: BorderRadius.sm,
  },
  saveSection: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  historySection: {
    marginTop: Spacing.lg,
  },
  historyTitle: {
    marginBottom: Spacing.md,
  },
  sessionCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  sessionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  sessionContent: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
});
