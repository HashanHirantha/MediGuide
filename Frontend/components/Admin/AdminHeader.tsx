
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export default function AdminHeader({
  title,
  subtitle,
}: AdminHeaderProps) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Left Section */}
      <View style={styles.leftContainer}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() =>
            navigation.dispatch(DrawerActions.openDrawer())
          }
        >
          <Ionicons
            name="menu"
            size={24}
            color="#1E293B"
          />
        </TouchableOpacity>

        <View>
          <Text style={styles.title}>{title}</Text>

          {subtitle && (
            <Text style={styles.subtitle}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {/* Right Section */}

      <View style={styles.rightContainer}>
        {/* Search */}

        <TouchableOpacity style={styles.iconButton}>
          <Ionicons
            name="search"
            size={22}
            color="#475569"
          />
        </TouchableOpacity>

        {/* Notifications */}

        <TouchableOpacity style={styles.iconButton}>
          <Ionicons
            name="notifications-outline"
            size={22}
            color="#475569"
          />

          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>

        {/* Profile */}

        <TouchableOpacity style={styles.profileContainer}>
          <Image
            source={{
              uri:
                "https://ui-avatars.com/api/?name=Admin&background=2563EB&color=fff",
            }}
            style={styles.avatar}
          />

          <View>
            <Text style={styles.adminName}>
              Administrator
            </Text>

            <Text style={styles.role}>
              Super Admin
            </Text>
          </View>

          <Ionicons
            name="chevron-down"
            size={18}
            color="#64748B"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",

    elevation: 2,
  },

  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
  },

  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: "#64748B",
  },

  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },

  badge: {
    position: "absolute",
    top: 6,
    right: 6,

    backgroundColor: "#EF4444",

    width: 18,
    height: 18,

    borderRadius: 9,

    justifyContent: "center",
    alignItems: "center",
  },

  badgeText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 10,
  },

  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginLeft: 16,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
  },

  adminName: {
    fontWeight: "700",
    color: "#1E293B",
    fontSize: 15,
  },

  role: {
    color: "#64748B",
    fontSize: 12,
  },
});
