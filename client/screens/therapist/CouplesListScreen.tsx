import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface CoupleData {
  id: string;
  partner1_id: string;
  partner2_id: string | null;
  partner1_name: string;
  partner2_name: string;
  status: string;
  last_active: string;
  created_at: string;
}

export default function CouplesListScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useAuth();

  const [couples, setCouples] = useState<CoupleData[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadCouples = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const { data: couplesData, error } = await supabase
        .from("Couples_couples")
        .select("*")
        .eq("therapist_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.log("Error loading couples:", error.message);
        return;
      }

      if (!couplesData || couplesData.length === 0) {
        setCouples([]);
        return;
      }

      const partnerIds = [
        ...couplesData.map(c => c.partner1_id),
        ...couplesData.filter(c => c.partner2_id).map(c => c.partner2_id),
      ].filter(Boolean);

      const { data: profiles } = await supabase
        .from("Couples_profiles")
        .select("id, display_name, email")
        .in("id", partnerIds);

      const profileMap = new Map(
        (profiles || []).map(p => [p.id, p.display_name || p.email || "Partner"])
      );

      const enrichedCouples: CoupleData[] = couplesData.map(couple => ({
        id: couple.id,
        partner1_id: couple.partner1_id,
        partner2_id: couple.partner2_id,
        partner1_name: profileMap.get(couple.partner1_id) || "Partner 1",
        partner2_name: couple.partner2_id 
          ? profileMap.get(couple.partner2_id) || "Partner 2"
          : "Awaiting Partner",
        status: couple.status,
        last_active: couple.updated_at || couple.created_at,
        created_at: couple.created_at,
      }));

      setCouples(enrichedCouples);
    } catch (error) {
      console.log("Error loading couples:", error);
    }
  }, [profile?.id]);

  useFocusEffect(
    useCallback(() => {
      loadCouples();
    }, [loadCouples])
  );

  async function handleRefresh() {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadCouples();
    setIsRefreshing(false);
  }

  const handleCouplePress = (coupleId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("CoupleDetail", { coupleId });
  };

  const renderCouple = ({ item }: { item: CoupleData }) => (
    <Pressable onPress={() => handleCouplePress(item.id)}>
      <Card elevation={1} style={styles.coupleCard}>
        <View style={styles.coupleRow}>
          <View style={styles.avatarContainer}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: Colors.light.link + "30" },
              ]}
            >
              <ThemedText type="h4" style={{ color: Colors.light.link }}>
                {item.partner1_name.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
            <View
              style={[
                styles.avatar,
                styles.avatarOverlap,
                { backgroundColor: Colors.light.accent + "30" },
              ]}
            >
              <ThemedText type="h4" style={{ color: Colors.light.accent }}>
                {item.partner2_name.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
          </View>

          <View style={styles.coupleInfo}>
            <ThemedText type="h4">
              {item.partner1_name} & {item.partner2_name}
            </ThemedText>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      item.status === "active"
                        ? Colors.light.success + "20"
                        : Colors.light.warning + "20",
                  },
                ]}
              >
                <ThemedText
                  type="small"
                  style={{
                    color:
                      item.status === "active"
                        ? Colors.light.success
                        : Colors.light.warning,
                  }}
                >
                  {item.status === "active" ? "Active" : "Pending"}
                </ThemedText>
              </View>
              <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.sm }}>
                {new Date(item.last_active).toLocaleDateString()}
              </ThemedText>
            </View>
          </View>

          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </View>
      </Card>
    </Pressable>
  );

  const renderEmpty = () => (
    <EmptyState
      image={require("../../../assets/images/empty-couples.png")}
      title="No couples yet"
      description="Create invite codes to connect with your couples"
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + Spacing.lg, backgroundColor: theme.backgroundRoot },
        ]}
      >
        <ThemedText type="h2">Couples</ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: theme.textSecondary }]}
        >
          {couples.length} {couples.length === 1 ? "couple" : "couples"} in your
          practice
        </ThemedText>
      </View>

      <FlatList
        data={couples}
        keyExtractor={(item) => item.id}
        renderItem={renderCouple}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 80 + Spacing.xl },
          couples.length === 0 && styles.emptyList,
        ]}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  subtitle: {
    marginTop: Spacing.xs,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  emptyList: {
    flexGrow: 1,
  },
  coupleCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  coupleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    flexDirection: "row",
    marginRight: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  avatarOverlap: {
    marginLeft: -16,
  },
  coupleInfo: {
    flex: 1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
});
