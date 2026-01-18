import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { getCouples, CoupleData } from "@/lib/storage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CouplesListScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [couples, setCouples] = useState<CoupleData[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadCouples();
  }, []);

  async function loadCouples() {
    const data = await getCouples();
    setCouples(data);
  }

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
                {item.partner1Name.charAt(0)}
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
                {item.partner2Name.charAt(0)}
              </ThemedText>
            </View>
          </View>

          <View style={styles.coupleInfo}>
            <ThemedText type="h4">
              {item.partner1Name} & {item.partner2Name}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Last active: {new Date(item.lastActive).toLocaleDateString()}
            </ThemedText>
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
});
