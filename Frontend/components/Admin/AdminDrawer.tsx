import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";

import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer";

import { Ionicons } from "@expo/vector-icons";

const menuItems = [
  {
    label: "Dashboard",
    icon: "grid-outline",
    route: "/admin/dashboard",
  },
  {
    label: "Users",
    icon: "people-outline",
    route: "/admin/users",
  },
  {
    label: "Doctors",
    icon: "medkit-outline",
    route: "/admin/doctors",
  },
  {
    label: "Doctor Verification",
    icon: "shield-checkmark-outline",
    route: "/admin/verification",
  },
  {
    label: "Appointments",
    icon: "calendar-outline",
    route: "/admin/appointments",
  },
  {
    label: "Symptoms",
    icon: "body-outline",
    route: "/admin/symptoms",
  },
  {
    label: "Diseases",
    icon: "fitness-outline",
    route: "/admin/diseases",
  },
  {
    label: "Analytics",
    icon: "bar-chart-outline",
    route: "/admin/analytics",
  },
  {
    label: "Reports",
    icon: "document-text-outline",
    route: "/admin/reports",
  },
  {
    label: "Settings",
    icon: "settings-outline",
    route: "/admin/settings",
  },
];

export default function AdminDrawer({
  navigation,
  state,
}: DrawerContentComponentProps) {
  return (
    <DrawerContentScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}

      <View style={styles.header}>
        <Image
          source={{
            uri: "https://ui-avatars.com/api/?name=MediGuide&background=2563EB&color=ffffff",
          }}
          style={styles.logo}
        />

        <Text style={styles.title}>MediGuide</Text>

        <Text style={styles.subtitle}>
          Admin Dashboard
        </Text>
      </View>

      {/* Navigation */}

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => {
          const focused = state.index === index;

          return (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuItem,
                focused && styles.activeItem,
              ]}
              onPress={() => navigation.navigate(item.route as never)}
            >
              <Ionicons
                name={item.icon as any}
                size={22}
                color={
                  focused ? "#FFFFFF" : "#475569"
                }
              />

              <Text
                style={[
                  styles.menuText,
                  focused && styles.activeText,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Footer */}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton}>
          <Ionicons
            name="log-out-outline"
            size={22}
            color="#EF4444"
          />

          <Text style={styles.logoutText}>
            Logout
          </Text>
        </TouchableOpacity>

        <Text style={styles.version}>
          MediGuide v1.0.0
        </Text>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "space-between",
  },

  header: {
    paddingTop: 40,
    paddingBottom: 25,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2563EB",
  },

  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 5,
  },

  menuContainer: {
    marginTop: 20,
    paddingHorizontal: 15,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderRadius: 14,
    marginBottom: 8,
  },

  activeItem: {
    backgroundColor: "#2563EB",
  },

  menuText: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
  },

  activeText: {
    color: "#FFFFFF",
  },

  footer: {
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    padding: 20,
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoutText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#EF4444",
    fontWeight: "600",
  },

  version: {
    marginTop: 20,
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 12,
  },
});
