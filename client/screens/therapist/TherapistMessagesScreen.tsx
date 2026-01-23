import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Spacing, BorderRadius } from "@/constants/theme";

interface TherapistMessage {
  id: string;
  couple_id: string;
  sender_id: string;
  sender_role: "therapist" | "client";
  content: string;
  read_at: string | null;
  created_at: string;
}

interface CoupleThread {
  id: string;
  partner1_name: string;
  partner2_name: string;
  last_message?: TherapistMessage;
  unread_count: number;
}

export default function TherapistMessagesScreen() {
  const { theme } = useTheme();
  const { profile, session } = useAuth();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList>(null);

  const [selectedCouple, setSelectedCouple] = useState<CoupleThread | null>(null);
  const [messageText, setMessageText] = useState("");

  const { data: couples = [] } = useQuery({
    queryKey: ["therapist-couples", profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      const { data: couplesData, error } = await supabase
        .from("Couples_couples")
        .select("id, partner1_id, partner2_id")
        .eq("therapist_id", profile.id);
      if (error) throw error;

      const partnerIds = [
        ...couplesData.map(c => c.partner1_id),
        ...couplesData.filter(c => c.partner2_id).map(c => c.partner2_id),
      ].filter(Boolean);

      const { data: profiles } = await supabase
        .from("Couples_profiles")
        .select("id, display_name, email")
        .in("id", partnerIds);

      const profileMap = new Map(
        (profiles || []).map(p => [p.id, p.display_name || p.email?.split("@")[0] || "Partner"])
      );

      return couplesData.map((couple: any) => ({
        id: couple.id,
        partner1_name: profileMap.get(couple.partner1_id) || "Partner 1",
        partner2_name: couple.partner2_id ? profileMap.get(couple.partner2_id) || "Partner 2" : "Awaiting",
        unread_count: 0,
      })) as CoupleThread[];
    },
    enabled: !!profile && profile.role === "therapist",
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["therapist-messages", selectedCouple?.id],
    queryFn: async () => {
      if (!selectedCouple) return [];
      const { data, error } = await supabase
        .from("therapist_messages")
        .select("*")
        .eq("couple_id", selectedCouple.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as TherapistMessage[];
    },
    enabled: !!selectedCouple,
  });

  useEffect(() => {
    if (!selectedCouple) return;

    const channel = supabase
      .channel(`therapist-messages-${selectedCouple.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "therapist_messages",
          filter: `couple_id=eq.${selectedCouple.id}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["therapist-messages", selectedCouple.id],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedCouple, queryClient]);

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCouple || !profile || !messageText.trim()) return;
      const { error } = await supabase.from("therapist_messages").insert({
        couple_id: selectedCouple.id,
        sender_id: profile.id,
        sender_role: "therapist",
        content: messageText.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["therapist-messages", selectedCouple?.id],
      });
      setMessageText("");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
  });

  const handleSend = () => {
    if (!messageText.trim()) return;
    sendMessageMutation.mutate();
  };

  if (!selectedCouple) {
    return (
      <ThemedView style={styles.container}>
        <View
          style={[
            styles.couplesList,
            { paddingTop: headerHeight + Spacing.lg, paddingBottom: insets.bottom },
          ]}
        >
          <ThemedText type="h2" style={styles.title}>
            Messages
          </ThemedText>
          <ThemedText type="small" style={styles.subtitle}>
            Select a couple to view conversation
          </ThemedText>

          {couples.length > 0 ? (
            couples.map((couple) => (
              <Card
                key={couple.id}
                style={styles.coupleCard}
                onPress={() => setSelectedCouple(couple)}
              >
                <View style={styles.coupleInfo}>
                  <View style={[styles.avatar, { backgroundColor: theme.link }]}>
                    <Feather name="users" size={20} color={theme.buttonText} />
                  </View>
                  <View style={styles.coupleDetails}>
                    <ThemedText type="body">
                      {couple.partner1_name} & {couple.partner2_name}
                    </ThemedText>
                    <ThemedText type="small" style={styles.lastMessage}>
                      Tap to view messages
                    </ThemedText>
                  </View>
                  <Feather name="chevron-right" size={20} color={theme.textSecondary} />
                </View>
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Feather name="message-circle" size={48} color={theme.textSecondary} />
              <ThemedText type="body" style={styles.emptyText}>
                No couples assigned yet
              </ThemedText>
            </Card>
          )}
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={headerHeight}
      >
        <View style={[styles.chatHeader, { backgroundColor: theme.backgroundSecondary }]}>
          <Pressable onPress={() => setSelectedCouple(null)} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={theme.text} />
          </Pressable>
          <ThemedText type="h4">
            {selectedCouple.partner1_name} & {selectedCouple.partner2_name}
          </ThemedText>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.messagesList,
            { paddingBottom: insets.bottom + 80 },
          ]}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          renderItem={({ item }) => {
            const isTherapist = item.sender_role === "therapist";
            return (
              <View
                style={[
                  styles.messageRow,
                  isTherapist ? styles.messageRowRight : styles.messageRowLeft,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    isTherapist
                      ? { backgroundColor: theme.link }
                      : { backgroundColor: theme.backgroundSecondary },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.messageText,
                      isTherapist && { color: theme.buttonText },
                    ]}
                  >
                    {item.content}
                  </ThemedText>
                  <ThemedText
                    type="small"
                    style={[
                      styles.messageTime,
                      isTherapist && { color: theme.buttonText, opacity: 0.7 },
                    ]}
                  >
                    {new Date(item.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </ThemedText>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyMessages}>
              <ThemedText type="small" style={{ opacity: 0.6 }}>
                No messages yet. Start the conversation!
              </ThemedText>
            </View>
          }
        />

        <View
          style={[
            styles.inputContainer,
            { backgroundColor: theme.backgroundDefault, paddingBottom: insets.bottom },
          ]}
        >
          <TextInput
            style={[
              styles.messageInput,
              { backgroundColor: theme.inputBackground, color: theme.text },
            ]}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type a message..."
            placeholderTextColor={theme.textSecondary}
            multiline
          />
          <Pressable
            style={[styles.sendButton, { backgroundColor: theme.link }]}
            onPress={handleSend}
            disabled={!messageText.trim() || sendMessageMutation.isPending}
          >
            <Feather name="send" size={20} color={theme.buttonText} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  couplesList: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    opacity: 0.7,
    marginBottom: Spacing.xl,
  },
  coupleCard: {
    marginBottom: Spacing.md,
  },
  coupleInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  coupleDetails: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  lastMessage: {
    opacity: 0.6,
    marginTop: 2,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  emptyText: {
    marginTop: Spacing.lg,
  },
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    marginRight: Spacing.md,
  },
  messagesList: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  messageRow: {
    marginBottom: Spacing.md,
  },
  messageRowLeft: {
    alignItems: "flex-start",
  },
  messageRowRight: {
    alignItems: "flex-end",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  messageText: {
    fontSize: 15,
  },
  messageTime: {
    fontSize: 11,
    opacity: 0.6,
    marginTop: Spacing.xs,
    alignSelf: "flex-end",
  },
  emptyMessages: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  inputContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  messageInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
