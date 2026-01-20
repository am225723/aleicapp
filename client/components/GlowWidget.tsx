import React from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";

interface GlowWidgetProps {
  title: string;
  subtitle?: string;
  icon: keyof typeof Feather.glyphMap;
  iconColor: string;
  backgroundColor: string;
  onPress: () => void;
  size?: "small" | "medium" | "large";
  badge?: string | number;
}

const WidgetColors = {
  textPrimary: "#FFFFFF",
  textSecondary: "rgba(255, 255, 255, 0.7)",
};

export function GlowWidget({
  title,
  subtitle,
  icon,
  iconColor,
  backgroundColor,
  onPress,
  size = "medium",
  badge,
}: GlowWidgetProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const getWidgetStyle = () => {
    switch (size) {
      case "small":
        return styles.widgetSmall;
      case "large":
        return styles.widgetLarge;
      default:
        return styles.widgetMedium;
    }
  };

  const renderContent = () => (
    <View style={styles.widgetContent}>
      <View style={styles.widgetHeader}>
        <View style={[styles.widgetIcon, { backgroundColor: iconColor + "30" }]}>
          <Feather name={icon} size={20} color={iconColor} />
        </View>
        {badge ? (
          <View style={styles.widgetBadge}>
            <ThemedText style={styles.widgetBadgeText}>{badge}</ThemedText>
          </View>
        ) : null}
      </View>
      <ThemedText style={styles.widgetTitle}>{title}</ThemedText>
      {subtitle ? (
        <ThemedText style={styles.widgetSubtitle}>{subtitle}</ThemedText>
      ) : null}
    </View>
  );

  return (
    <Pressable
      style={[styles.widget, getWidgetStyle(), { backgroundColor }]}
      onPress={handlePress}
    >
      {Platform.OS === "ios" ? (
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
          {renderContent()}
        </BlurView>
      ) : (
        renderContent()
      )}
    </Pressable>
  );
}

export function GlowWidgetGrid({ children }: { children: React.ReactNode }) {
  return <View style={styles.grid}>{children}</View>;
}

export function GlowWidgetRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

export function GlowBackground() {
  return (
    <View style={styles.glowContainer}>
      <LinearGradient
        colors={["transparent", "rgba(255, 150, 50, 0.3)", "transparent"]}
        style={styles.glowOrange}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <LinearGradient
        colors={["transparent", "rgba(100, 150, 255, 0.2)", "transparent"]}
        style={styles.glowBlue}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
      />
    </View>
  );
}

export const GlowColors = {
  background: "#0D0D0F",
  cardDark: "rgba(30, 35, 45, 0.85)",
  cardBlue: "rgba(45, 65, 100, 0.7)",
  cardBrown: "rgba(90, 60, 40, 0.7)",
  cardTeal: "rgba(40, 80, 80, 0.7)",
  cardPurple: "rgba(80, 50, 100, 0.7)",
  cardGreen: "rgba(40, 80, 60, 0.7)",
  cardRed: "rgba(100, 50, 50, 0.7)",
  cardOrange: "rgba(100, 70, 40, 0.7)",
  gold: "#C9A962",
  goldLight: "#E5D4A1",
  textPrimary: "#FFFFFF",
  textSecondary: "rgba(255, 255, 255, 0.7)",
  accentBlue: "#4A90D9",
  accentGreen: "#81C995",
  accentPurple: "#9B59B6",
  accentRed: "#E74C3C",
  accentOrange: "#F39C12",
  accentTeal: "#1ABC9C",
  accentPink: "#E8A59C",
};

const styles = StyleSheet.create({
  widget: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  widgetSmall: {
    flex: 1,
    minHeight: 120,
  },
  widgetMedium: {
    flex: 1,
    minHeight: 140,
  },
  widgetLarge: {
    flex: 1,
    minHeight: 160,
  },
  widgetContent: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: "space-between",
  },
  widgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  widgetIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  widgetBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  widgetBadgeText: {
    fontSize: 11,
    color: WidgetColors.textPrimary,
  },
  widgetTitle: {
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
    color: WidgetColors.textPrimary,
    marginTop: Spacing.sm,
  },
  widgetSubtitle: {
    fontSize: 12,
    color: WidgetColors.textSecondary,
    marginTop: 2,
  },
  grid: {
    gap: Spacing.md,
  },
  row: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  glowContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  glowOrange: {
    position: "absolute",
    bottom: "20%",
    left: "10%",
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.5,
  },
  glowBlue: {
    position: "absolute",
    top: "30%",
    right: "-10%",
    width: 250,
    height: 250,
    borderRadius: 125,
    opacity: 0.4,
  },
});
