import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface QuickActionCardProps {
  title: string;
  description?: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  backgroundColor?: string;
  badgeText?: string;
  onPress?: () => void;
}

export default function QuickActionCard({
  title,
  description,
  icon,
  iconColor = "#2563EB",
  backgroundColor = "#EFF6FF",
  badgeText,
  onPress,
}: QuickActionCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={onPress}
    >
      {/* Badge */}

      {badgeText && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {badgeText}
          </Text>
        </View>
      )}

      {/* Icon */}

      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={32}
          color={iconColor}
        />
      </View>

      {/* Title */}

      <Text style={styles.title}>
        {title}
      </Text>

      {/* Description */}

      {description && (
        <Text style={styles.description}>
          {description}
        </Text>
      )}

      {/* Arrow */}

      <View style={styles.footer}>
        <Text style={styles.openText}>
          Open
        </Text>

        <Ionicons
          name="arrow-forward-circle"
          size={24}
          color={iconColor}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,

    position: "relative",
  },

  badge: {
    position: "absolute",
    top: 14,
    right: 14,

    backgroundColor: "#EF4444",

    borderRadius: 20,

    paddingHorizontal: 10,
    paddingVertical: 4,

    zIndex: 5,
  },

  badgeText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 11,
  },

  iconContainer: {
    width: 60,
    height: 60,

    borderRadius: 18,

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 18,
  },

  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },

  description: {
    marginTop: 6,
    color: "#64748B",
    fontSize: 13,
    lineHeight: 18,
  },

  footer: {
    marginTop: 22,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",
  },

  openText: {
    fontSize: 14,
    color: "#2563EB",
    fontWeight: "600",
  },
});
