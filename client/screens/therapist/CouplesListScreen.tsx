import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
  Pressable,
  TextInput,
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
  checkin_count: number;
  tool_count: number;
}

export default function CouplesListScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [couples, setCouples] = useState<CoupleData[]>([]);
  const [filteredCouples, setFilteredCouples] = useState<CoupleData[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadCouples = useCallback(async () => {
    try {
      const { data: couplesData, error } = await supabase
        .from("Couples_couples")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.log("Error loading couples:", error.message);
        return;
      }

      if (!couplesData || couplesData.length === 0) {
        setCouples([]);
        setFilteredCouples([]);
        return;
      }

      const partnerIds = [
        ...couplesData.map((c) => c.partner1_id),
        ...couplesData.filter((c) => c.partner2_id).map((c) => c.partner2_id),
      ].filter(Boolean);

      const { data: profiles } = await supabase
        .from("Couples_profiles")
        .select("id, display_name, email")
        .in("id", partnerIds);

      const profileMap = new Map(
        (profiles || []).map((p) => [
          p.id,
          p.display_name || p.email || "Partner",
        ])
      );

      const coupleIds = couplesData.map((c) => c.id);

      const [checkinsResult, toolsResult] = await Promise.all([
        supabase
          .from("Couples_weekly_checkins")
          .select("couple_id")
          .in("couple_id", coupleIds),
        supabase
          .from("Couples_tool_entries")
          .select("couple_id")
          .in("couple_id", coupleIds),
      ]);

      const checkinCounts = new Map<string, number>();
      (checkinsResult.data || []).forEach((c) => {
        checkinCounts.set(c.couple_id, (checkinCounts.get(c.couple_id) || 0) + 1);
      });

      const toolCounts = new Map<string, number>();
      (toolsResult.data || []).forEach((t) => {
        toolCounts.set(t.couple_id, (toolCounts.get(t.couple_id) || 0) + 1);
      });

      const enrichedCouples: CoupleData[] = couplesData.map((couple) => ({
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
        checkin_count: checkinCounts.get(couple.id) || 0,
        tool_count: toolCounts.get(couple.id) || 0,
      }));

      setCouples(enrichedCouples);
      setFilteredCouples(enrichedCouples);
    } catch (error) {
      console.log("Error loading couples:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCouples();
    }, [loadCouples])
  );

  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCouples(couples);
      return;
    }
    const q = searchQuery.toLowerCase();
    setFilteredCouples(
      couples.filter(
        (c) =>
          c.partner1_name.toLowerCase().includes(q) ||
          c.partner2_name.toLowerCase().includes(q)
      )
    );
  }, [searchQuery, couples]);

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
    <Pressable onPress={() => handleCouplePress(item.id)} testID={`couple-card-${item.id}`}>
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
              <ThemedText
                type="small"
                style={{ color: theme.textSecondary, marginLeft: Spacing.sm }}
              >
                {new Date(item.last_active).toLocaleDateString()}
              </ThemedText>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.miniStat}>
                <Feather name="bar-chart-2" size={12} color={theme.textSecondary} />
                <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: 4 }}>
                  {item.checkin_count} check-ins
                </ThemedText>
              </View>
              <View style={styles.miniStat}>
                <Feather name="tool" size={12} color={theme.textSecondary} />
                <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: 4 }}>
                  {item.tool_count} tools
                </ThemedText>
              </View>
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
          {
            paddingTop: insets.top + Spacing.lg,
            backgroundColor: theme.backgroundRoot,
          },
        ]}
      >
        <ThemedText type="h2">All Couples</ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: theme.textSecondary }]}
        >
          {couples.length} {couples.length === 1 ? "couple" : "couples"} in the
          system
        </ThemedText>

        <View
          style={[
            styles.searchContainer,
            { backgroundColor: theme.inputBackground, borderColor: theme.border },
          ]}
        >
          <Feather name="search" size={18} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search couples..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            testID="input-search-couples"
          />
          {searchQuery.length > 0 ? (
            <Pressable onPress={() => setSearchQuery("")}>
              <Feather name="x" size={18} color={theme.textSecondary} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <FlatList
        data={filteredCouples}
        keyExtractor={(item) => item.id}
        renderItem={renderCouple}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 80 + Spacing.xl },
          filteredCouples.length === 0 ? styles.emptyList : undefined,
        ]}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        testID="couples-list"
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
    paddingBottom: Spacing.md,
  },
  subtitle: {
    marginTop: Spacing.xs,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 16,
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
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
    gap: Spacing.md,
  },
  miniStat: {
    flexDirection: "row",
    alignItems: "center",
  },
});
