import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface RecentActivityCardProps {
  title: string;
  description: string;
  time: string;

  type?:
    | "success"
    | "warning"
    | "danger"
    | "info";

  avatar?: string;

  unread?: boolean;

  onPress?: () => void;
}

export default function RecentActivityCard({
  title,
  description,
  time,
  type = "info",
  avatar,
  unread = false,
  onPress,
}: RecentActivityCardProps) {
  const getTheme = () => {
    switch (type) {
      case "success":
        return {
          color: "#22C55E",
          background: "#ECFDF5",
          icon: "checkmark-circle",
        };

      case "warning":
        return {
          color: "#F59E0B",
          background: "#FFFBEB",
          icon: "alert-circle",
        };

      case "danger":
        return {
          color: "#EF4444",
          background: "#FEF2F2",
          icon: "close-circle",
        };

      default:
        return {
          color: "#2563EB",
          background: "#EFF6FF",
          icon: "information-circle",
        };
    }
  };

  const theme = getTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.card}
    >
      {/* Unread Dot */}

      {unread && <View style={styles.unreadDot} />}

      {/* Avatar */}

      <Image
        source={{
          uri:
            avatar ||
            "https://ui-avatars.com/api/?name=Admin&background=2563EB&color=ffffff",
        }}
        style={styles.avatar}
      />

      {/* Content */}

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.title}>
            {title}
          </Text>

          <Text style={styles.time}>
            {time}
          </Text>
        </View>

        <Text style={styles.description}>
          {description}
        </Text>
      </View>

      {/* Status Icon */}

      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: theme.background,
          },
        ]}
      >
        <Ionicons
          name={theme.icon as any}
          size={22}
          color={theme.color}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",

    borderRadius: 18,

    padding: 16,

    marginBottom: 14,

    flexDirection: "row",

    alignItems: "center",

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

  unreadDot: {
    width: 10,
    height: 10,

    borderRadius: 5,

    backgroundColor: "#2563EB",

    position: "absolute",

    top: 16,

    left: 12,
  },

  avatar: {
    width: 54,

    height: 54,

    borderRadius: 27,

    marginRight: 15,
  },

  content: {
    flex: 1,
  },

  topRow: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",
  },

  title: {
    fontSize: 16,

    fontWeight: "700",

    color: "#0F172A",

    flex: 1,
  },

  time: {
    color: "#94A3B8",

    fontSize: 12,

    marginLeft: 10,
  },

  description: {
    marginTop: 5,

    color: "#64748B",

    fontSize: 14,

    lineHeight: 20,
  },

  iconContainer: {
    width: 46,

    height: 46,

    borderRadius: 14,

    justifyContent: "center",

    alignItems: "center",

    marginLeft: 12,
  },
});
