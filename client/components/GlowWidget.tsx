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
  actionButton?: {
    label: string;
    icon?: keyof typeof Feather.glyphMap;
    onPress?: () => void;
  };
  previewItems?: Array<{
    icon?: keyof typeof Feather.glyphMap;
    title: string;
    subtitle?: string;
  }>;
  statusText?: string;
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
  actionButton,
  previewItems,
  statusText,
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

  const renderPreviewItems = () => {
    if (!previewItems || previewItems.length === 0) return null;
    
    return (
      <View style={styles.previewContainer}>
        {previewItems.slice(0, 3).map((item, index) => (
          <View key={index} style={styles.previewItem}>
            {item.icon ? (
              <Feather name={item.icon} size={12} color={WidgetColors.textSecondary} style={styles.previewIcon} />
            ) : null}
            <View style={styles.previewTextContainer}>
              <ThemedText style={styles.previewTitle} numberOfLines={1}>{item.title}</ThemedText>
              {item.subtitle ? (
                <ThemedText style={styles.previewSubtitle} numberOfLines={1}>{item.subtitle}</ThemedText>
              ) : null}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderActionButton = () => {
    if (!actionButton) return null;

    return (
      <Pressable 
        style={[styles.actionButton, { backgroundColor: iconColor }]}
        onPress={actionButton.onPress || onPress}
      >
        {actionButton.icon ? (
          <Feather name={actionButton.icon} size={14} color="#FFFFFF" style={styles.actionButtonIcon} />
        ) : null}
        <ThemedText style={styles.actionButtonText}>{actionButton.label}</ThemedText>
      </Pressable>
    );
  };

  const renderContent = () => (
    <View style={styles.widgetContent}>
      <View style={styles.widgetHeader}>
        <View style={[styles.widgetIcon, { backgroundColor: iconColor + "40" }]}>
          <Feather name={icon} size={20} color={iconColor} />
        </View>
        {badge !== undefined && badge !== null ? (
          <View style={styles.widgetBadge}>
            <ThemedText style={styles.widgetBadgeText}>{badge}</ThemedText>
          </View>
        ) : null}
      </View>

      <View style={styles.widgetBody}>
        <ThemedText style={styles.widgetTitle}>{title}</ThemedText>
        {subtitle ? (
          <ThemedText style={styles.widgetSubtitle}>{subtitle}</ThemedText>
        ) : null}
        {statusText ? (
          <ThemedText style={styles.statusText}>{statusText}</ThemedText>
        ) : null}
      </View>

      {previewItems ? renderPreviewItems() : null}
      {actionButton ? renderActionButton() : null}
    </View>
  );

  return (
    <Pressable
      style={[styles.widget, getWidgetStyle(), { backgroundColor }]}
      onPress={handlePress}
    >
      {Platform.OS === "ios" ? (
        <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill}>
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

interface HeroCardProps {
  title: string;
  subtitle: string;
  image?: any;
  gradientColors?: [string, string, string];
}

export function CategoryHeroCard({ title, subtitle, gradientColors = ["rgba(201, 169, 98, 0.3)", "rgba(100, 80, 60, 0.4)", "rgba(13, 13, 15, 0.9)"] }: HeroCardProps) {
  return (
    <View style={styles.heroCard}>
      <LinearGradient
        colors={gradientColors}
        style={styles.heroGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.heroContent}>
        <ThemedText style={styles.heroTitle}>{title}</ThemedText>
        <ThemedText style={styles.heroSubtitle}>{subtitle}</ThemedText>
      </View>
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
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  widgetSmall: {
    flex: 1,
    minHeight: 120,
  },
  widgetMedium: {
    flex: 1,
    minHeight: 150,
  },
  widgetLarge: {
    flex: 1,
    minHeight: 180,
  },
  widgetContent: {
    flex: 1,
    padding: Spacing.md,
  },
  widgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  widgetIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  widgetBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  widgetBadgeText: {
    fontSize: 12,
    fontFamily: "Nunito_600SemiBold",
    color: WidgetColors.textPrimary,
  },
  widgetBody: {
    flex: 1,
  },
  widgetTitle: {
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    color: WidgetColors.textPrimary,
    marginBottom: 2,
  },
  widgetSubtitle: {
    fontSize: 13,
    color: WidgetColors.textSecondary,
    fontFamily: "Nunito_400Regular",
  },
  statusText: {
    fontSize: 12,
    color: WidgetColors.textSecondary,
    fontFamily: "Nunito_400Regular",
    marginTop: 4,
    fontStyle: "italic",
  },
  previewContainer: {
    marginTop: Spacing.sm,
    gap: 6,
  },
  previewItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: BorderRadius.xs,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  previewIcon: {
    marginRight: 6,
  },
  previewTextContainer: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 12,
    color: WidgetColors.textPrimary,
    fontFamily: "Nunito_600SemiBold",
  },
  previewSubtitle: {
    fontSize: 10,
    color: WidgetColors.textSecondary,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
  },
  actionButtonIcon: {
    marginRight: 6,
  },
  actionButtonText: {
    fontSize: 13,
    fontFamily: "Nunito_600SemiBold",
    color: "#FFFFFF",
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
  heroCard: {
    height: 120,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    flex: 1,
    justifyContent: "flex-end",
    padding: Spacing.lg,
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: "Nunito_700Bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: "Nunito_400Regular",
  },
});
