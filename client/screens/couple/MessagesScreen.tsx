import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";
import { Message } from "@/types";
import { apiRequest, getApiUrl } from "@/lib/query-client";

export default function MessagesScreen() {
  const { profile } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [messageText, setMessageText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages/couple", profile?.couple_id],
    enabled: !!profile?.couple_id,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", "/api/messages", { content });
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({
        queryKey: ["/api/messages/couple", profile?.couple_id],
      });
    },
  });

  useEffect(() => {
    if (!profile?.couple_id) return;

    const channel = supabase
      .channel(`messages:${profile.couple_id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Couples_Messages",
          filter: `couple_id=eq.${profile.couple_id}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["/api/messages/couple", profile?.couple_id],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.couple_id, queryClient]);

  const handleSend = () => {
    if (!messageText.trim()) return;
    sendMessageMutation.mutate(messageText.trim());
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.sender_id === profile?.id;

    return (
      <View
        style={[
          styles.messageBubble,
          isOwnMessage
            ? [styles.ownMessage, { backgroundColor: theme.link }]
            : [
                styles.partnerMessage,
                {
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: theme.border,
                },
              ],
        ]}
      >
        <ThemedText
          type="body"
          style={isOwnMessage ? { color: theme.buttonText } : undefined}
        >
          {item.content}
        </ThemedText>
        <ThemedText
          type="small"
          style={[
            styles.messageTime,
            isOwnMessage
              ? { color: theme.buttonText, opacity: 0.8 }
              : { color: theme.textSecondary },
          ]}
        >
          {new Date(item.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </ThemedText>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Feather name="message-circle" size={48} color={theme.textSecondary} />
      <ThemedText
        type="body"
        style={[styles.emptyText, { color: theme.textSecondary }]}
      >
        No messages yet. Start a conversation!
      </ThemedText>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <FlatList
        ref={flatListRef}
        inverted={messages.length > 0}
        data={messages.toReversed()}
        renderItem={renderMessage}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[
          styles.messagesList,
          { paddingTop: Spacing.xl },
        ]}
        ListEmptyComponent={renderEmpty}
      />

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.backgroundDefault,
            borderTopColor: theme.border,
            paddingBottom: insets.bottom > 0 ? insets.bottom : Spacing.md,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.inputBackground,
              borderColor: theme.border,
              color: theme.text,
            },
          ]}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
          placeholderTextColor={theme.textSecondary}
          multiline
          maxLength={1000}
        />
        <Pressable
          style={[
            styles.sendButton,
            {
              backgroundColor: theme.link,
              opacity: !messageText.trim() || sendMessageMutation.isPending ? 0.5 : 1,
            },
          ]}
          onPress={handleSend}
          disabled={!messageText.trim() || sendMessageMutation.isPending}
        >
          <Feather name="send" size={20} color={theme.buttonText} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    padding: Spacing.md,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: "75%",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  ownMessage: {
    alignSelf: "flex-end",
    borderBottomRightRadius: BorderRadius.xs,
  },
  partnerMessage: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderBottomLeftRadius: BorderRadius.xs,
  },
  messageTime: {
    marginTop: Spacing.xs,
  },
  inputContainer: {
    flexDirection: "row",
    padding: Spacing.md,
    borderTopWidth: 1,
    alignItems: "flex-end",
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    ...Typography.body,
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["5xl"],
  },
  emptyText: {
    marginTop: Spacing.md,
    textAlign: "center",
  },
});
