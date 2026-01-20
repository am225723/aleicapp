import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import {
  listCalendarEvents,
  createCalendarEvent,
  CalendarEvent,
} from "@/services/calendarService";

export default function CalendarScreen() {
  const { profile } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [profile?.couple_id]);

  async function loadEvents() {
    if (!profile?.couple_id) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await listCalendarEvents(profile.couple_id);
      setEvents(data);
    } catch (err) {
      console.error("Error loading events:", err);
      setError("Failed to load events");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadEvents();
    setIsRefreshing(false);
  }

  async function handleAddEvent() {
    if (!title.trim() || !profile?.couple_id) return;

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const now = new Date();
      const startTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

      await createCalendarEvent({
        couple_id: profile.couple_id,
        title: title.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
      });

      setShowAddForm(false);
      setTitle("");
      setDescription("");
      setLocation("");
      await loadEvents();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error("Error creating event:", err);
      setError("Failed to create event");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSaving(false);
    }
  }

  const upcomingEvents = events
    .filter((event) => new Date(event.start_time) > new Date())
    .sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );

  const pastEvents = events
    .filter((event) => new Date(event.start_time) <= new Date())
    .sort(
      (a, b) =>
        new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
    );

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={Colors.light.link} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <ThemedText type="h2">Shared Calendar</ThemedText>
        <Pressable
          style={[styles.addButton, { backgroundColor: theme.link }]}
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <Feather
            name={showAddForm ? "x" : "plus"}
            size={20}
            color={theme.buttonText}
          />
        </Pressable>
      </View>

      <ThemedText
        type="body"
        style={{ color: theme.textSecondary, marginBottom: Spacing.lg }}
      >
        Plan dates and special moments together
      </ThemedText>

      {error ? (
        <Card elevation={1} style={styles.errorCard}>
          <Feather name="alert-circle" size={24} color={Colors.light.error} />
          <ThemedText type="body" style={{ color: Colors.light.error, marginTop: Spacing.sm }}>
            {error}
          </ThemedText>
        </Card>
      ) : null}

      {showAddForm ? (
        <Card style={styles.formCard}>
          <ThemedText type="h4" style={styles.formTitle}>
            Add Event
          </ThemedText>

          <View style={styles.inputContainer}>
            <ThemedText type="small" style={styles.inputLabel}>
              Title
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundDefault,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder="Event title"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText type="small" style={styles.inputLabel}>
              Description (optional)
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: theme.backgroundDefault,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add details..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText type="small" style={styles.inputLabel}>
              Location (optional)
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundDefault,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              value={location}
              onChangeText={setLocation}
              placeholder="Where?"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <Button
            onPress={handleAddEvent}
            disabled={!title.trim() || isSaving}
            style={styles.submitButton}
          >
            {isSaving ? "Creating..." : "Create Event"}
          </Button>
        </Card>
      ) : null}

      <View style={styles.section}>
        <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
          Upcoming Events
        </ThemedText>

        {upcomingEvents.length > 0 ? (
          upcomingEvents.map((event) => (
            <Card key={event.id} style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <View
                  style={[
                    styles.dateCircle,
                    { backgroundColor: theme.link + "20" },
                  ]}
                >
                  <ThemedText type="small" style={{ color: theme.link }}>
                    {new Date(event.start_time).getDate()}
                  </ThemedText>
                  <ThemedText
                    type="small"
                    style={{ color: theme.link, fontSize: 10 }}
                  >
                    {new Date(event.start_time).toLocaleDateString(undefined, {
                      month: "short",
                    })}
                  </ThemedText>
                </View>
                <View style={styles.eventInfo}>
                  <ThemedText type="body">{event.title}</ThemedText>
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary }}
                  >
                    {formatEventDate(event.start_time)} at{" "}
                    {formatEventTime(event.start_time)}
                  </ThemedText>
                </View>
              </View>
              {event.description ? (
                <ThemedText
                  type="small"
                  style={{
                    color: theme.textSecondary,
                    marginTop: Spacing.sm,
                  }}
                >
                  {event.description}
                </ThemedText>
              ) : null}
              {event.location ? (
                <View style={styles.locationRow}>
                  <Feather
                    name="map-pin"
                    size={12}
                    color={theme.textSecondary}
                  />
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary, marginLeft: 4 }}
                  >
                    {event.location}
                  </ThemedText>
                </View>
              ) : null}
            </Card>
          ))
        ) : (
          <Card>
            <View style={styles.emptyState}>
              <Feather
                name="calendar"
                size={32}
                color={theme.textSecondary}
              />
              <ThemedText
                type="body"
                style={{ color: theme.textSecondary, marginTop: Spacing.md }}
              >
                No upcoming events
              </ThemedText>
            </View>
          </Card>
        )}
      </View>

      {pastEvents.length > 0 ? (
        <View style={styles.section}>
          <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
            Past Events
          </ThemedText>

          {pastEvents.slice(0, 5).map((event) => (
            <Card
              key={event.id}
              style={{ ...styles.eventCard, opacity: 0.7 }}
            >
              <View style={styles.eventHeader}>
                <View
                  style={[
                    styles.dateCircle,
                    { backgroundColor: theme.backgroundSecondary },
                  ]}
                >
                  <Feather
                    name="check-circle"
                    size={20}
                    color={theme.textSecondary}
                  />
                </View>
                <View style={styles.eventInfo}>
                  <ThemedText type="body">{event.title}</ThemedText>
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary }}
                  >
                    {formatEventDate(event.start_time)}
                  </ThemedText>
                </View>
              </View>
            </Card>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  errorCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    alignItems: "center",
  },
  formCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  formTitle: {
    marginBottom: Spacing.lg,
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    marginBottom: Spacing.xs,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
  },
  submitButton: {
    marginTop: Spacing.md,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  eventCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  eventHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  eventInfo: {
    flex: 1,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  emptyState: {
    padding: Spacing.xl,
    alignItems: "center",
  },
});
