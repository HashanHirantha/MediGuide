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
import { Colors, Typography, Spacing, Radius, Shadow, Layout, AppStyles, FontWeight } from "../../constants/AdminTheme";

const quickActions = [
  {
    title: "Verify Doctors",
    icon: "shield-checkmark",
    color: Colors.success,
    route: "/Admin/verification",
  },
  {
    title: "Manage Users",
    icon: "people",
    color: Colors.primary,
    route: "/Admin/users",
  },
  {
    title: "Manage Diseases",
    icon: "fitness",
    color: Colors.danger,
    route: "/Admin/diseases",
  },
  {
    title: "Manage Symptoms",
    icon: "body",
    color: Colors.secondary,
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
          <ActivityIndicator size="large" color={Colors.primary} />
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
        color: Colors.chartBlue,
      },
      {
        title: "Doctors",
        value: analytics.total_doctors.toString(),
        icon: "medkit",
        color: Colors.chartTeal,
      },
      {
        title: "Predictions",
        value: analytics.total_predictions.toString(),
        icon: "pulse",
        color: Colors.chartPurple,
      },
      {
        title: "Appointments",
        value: analytics.total_appointments.toString(),
        icon: "calendar",
        color: Colors.chartOrange,
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
            <Ionicons name="menu" size={30} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color={Colors.surface} />
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
            <Ionicons name="refresh-circle-outline" size={24} color={Colors.primary} />
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
          <Ionicons name="bar-chart" size={70} color={Colors.primary} />
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
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              <Text style={styles.activityText}>{activity}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: AppStyles.screen,
  header: { marginTop: Spacing.lg, marginHorizontal: Layout.screenPadding, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: Spacing.xl },
  avatar: { width: 42, height: 42, borderRadius: Radius.circle, backgroundColor: Colors.primary, justifyContent: "center", alignItems: "center" },
  welcomeCard: { margin: Layout.screenPadding, padding: Spacing.xxl, backgroundColor: Colors.primary, borderRadius: Radius.xLarge, ...Shadow.card },
  welcomeTitle: { color: Colors.surface, fontSize: Typography.h2, fontWeight: FontWeight.bold },
  welcomeSubtitle: { color: Colors.primaryLight, marginTop: Spacing.xs, fontSize: Typography.body },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginHorizontal: Layout.screenPadding, marginTop: Spacing.xl, marginBottom: Spacing.md },
  sectionTitle: AppStyles.sectionTitle,
  loadingContainer: { height: 150, justifyContent: "center", alignItems: "center" },
  errorText: { color: Colors.danger, fontSize: Typography.button },
  statsContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingHorizontal: Layout.screenPadding },
  statCard: { width: "48%", backgroundColor: Colors.card, borderRadius: Radius.large, padding: Layout.cardPadding, marginBottom: Spacing.lg, ...Shadow.card },
  iconContainer: { width: 50, height: 50, borderRadius: Radius.medium, justifyContent: "center", alignItems: "center" },
  statValue: { marginTop: Spacing.lg, fontWeight: FontWeight.bold, fontSize: Typography.h2, color: Colors.textPrimary },
  statTitle: { marginTop: Spacing.xs, color: Colors.textSecondary, fontSize: Typography.button },
  quickContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingHorizontal: Layout.screenPadding },
  quickCard: { width: "48%", backgroundColor: Colors.card, borderRadius: Radius.large, paddingVertical: Spacing.xxxl, alignItems: "center", marginBottom: Spacing.lg, ...Shadow.card },
  quickText: { marginTop: Spacing.lg, fontWeight: FontWeight.semibold, color: Colors.textPrimary, textAlign: "center" },
  analyticsCard: { marginHorizontal: Layout.screenPadding, backgroundColor: Colors.card, borderRadius: Radius.large, paddingVertical: 40, alignItems: "center", ...Shadow.card },
  analyticsTitle: { marginTop: Spacing.lg, fontSize: Typography.h3, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  analyticsSubtitle: { marginTop: Spacing.xs, color: Colors.textSecondary },
  activityCard: { marginHorizontal: Layout.screenPadding, backgroundColor: Colors.card, borderRadius: Radius.large, padding: Layout.cardPadding, ...Shadow.card },
  activityRow: { flexDirection: "row", alignItems: "center", marginVertical: Spacing.sm },
  activityText: { marginLeft: Spacing.md, fontSize: Typography.button, color: Colors.textPrimary },
});
