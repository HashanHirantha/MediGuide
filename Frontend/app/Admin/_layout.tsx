import React from "react";
import { Drawer } from "expo-router/drawer";
import { Ionicons } from "@expo/vector-icons";

export default function AdminLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerType: "slide",
        drawerActiveTintColor: "#2563EB",
        drawerInactiveTintColor: "#64748B",
        drawerStyle: {
          backgroundColor: "#FFFFFF",
          width: 280,
        },
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: "600",
        },
      }}
    >
      <Drawer.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          drawerIcon: ({ color, size }) => (
            <Ionicons
              name="grid-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="users"
        options={{
          title: "Users",
          drawerIcon: ({ color, size }) => (
            <Ionicons
              name="people-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="doctors"
        options={{
          title: "Doctors",
          drawerIcon: ({ color, size }) => (
            <Ionicons
              name="medkit-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="verification"
        options={{
          title: "Verification",
          drawerIcon: ({ color, size }) => (
            <Ionicons
              name="shield-checkmark-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="appointments"
        options={{
          title: "Appointments",
          drawerIcon: ({ color, size }) => (
            <Ionicons
              name="calendar-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="symptoms"
        options={{
          title: "Symptoms",
          drawerIcon: ({ color, size }) => (
            <Ionicons
              name="body-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="diseases"
        options={{
          title: "Diseases",
          drawerIcon: ({ color, size }) => (
            <Ionicons
              name="fitness-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="analytics"
        options={{
          title: "Analytics",
          drawerIcon: ({ color, size }) => (
            <Ionicons
              name="bar-chart-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="settings"
        options={{
          title: "Settings",
          drawerIcon: ({ color, size }) => (
            <Ionicons
              name="settings-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Drawer>
  );
}
