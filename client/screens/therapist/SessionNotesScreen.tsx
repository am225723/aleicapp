import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Text,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { RouteProp, useRoute } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

type SessionNotesParams = {
  SessionNotes: { coupleId: string; mode?: string };
};

interface SessionNote {
  id: string;
  therapist_id: string;
  couple_id: string;
  session_date: string;
  title: string;
  content: string;
  session_type: string;
  mood_assessment: string | null;
  homework_assigned: string | null;
  follow_up_items: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

const SESSION_TYPES = ["couples", "individual-p1", "individual-p2", "crisis"];

const TAG_COLORS = [
  "#8B9DC3",
  "#E8A59C",
  "#81C995",
  "#F6C177",
  "#B8A9C9",
  "#7EC8E3",
  "#E8B4B8",
  "#A8D8B9",
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function SessionNotesScreen() {
  const route = useRoute<RouteProp<SessionNotesParams, "SessionNotes">>();
  const { coupleId } = route.params;
  const { profile } = useAuth();
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const [mode, setMode] = useState<"list" | "edit">(
    route.params.mode === "edit" ? "edit" : "list"
  );
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const [editingNote, setEditingNote] = useState<SessionNote | null>(null);
  const [title, setTitle] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionType, setSessionType] = useState("couples");
  const [content, setContent] = useState("");
  const [moodAssessment, setMoodAssessment] = useState("");
  const [homeworkAssigned, setHomeworkAssigned] = useState("");
  const [followUpItems, setFollowUpItems] = useState("");
  const [tagsText, setTagsText] = useState("");

  const fetchNotes = useCallback(async () => {
    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("therapist_session_notes")
        .select("*")
        .eq("couple_id", coupleId)
        .order("session_date", { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        return;
      }
      setNotes(data || []);
    } catch (e: any) {
      setError(e.message || "Failed to load notes");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [coupleId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotes();
  }, [fetchNotes]);

  const resetForm = () => {
    setEditingNote(null);
    setTitle("");
    setSessionDate(new Date().toISOString().split("T")[0]);
    setSessionType("couples");
    setContent("");
    setMoodAssessment("");
    setHomeworkAssigned("");
    setFollowUpItems("");
    setTagsText("");
  };

  const openNewNote = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    resetForm();
    setMode("edit");
  };

  const openEditNote = (note: SessionNote) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingNote(note);
    setTitle(note.title || "");
    setSessionDate(
      note.session_date
        ? new Date(note.session_date).toISOString().split("T")[0]
        : ""
    );
    setSessionType(note.session_type || "couples");
    setContent(note.content || "");
    setMoodAssessment(note.mood_assessment || "");
    setHomeworkAssigned(note.homework_assigned || "");
    setFollowUpItems(note.follow_up_items || "");
    setTagsText(note.tags ? note.tags.join(", ") : "");
    setMode("edit");
  };

  const goBackToList = () => {
    setMode("list");
    resetForm();
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setError(null);

    const parsedTags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const noteData = {
      therapist_id: profile.id,
      couple_id: coupleId,
      session_date: sessionDate
        ? new Date(sessionDate).toISOString()
        : new Date().toISOString(),
      title,
      content,
      session_type: sessionType,
      mood_assessment: moodAssessment || null,
      homework_assigned: homeworkAssigned || null,
      follow_up_items: followUpItems || null,
      tags: parsedTags.length > 0 ? parsedTags : null,
    };

    try {
      if (editingNote) {
        const { error: updateError } = await supabase
          .from("therapist_session_notes")
          .update({ ...noteData, updated_at: new Date().toISOString() })
          .eq("id", editingNote.id);

        if (updateError) {
          setError(updateError.message);
          setSaving(false);
          return;
        }
      } else {
        const { error: insertError } = await supabase
          .from("therapist_session_notes")
          .insert(noteData);

        if (insertError) {
          setError(insertError.message);
          setSaving(false);
          return;
        }
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      goBackToList();
      fetchNotes();
    } catch (e: any) {
      setError(e.message || "Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingNote) return;
    setDeleteModalVisible(false);
    setSaving(true);

    try {
      const { error: deleteError } = await supabase
        .from("therapist_session_notes")
        .delete()
        .eq("id", editingNote.id);

      if (deleteError) {
        setError(deleteError.message);
        setSaving(false);
        return;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      goBackToList();
      fetchNotes();
    } catch (e: any) {
      setError(e.message || "Failed to delete note");
    } finally {
      setSaving(false);
    }
  };

  const getSessionTypeBadgeColor = (type: string): string => {
    switch (type) {
      case "couples":
        return "#8B9DC3";
      case "individual-p1":
        return "#81C995";
      case "individual-p2":
        return "#F6C177";
      case "crisis":
        return "#E88B8B";
      default:
        return "#8B9DC3";
    }
  };

  const renderNoteCard = ({ item }: { item: SessionNote }) => (
    <Card
      elevation={1}
      style={styles.noteCard}
      onPress={() => openEditNote(item)}
    >
      <View style={styles.cardHeader}>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {formatDate(item.session_date)}
        </ThemedText>
        <View
          style={[
            styles.typeBadge,
            { backgroundColor: getSessionTypeBadgeColor(item.session_type) },
          ]}
        >
          <Text style={styles.typeBadgeText}>{item.session_type}</Text>
        </View>
      </View>

      <ThemedText type="h4" style={styles.noteTitle}>
        {item.title}
      </ThemedText>

      {item.content ? (
        <ThemedText
          type="body"
          numberOfLines={3}
          style={{ color: theme.textSecondary, marginBottom: Spacing.sm }}
        >
          {item.content}
        </ThemedText>
      ) : null}

      {item.tags && item.tags.length > 0 ? (
        <View style={styles.tagsRow}>
          {item.tags.map((tag, index) => (
            <View
              key={`${tag}-${index}`}
              style={[
                styles.tagBadge,
                {
                  backgroundColor:
                    TAG_COLORS[index % TAG_COLORS.length] + "30",
                },
              ]}
            >
              <Text
                style={[
                  styles.tagBadgeText,
                  { color: TAG_COLORS[index % TAG_COLORS.length] },
                ]}
              >
                {tag}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {item.homework_assigned ? (
        <View style={styles.sectionBlock}>
          <View style={styles.sectionLabelRow}>
            <Feather
              name="book-open"
              size={14}
              color={theme.textSecondary}
            />
            <ThemedText
              type="small"
              style={[styles.sectionLabel, { color: theme.textSecondary }]}
            >
              Homework
            </ThemedText>
          </View>
          <ThemedText type="small" numberOfLines={2}>
            {item.homework_assigned}
          </ThemedText>
        </View>
      ) : null}

      {item.follow_up_items ? (
        <View style={styles.sectionBlock}>
          <View style={styles.sectionLabelRow}>
            <Feather
              name="check-square"
              size={14}
              color={theme.textSecondary}
            />
            <ThemedText
              type="small"
              style={[styles.sectionLabel, { color: theme.textSecondary }]}
            >
              Follow-up
            </ThemedText>
          </View>
          <ThemedText type="small" numberOfLines={2}>
            {item.follow_up_items}
          </ThemedText>
        </View>
      ) : null}
    </Card>
  );

  const renderListMode = () => (
    <View style={styles.flex}>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.link} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Feather name="alert-circle" size={48} color={theme.error} />
          <ThemedText
            type="body"
            style={[styles.errorText, { color: theme.error }]}
          >
            {error}
          </ThemedText>
          <Pressable
            onPress={() => {
              setLoading(true);
              fetchNotes();
            }}
            style={[styles.retryButton, { backgroundColor: theme.link }]}
            testID="button-retry"
          >
            <ThemedText type="body" style={{ color: "#FFFFFF" }}>
              Retry
            </ThemedText>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={renderNoteCard}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingTop: headerHeight + Spacing.md,
              paddingBottom: insets.bottom + Spacing.xl + 80,
            },
          ]}
          scrollIndicatorInsets={{ bottom: insets.bottom }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.link}
              progressViewOffset={headerHeight}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather
                name="file-text"
                size={64}
                color={theme.textSecondary}
              />
              <ThemedText
                type="h3"
                style={[styles.emptyTitle, { color: theme.textSecondary }]}
              >
                No Session Notes
              </ThemedText>
              <ThemedText
                type="body"
                style={{ color: theme.textSecondary, textAlign: "center" }}
              >
                Tap the + button to create your first session note for this
                couple.
              </ThemedText>
            </View>
          }
          testID="list-session-notes"
        />
      )}

      <Pressable
        onPress={openNewNote}
        style={[
          styles.fab,
          {
            backgroundColor: theme.link,
            bottom: insets.bottom + Spacing.xl,
          },
        ]}
        testID="button-add-note"
      >
        <Feather name="plus" size={28} color="#FFFFFF" />
      </Pressable>
    </View>
  );

  const renderEditMode = () => (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        styles.editContent,
        {
          paddingTop: headerHeight + Spacing.md,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable
        onPress={goBackToList}
        style={styles.backButton}
        testID="button-back-to-list"
      >
        <Feather name="arrow-left" size={20} color={theme.link} />
        <ThemedText type="body" style={{ color: theme.link, marginLeft: Spacing.xs }}>
          Back to Notes
        </ThemedText>
      </Pressable>

      <ThemedText type="h2" style={styles.editHeading}>
        {editingNote ? "Edit Session Note" : "New Session Note"}
      </ThemedText>

      {error ? (
        <View
          style={[
            styles.errorBanner,
            { backgroundColor: theme.error + "20" },
          ]}
        >
          <Feather name="alert-circle" size={16} color={theme.error} />
          <ThemedText
            type="small"
            style={{ color: theme.error, marginLeft: Spacing.sm, flex: 1 }}
          >
            {error}
          </ThemedText>
        </View>
      ) : null}

      <ThemedText type="small" style={[styles.fieldLabel, { color: theme.textSecondary }]}>
        Title
      </ThemedText>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Session title"
        placeholderTextColor={theme.textSecondary}
        style={[
          styles.input,
          {
            backgroundColor: theme.inputBackground,
            color: theme.text,
            borderColor: theme.border,
          },
        ]}
        testID="input-title"
      />

      <ThemedText type="small" style={[styles.fieldLabel, { color: theme.textSecondary }]}>
        Session Date (YYYY-MM-DD)
      </ThemedText>
      <TextInput
        value={sessionDate}
        onChangeText={setSessionDate}
        placeholder="2026-02-12"
        placeholderTextColor={theme.textSecondary}
        style={[
          styles.input,
          {
            backgroundColor: theme.inputBackground,
            color: theme.text,
            borderColor: theme.border,
          },
        ]}
        testID="input-session-date"
      />

      <ThemedText type="small" style={[styles.fieldLabel, { color: theme.textSecondary }]}>
        Session Type
      </ThemedText>
      <View style={styles.typePickerRow}>
        {SESSION_TYPES.map((type) => (
          <Pressable
            key={type}
            onPress={() => {
              Haptics.selectionAsync();
              setSessionType(type);
            }}
            style={[
              styles.typePickerButton,
              {
                backgroundColor:
                  sessionType === type
                    ? getSessionTypeBadgeColor(type)
                    : theme.backgroundSecondary,
                borderColor:
                  sessionType === type
                    ? getSessionTypeBadgeColor(type)
                    : theme.border,
              },
            ]}
            testID={`button-type-${type}`}
          >
            <Text
              style={[
                styles.typePickerText,
                {
                  color: sessionType === type ? "#FFFFFF" : theme.text,
                },
              ]}
            >
              {type}
            </Text>
          </Pressable>
        ))}
      </View>

      <ThemedText type="small" style={[styles.fieldLabel, { color: theme.textSecondary }]}>
        Content
      </ThemedText>
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder="Session notes content..."
        placeholderTextColor={theme.textSecondary}
        multiline
        style={[
          styles.input,
          styles.multilineInput,
          {
            backgroundColor: theme.inputBackground,
            color: theme.text,
            borderColor: theme.border,
          },
        ]}
        textAlignVertical="top"
        testID="input-content"
      />

      <ThemedText type="small" style={[styles.fieldLabel, { color: theme.textSecondary }]}>
        Mood Assessment
      </ThemedText>
      <TextInput
        value={moodAssessment}
        onChangeText={setMoodAssessment}
        placeholder="Overall mood assessment"
        placeholderTextColor={theme.textSecondary}
        style={[
          styles.input,
          {
            backgroundColor: theme.inputBackground,
            color: theme.text,
            borderColor: theme.border,
          },
        ]}
        testID="input-mood"
      />

      <ThemedText type="small" style={[styles.fieldLabel, { color: theme.textSecondary }]}>
        Homework Assigned
      </ThemedText>
      <TextInput
        value={homeworkAssigned}
        onChangeText={setHomeworkAssigned}
        placeholder="Homework for the couple..."
        placeholderTextColor={theme.textSecondary}
        multiline
        style={[
          styles.input,
          styles.smallMultilineInput,
          {
            backgroundColor: theme.inputBackground,
            color: theme.text,
            borderColor: theme.border,
          },
        ]}
        textAlignVertical="top"
        testID="input-homework"
      />

      <ThemedText type="small" style={[styles.fieldLabel, { color: theme.textSecondary }]}>
        Follow-up Items
      </ThemedText>
      <TextInput
        value={followUpItems}
        onChangeText={setFollowUpItems}
        placeholder="Items to follow up on..."
        placeholderTextColor={theme.textSecondary}
        multiline
        style={[
          styles.input,
          styles.smallMultilineInput,
          {
            backgroundColor: theme.inputBackground,
            color: theme.text,
            borderColor: theme.border,
          },
        ]}
        textAlignVertical="top"
        testID="input-follow-up"
      />

      <ThemedText type="small" style={[styles.fieldLabel, { color: theme.textSecondary }]}>
        Tags (comma-separated)
      </ThemedText>
      <TextInput
        value={tagsText}
        onChangeText={setTagsText}
        placeholder="anxiety, communication, progress"
        placeholderTextColor={theme.textSecondary}
        style={[
          styles.input,
          {
            backgroundColor: theme.inputBackground,
            color: theme.text,
            borderColor: theme.border,
          },
        ]}
        testID="input-tags"
      />

      <Pressable
        onPress={handleSave}
        disabled={saving}
        style={[
          styles.saveButton,
          {
            backgroundColor: theme.link,
            opacity: saving ? 0.6 : 1,
          },
        ]}
        testID="button-save-note"
      >
        {saving ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <View style={styles.buttonContent}>
            <Feather name="save" size={18} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>
              {editingNote ? "Update Note" : "Save Note"}
            </Text>
          </View>
        )}
      </Pressable>

      {editingNote ? (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setDeleteModalVisible(true);
          }}
          style={[styles.deleteButton, { borderColor: theme.error }]}
          testID="button-delete-note"
        >
          <View style={styles.buttonContent}>
            <Feather name="trash-2" size={18} color={theme.error} />
            <Text style={[styles.deleteButtonText, { color: theme.error }]}>
              Delete Note
            </Text>
          </View>
        </Pressable>
      ) : null}
    </ScrollView>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
    >
      {mode === "list" ? renderListMode() : renderEditMode()}

      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <ThemedText type="h3" style={styles.modalTitle}>
              Delete Session Note
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.modalMessage, { color: theme.textSecondary }]}
            >
              Are you sure you want to delete this session note? This action
              cannot be undone.
            </ThemedText>
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setDeleteModalVisible(false)}
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
                testID="button-cancel-delete"
              >
                <Text style={[styles.modalButtonText, { color: theme.text }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleDelete}
                style={[styles.modalButton, { backgroundColor: theme.error }]}
                testID="button-confirm-delete"
              >
                <Text style={[styles.modalButtonText, { color: "#FFFFFF" }]}>
                  Delete
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  noteCard: {
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  noteTitle: {
    marginBottom: Spacing.sm,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  tagBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  tagBadgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  sectionBlock: {
    marginTop: Spacing.sm,
  },
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  sectionLabel: {
    marginLeft: Spacing.xs,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  errorText: {
    marginTop: Spacing.md,
    textAlign: "center",
  },
  retryButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  fab: {
    position: "absolute",
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  editContent: {
    paddingHorizontal: Spacing.lg,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  editHeading: {
    marginBottom: Spacing.xl,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    marginBottom: Spacing.xs,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 16,
    marginBottom: Spacing.lg,
  },
  multilineInput: {
    minHeight: 160,
  },
  smallMultilineInput: {
    minHeight: 100,
  },
  typePickerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  typePickerButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
  },
  typePickerText: {
    fontSize: 14,
    fontWeight: "500",
  },
  saveButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
    height: Spacing.buttonHeight,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: Spacing.sm,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
    borderWidth: 1,
    height: Spacing.buttonHeight,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  modalContainer: {
    width: "100%",
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
  },
  modalTitle: {
    marginBottom: Spacing.md,
  },
  modalMessage: {
    marginBottom: Spacing.xl,
  },
  modalActions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
