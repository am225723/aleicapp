import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";
import { CalendarEvent } from "@/types";
import { apiRequest } from "@/lib/query-client";

export default function CalendarScreen() {
  const { profile } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const queryClient = useQueryClient();

  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const { data: events = [], isLoading } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/calendar", profile?.couple_id],
    enabled: !!profile?.couple_id,
  });

  const addEventMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      location?: string;
    }) => {
      const now = new Date();
      const startTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
      return apiRequest("POST", "/api/calendar", {
        ...data,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/calendar", profile?.couple_id],
      });
      setShowAddForm(false);
      setTitle("");
      setDescription("");
      setLocation("");
    },
  });

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

      {showAddForm ? (
        <Card style={styles.formCard}>
          <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
            Add New Event
          </ThemedText>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.inputBackground,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            value={title}
            onChangeText={setTitle}
            placeholder="Event title"
            placeholderTextColor={theme.textSecondary}
          />

          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: theme.inputBackground,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Description (optional)"
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.inputBackground,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            value={location}
            onChangeText={setLocation}
            placeholder="Location (optional)"
            placeholderTextColor={theme.textSecondary}
          />

          <Button
            onPress={() =>
              addEventMutation.mutate({
                title,
                description: description || undefined,
                location: location || undefined,
              })
            }
            disabled={!title.trim() || addEventMutation.isPending}
          >
            Add Event
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
                  <Feather name="calendar" size={20} color={theme.link} />
                </View>
                <View style={styles.eventInfo}>
                  <ThemedText type="h4">{event.title}</ThemedText>
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
                <ThemedText type="body" style={{ marginTop: Spacing.sm }}>
                  {event.description}
                </ThemedText>
              ) : null}
              {event.location ? (
                <View style={styles.locationRow}>
                  <Feather
                    name="map-pin"
                    size={14}
                    color={theme.textSecondary}
                  />
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}
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
              style={[styles.eventCard, { opacity: 0.7 }]}
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
  content: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  formCard: {
    marginBottom: Spacing.xl,
  },
  input: {
    ...Typography.body,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  textArea: {
    minHeight: 80,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  eventCard: {
    marginBottom: Spacing.md,
  },
  eventHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    alignItems: "center",
    paddingVertical: Spacing["2xl"],
  },
});
