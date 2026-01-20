import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

type GlassTone = "blue" | "green" | "amber" | "purple" | "rose";

const TONE = {
  blue: {
    outer: ["rgba(130,190,255,0.42)", "rgba(70,120,255,0.10)"] as const,
    inner: ["rgba(255,255,255,0.20)", "rgba(255,255,255,0.05)"] as const,
    glow: "rgba(120, 180, 255, 0.45)",
    bgTint: "rgba(20, 40, 70, 0.35)",
    accent: "#82BEFF",
  },
  green: {
    outer: ["rgba(120,255,200,0.38)", "rgba(50,180,140,0.10)"] as const,
    inner: ["rgba(255,255,255,0.20)", "rgba(255,255,255,0.05)"] as const,
    glow: "rgba(120, 255, 200, 0.38)",
    bgTint: "rgba(15, 55, 45, 0.32)",
    accent: "#78FFC8",
  },
  amber: {
    outer: ["rgba(255,210,120,0.42)", "rgba(255,140,40,0.10)"] as const,
    inner: ["rgba(255,255,255,0.20)", "rgba(255,255,255,0.05)"] as const,
    glow: "rgba(255, 190, 120, 0.40)",
    bgTint: "rgba(70, 45, 20, 0.34)",
    accent: "#FFD278",
  },
  purple: {
    outer: ["rgba(180,130,255,0.42)", "rgba(120,70,255,0.10)"] as const,
    inner: ["rgba(255,255,255,0.20)", "rgba(255,255,255,0.05)"] as const,
    glow: "rgba(160, 120, 255, 0.40)",
    bgTint: "rgba(50, 30, 70, 0.35)",
    accent: "#B482FF",
  },
  rose: {
    outer: ["rgba(255,130,170,0.42)", "rgba(255,70,120,0.10)"] as const,
    inner: ["rgba(255,255,255,0.20)", "rgba(255,255,255,0.05)"] as const,
    glow: "rgba(255, 150, 180, 0.40)",
    bgTint: "rgba(70, 30, 45, 0.35)",
    accent: "#FF82AA",
  },
} as const;

interface GlassWidgetProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  tone?: GlassTone;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  leftIcon?: React.ReactNode;
  icon?: keyof typeof Feather.glyphMap;
  rightSlot?: React.ReactNode;
  children?: React.ReactNode;
  size?: "small" | "medium" | "large";
  disabled?: boolean;
}

export function GlassWidget(props: GlassWidgetProps) {
  const {
    title,
    subtitle,
    badgeText,
    tone = "blue",
    onPress,
    style,
    leftIcon,
    icon,
    rightSlot,
    children,
    size = "medium",
    disabled = false,
  } = props;

  const c = TONE[tone];

  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return { minHeight: 80 };
      case "large":
        return { minHeight: 160 };
      default:
        return { minHeight: 110 };
    }
  };

  const renderIcon = () => {
    if (leftIcon) return <View style={styles.icon}>{leftIcon}</View>;
    if (icon) {
      return (
        <View style={[styles.icon, { borderColor: c.accent + "40" }]}>
          <Feather name={icon} size={18} color={c.accent} />
        </View>
      );
    }
    return null;
  };

  const renderContent = () => (
    <>
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: c.bgTint }]} />

      <LinearGradient
        colors={[...c.inner]}
        start={{ x: 0.1, y: 0.0 }}
        end={{ x: 0.8, y: 1.0 }}
        style={styles.innerSheen}
      />

      <LinearGradient
        colors={["rgba(255,255,255,0.33)", "rgba(255,255,255,0.0)"]}
        start={{ x: 0.2, y: 0.0 }}
        end={{ x: 0.2, y: 1.0 }}
        style={styles.topHighlight}
      />

      {badgeText ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeText}</Text>
        </View>
      ) : null}

      <View style={styles.headerRow}>
        <View style={styles.leftCol}>
          <View style={styles.titleRow}>
            {renderIcon()}
            <Text numberOfLines={1} style={styles.title}>
              {title}
            </Text>
          </View>

          {subtitle ? (
            <Text numberOfLines={2} style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {rightSlot ? <View style={styles.rightSlot}>{rightSlot}</View> : null}
      </View>

      {children ? <View style={styles.body}>{children}</View> : null}

      <NoiseOverlay opacity={0.08} />
    </>
  );

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.cardWrap,
        { shadowColor: c.glow, transform: [{ scale: pressed && !disabled ? 0.985 : 1 }] },
        disabled && styles.disabled,
        style,
      ]}
    >
      <LinearGradient
        colors={[...c.outer]}
        start={{ x: 0.1, y: 0.0 }}
        end={{ x: 0.9, y: 1.0 }}
        style={styles.outer}
      >
        <View style={styles.clip}>
          {Platform.OS === "ios" ? (
            <BlurView intensity={28} tint="dark" style={[styles.blur, getSizeStyles()]}>
              {renderContent()}
            </BlurView>
          ) : (
            <View style={[styles.blur, getSizeStyles(), { backgroundColor: c.bgTint }]}>
              {renderContent()}
            </View>
          )}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

