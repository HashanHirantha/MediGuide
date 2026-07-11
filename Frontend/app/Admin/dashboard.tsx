import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation, useRouter } from "expo-router";
import { getAdminAnalytics, AdminAnalytics } from "../../services/adminService";

const quickActions = [
  {
    title: "Verify Doctors",
    icon: "shield-checkmark",
    color: "#22C55E",
    route: "/Admin/verification",
  },
  {
    title: "Manage Users",
    icon: "people",
    color: "#2563EB",
    route: "/Admin/users",
  },
  {
    title: "Manage Diseases",
    icon: "fitness",
    color: "#EF4444",
    route: "/Admin/diseases",
  },
  {
    title: "Manage Symptoms",
    icon: "body",
    color: "#14B8A6",
    route: "/Admin/symptoms",
  },
];

const recentActivities = [
  "System is online and running smoothly.",
  "Admin dashboard loaded.",
  "Database connection verified.",
];

export default function DashboardScreen() {
  const navigation = useNavigation();
  const router = useRouter();

  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    const { data, error } = await getAdminAnalytics();
    if (data) {
      setAnalytics(data);
    }
    setLoading(false);
  };

  const renderStats = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      );
    }

    if (!analytics) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Failed to load statistics.</Text>
        </View>
      );
    }

    const stats = [
      {
        title: "Users",
        value: analytics.total_users.toString(),
        icon: "people",
        color: "#2563EB",
      },
      {
        title: "Doctors",
        value: analytics.total_doctors.toString(),
        icon: "medkit",
        color: "#14B8A6",
      },
      {
        title: "Predictions",
        value: analytics.total_predictions.toString(),
        icon: "pulse",
        color: "#8B5CF6",
      },
      {
        title: "Appointments",
        value: analytics.total_appointments.toString(),
        icon: "calendar",
        color: "#F59E0B",
      },
    ];

    return (
      <View style={styles.statsContainer}>
        {stats.map((item) => (
          <View key={item.title} style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon as any} size={26} color="#fff" />
            </View>
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statTitle}>{item.title}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
            <Ionicons name="menu" size={30} color="#1E293B" />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <Ionicons name="notifications-outline" size={24} color="#1E293B" />
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color="#FFFFFF" />
            </View>
          </View>
        </View>

        {/* Welcome */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Welcome Back 👋</Text>
          <Text style={styles.welcomeSubtitle}>MediGuide Administration Dashboard</Text>
        </View>

        {/* Statistics */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <TouchableOpacity onPress={fetchAnalytics}>
            <Ionicons name="refresh-circle-outline" size={24} color="#2563EB" />
          </TouchableOpacity>
        </View>

        {renderStats()}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickContainer}>
          {quickActions.map((item) => (
            <TouchableOpacity
              key={item.title}
              style={styles.quickCard}
              onPress={() => router.push(item.route as any)}
            >
              <Ionicons name={item.icon as any} size={34} color={item.color} />
              <Text style={styles.quickText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Analytics Placeholder */}
        <Text style={styles.sectionTitle}>Analytics Overview</Text>
        <View style={styles.analyticsCard}>
          <Ionicons name="bar-chart" size={70} color="#2563EB" />
          <Text style={styles.analyticsTitle}>Analytics Active</Text>
          <Text style={styles.analyticsSubtitle}>
            Live metrics are now populated from the database above.
          </Text>
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activities</Text>
        <View style={styles.activityCard}>
          {recentActivities.map((activity, index) => (
            <View key={index} style={styles.activityRow}>
              <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
              <Text style={styles.activityText}>{activity}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { marginTop: 15, marginHorizontal: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 20 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#2563EB", justifyContent: "center", alignItems: "center" },
  welcomeCard: { margin: 20, padding: 22, backgroundColor: "#2563EB", borderRadius: 22 },
  welcomeTitle: { color: "#FFFFFF", fontSize: 26, fontWeight: "700" },
  welcomeSubtitle: { color: "#DCE8FF", marginTop: 6, fontSize: 15 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginHorizontal: 20, marginTop: 20, marginBottom: 12 },
  sectionTitle: { fontWeight: "700", fontSize: 20, color: "#1E293B", marginHorizontal: 20, marginTop: 20, marginBottom: 12 },
  loadingContainer: { height: 150, justifyContent: "center", alignItems: "center" },
  errorText: { color: "#EF4444", fontSize: 15 },
  statsContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingHorizontal: 20 },
  statCard: { width: "48%", backgroundColor: "#FFFFFF", borderRadius: 20, padding: 18, marginBottom: 16, elevation: 3 },
  iconContainer: { width: 50, height: 50, borderRadius: 15, justifyContent: "center", alignItems: "center" },
  statValue: { marginTop: 15, fontWeight: "700", fontSize: 28, color: "#1E293B" },
  statTitle: { marginTop: 5, color: "#64748B", fontSize: 15 },
  quickContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingHorizontal: 20 },
  quickCard: { width: "48%", backgroundColor: "#FFFFFF", borderRadius: 20, paddingVertical: 28, alignItems: "center", marginBottom: 16, elevation: 2 },
  quickText: { marginTop: 15, fontWeight: "600", color: "#1E293B", textAlign: "center" },
  analyticsCard: { marginHorizontal: 20, backgroundColor: "#FFFFFF", borderRadius: 20, paddingVertical: 40, alignItems: "center", elevation: 2 },
  analyticsTitle: { marginTop: 15, fontSize: 20, fontWeight: "700", color: "#1E293B" },
  analyticsSubtitle: { marginTop: 6, color: "#64748B" },
  activityCard: { marginHorizontal: 20, backgroundColor: "#FFFFFF", borderRadius: 20, padding: 18, elevation: 2 },
  activityRow: { flexDirection: "row", alignItems: "center", marginVertical: 10 },
  activityText: { marginLeft: 12, fontSize: 15, color: "#334155" },
});
