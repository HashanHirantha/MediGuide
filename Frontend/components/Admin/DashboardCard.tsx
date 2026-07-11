import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  backgroundColor?: string;
  trend?: number;
  onPress?: () => void;
}

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  iconColor = "#2563EB",
  backgroundColor = "#EFF6FF",
  trend,
  onPress,
}: DashboardCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.card}
    >
      {/* Top Row */}

      <View style={styles.header}>
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
            size={28}
            color={iconColor}
          />
        </View>

        {trend !== undefined && (
          <View style={styles.trendContainer}>
            <Ionicons
              name={
                trend >= 0
                  ? "trending-up"
                  : "trending-down"
              }
              size={16}
              color={
                trend >= 0
                  ? "#22C55E"
                  : "#EF4444"
              }
            />

            <Text
              style={[
                styles.trendText,
                {
                  color:
                    trend >= 0
                      ? "#22C55E"
                      : "#EF4444",
                },
              ]}
            >
              {Math.abs(trend)}%
            </Text>
          </View>
        )}
      </View>

      {/* Main Number */}

      <Text style={styles.value}>
        {value}
      </Text>

      {/* Title */}

      <Text style={styles.title}>
        {title}
      </Text>

      {/* Subtitle */}

      {subtitle && (
        <Text style={styles.subtitle}>
          {subtitle}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",

    borderRadius: 22,

    padding: 18,

    marginVertical: 8,

    shadowColor: "#000",

    shadowOpacity: 0.08,

    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  header: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",
  },

  iconContainer: {
    width: 56,

    height: 56,

    borderRadius: 16,

    justifyContent: "center",

    alignItems: "center",
  },

  trendContainer: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#F8FAFC",

    borderRadius: 12,

    paddingHorizontal: 10,

    paddingVertical: 5,
  },

  trendText: {
    marginLeft: 4,

    fontWeight: "700",

    fontSize: 13,
  },

  value: {
    fontSize: 32,

    fontWeight: "700",

    color: "#0F172A",

    marginTop: 18,
  },

  title: {
    fontSize: 16,

    fontWeight: "600",

    color: "#334155",

    marginTop: 6,
  },

  subtitle: {
    fontSize: 13,

    color: "#94A3B8",

    marginTop: 5,
  },
});