function NoiseOverlay({ opacity = 0.08 }: { opacity?: number }) {
  const dots = React.useMemo(() => {
    const arr: Array<{ left: number; top: number; a: number }> = [];
    for (let i = 0; i < 40; i++) {
      arr.push({
        left: Math.random() * 320,
        top: Math.random() * 180,
        a: 0.25 + Math.random() * 0.55,
      });
    }
    return arr;
  }, []);

  return (
    <View pointerEvents="none" style={[styles.noiseWrap, { opacity }]}>
      {dots.map((d, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            { left: d.left, top: d.top, opacity: d.a },
          ]}
        />
      ))}
    </View>
  );
}

export function GlassWidgetGrid({ children }: { children: React.ReactNode }) {
  return <View style={styles.grid}>{children}</View>;
}

export function GlassWidgetRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

export function GlassActionButton({
  label,
  icon,
  tone = "amber",
  onPress,
  style,
}: {
  label: string;
  icon?: keyof typeof Feather.glyphMap;
  tone?: GlassTone;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const c = TONE[tone];

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.actionButton,
        { backgroundColor: c.accent, transform: [{ scale: pressed ? 0.95 : 1 }] },
        style,
      ]}
    >
      {icon ? <Feather name={icon} size={14} color="#000" style={{ marginRight: 6 }} /> : null}
      <Text style={styles.actionButtonText}>{label}</Text>
    </Pressable>
  );
}

export function GlassStatusPill({
  text,
  tone = "green",
}: {
  text: string;
  tone?: GlassTone;
}) {
  const c = TONE[tone];
  
  return (
    <View style={[styles.statusPill, { backgroundColor: c.accent + "30", borderColor: c.accent + "50" }]}>
      <Text style={[styles.statusPillText, { color: c.accent }]}>{text}</Text>
    </View>
  );
}

export { TONE as GlassTones };

const styles = StyleSheet.create({
  cardWrap: {
    borderRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.30,
    shadowRadius: 18,
    elevation: 10,
  },
  outer: {
    borderRadius: 22,
    padding: 1.25,
  },
  clip: {
    borderRadius: 22,
    overflow: "hidden",
  },
  blur: {
    borderRadius: 22,
    padding: 16,
  },
  innerSheen: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.95,
  },
  topHighlight: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 18,
    opacity: 0.7,
  },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  badgeText: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 12,
    fontWeight: "600",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  leftCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  subtitle: {
    marginTop: 6,
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    lineHeight: 18,
  },
  rightSlot: {
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },
  body: {
    marginTop: 12,
  },
  noiseWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  dot: {
    position: "absolute",
    width: 1,
    height: 1,
    borderRadius: 1,
    backgroundColor: "rgba(255,255,255,1)",
  },
  disabled: {
    opacity: 0.5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  actionButtonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "600",
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
