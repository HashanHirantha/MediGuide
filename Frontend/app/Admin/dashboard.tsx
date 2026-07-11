import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation, useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { getAdminAnalytics, AdminAnalytics } from "../../services/adminService";
import { globalStyles } from "../../constants/globalStyles";
import { colors, spacing, typography, radius, shadows } from "../../constants/theme";

const quickActions = [
  {
    title: "Verify Doctors",
    icon: "shield-checkmark",
    color: colors.successText,
    route: "/Admin/verification",
  },
  {
    title: "Manage Users",
    icon: "people",
    color: colors.primary,
    route: "/Admin/users",
  },
  {
    title: "Manage Diseases",
    icon: "fitness",
    color: colors.starColorAlt,
    route: "/Admin/diseases",
  },
  {
    title: "Manage Symptoms",
    icon: "body",
    color: colors.secondary,
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
  
  // Modals state
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

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

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm("Are you sure you want to log out?")) {
        await supabase.auth.signOut();
        router.replace("/(auth)/login");
      }
    } else {
      Alert.alert("Logout", "Are you sure you want to log out?", [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: async () => {
            await supabase.auth.signOut();
            router.replace("/(auth)/login");
          }
        }
      ]);
    }
  };

  const renderStats = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
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
        color: colors.primary,
      },
      {
        title: "Doctors",
        value: analytics.total_doctors.toString(),
        icon: "medkit",
        color: colors.secondary,
      },
      {
        title: "Predictions",
        value: analytics.total_predictions.toString(),
        icon: "pulse",
        color: colors.iconDark,
      },
      {
        title: "Appointments",
        value: analytics.total_appointments.toString(),
        icon: "calendar",
        color: colors.starColorAlt,
      },
    ];

    return (
      <View style={styles.statsContainer}>
        {stats.map((item) => (
          <View key={item.title} style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
              <Ionicons name={item.icon as any} size={28} color={item.color} />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statTitle}>{item.title}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: spacing.lg }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
            <Ionicons name="menu" size={30} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => setShowNotifications(true)}>
              <Ionicons name="notifications-outline" size={26} color={colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatar} onPress={() => setShowProfile(true)}>
              <Ionicons name="person" size={20} color={colors.surface} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Welcome */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Welcome Back 👋</Text>
          <Text style={styles.welcomeSubtitle}>MediGuide Administration Dashboard</Text>
        </View>

        {/* Statistics */}
        <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>Overview</Text>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionSubtitle}>Monitor your platform's real-time metrics.</Text>
          <TouchableOpacity style={styles.refreshBtn} onPress={fetchAnalytics}>
            <Ionicons name="refresh-outline" size={20} color={colors.primary} />
            <Text style={styles.refreshText}>Refresh</Text>
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
              <View style={[styles.quickIconContainer, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon as any} size={30} color={item.color} />
              </View>
              <Text style={styles.quickText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Analytics Placeholder */}
        <Text style={styles.sectionTitle}>Analytics Overview</Text>
        <View style={styles.analyticsCard}>
          <Ionicons name="bar-chart" size={70} color={colors.primary} />
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
              <Ionicons name="checkmark-circle" size={20} color={colors.successText} />
              <Text style={styles.activityText}>{activity}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Notifications Modal */}
      <Modal visible={showNotifications} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setShowNotifications(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {recentActivities.map((activity, index) => (
                <View key={index} style={styles.notificationRow}>
                  <View style={[styles.notificationIcon, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name="information-circle" size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.notificationText}>{activity}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Profile Modal */}
      <Modal visible={showProfile} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.profileModalContent}>
            <View style={styles.profileHeader}>
              <View style={[styles.avatar, { width: 60, height: 60 }]}>
                <Ionicons name="person" size={30} color={colors.surface} />
              </View>
              <Text style={styles.profileName}>Administrator</Text>
              <Text style={styles.profileEmail}>admin@mediguide.com</Text>
            </View>
            
            <View style={styles.profileActions}>
              <TouchableOpacity style={styles.profileActionBtn} onPress={() => {
                setShowProfile(false);
                // Optionally navigate to a full settings page
              }}>
                <Ionicons name="settings-outline" size={20} color={colors.textPrimary} />
                <Text style={styles.profileActionText}>Settings</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.profileActionBtn, { borderBottomWidth: 0 }]} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color={colors.dangerText} />
                <Text style={[styles.profileActionText, { color: colors.dangerText }]}>Log Out</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.profileCloseBtn} onPress={() => setShowProfile(false)}>
              <Text style={styles.profileCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: globalStyles.container,
  header: { marginTop: spacing.lg, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: spacing.xl },
  avatar: { width: 42, height: 42, borderRadius: radius.full, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center" },
  welcomeCard: { marginTop: spacing.lg, marginBottom: spacing.xl, padding: spacing.xxl, backgroundColor: colors.primary, borderRadius: radius.xl, ...shadows.elevated },
  welcomeTitle: { color: colors.surface, fontSize: typography.h2.fontSize, fontWeight: '700' },
  welcomeSubtitle: { color: colors.surfaceAlt, marginTop: spacing.xs, fontSize: typography.body.fontSize },
  
  sectionTitle: { ...globalStyles.sectionTitle, marginLeft: 0, marginTop: spacing.xl, marginBottom: spacing.sm },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md },
  sectionSubtitle: { color: colors.textSecondary, fontSize: typography.caption.fontSize },
  refreshBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceAlt, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.full },
  refreshText: { color: colors.primary, fontSize: 12, fontWeight: '600', marginLeft: 4 },
  
  loadingContainer: { height: 150, justifyContent: "center", alignItems: "center" },
  errorText: { color: colors.dangerText, fontSize: typography.body.fontSize },
  
  statsContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  statCard: { width: "48%", backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border, ...shadows.card },
  iconContainer: { width: 52, height: 52, borderRadius: radius.lg, justifyContent: "center", alignItems: "center", marginBottom: spacing.md },
  statTextContainer: { marginTop: 4 },
  statValue: { fontWeight: '800', fontSize: 26, color: colors.textPrimary },
  statTitle: { marginTop: 2, color: colors.textSecondary, fontSize: 13, fontWeight: '500' },
  
  quickContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  quickCard: { width: "48%", backgroundColor: colors.surface, borderRadius: radius.xl, paddingVertical: spacing.xl, paddingHorizontal: spacing.sm, alignItems: "center", marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border, ...shadows.card },
  quickIconContainer: { width: 60, height: 60, borderRadius: radius.full, justifyContent: "center", alignItems: "center", marginBottom: spacing.md },
  quickText: { fontWeight: '600', color: colors.textPrimary, textAlign: "center", fontSize: 14 },
  
  analyticsCard: { backgroundColor: colors.surface, borderRadius: radius.xl, paddingVertical: 40, alignItems: "center", borderWidth: 1, borderColor: colors.border, ...shadows.card },
  analyticsTitle: { marginTop: spacing.lg, fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  analyticsSubtitle: { marginTop: spacing.xs, color: colors.textSecondary },
  
  activityCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, ...shadows.card },
  activityRow: { flexDirection: "row", alignItems: "center", marginVertical: spacing.sm },
  activityText: { marginLeft: spacing.md, fontSize: 14, color: colors.textPrimary, fontWeight: '500' },
  
  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: "flex-end" },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl, padding: spacing.xl, maxHeight: '80%' },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg },
  modalTitle: { fontSize: typography.h2.fontSize, fontWeight: '700', color: colors.textPrimary },
  modalBody: { paddingBottom: spacing.xl },
  notificationRow: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  notificationIcon: { width: 40, height: 40, borderRadius: radius.full, justifyContent: "center", alignItems: "center", marginRight: spacing.md },
  notificationText: { flex: 1, fontSize: typography.body.fontSize, color: colors.textPrimary },
  
  profileModalContent: { backgroundColor: colors.surface, margin: spacing.xl, borderRadius: radius.xl, padding: spacing.xl, alignItems: "center", alignSelf: "center", width: '80%', ...shadows.elevated, marginTop: '50%' },
  profileHeader: { alignItems: "center", marginBottom: spacing.xl },
  profileName: { marginTop: spacing.md, fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  profileEmail: { marginTop: 4, fontSize: 14, color: colors.textSecondary },
  profileActions: { width: '100%', borderTopWidth: 1, borderTopColor: colors.border },
  profileActionBtn: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  profileActionText: { marginLeft: spacing.md, fontSize: 16, fontWeight: '500', color: colors.textPrimary },
  profileCloseBtn: { marginTop: spacing.xl, paddingVertical: spacing.sm, paddingHorizontal: spacing.xl, backgroundColor: colors.surfaceAlt, borderRadius: radius.full },
  profileCloseText: { color: colors.textSecondary, fontWeight: '600', fontSize: 14 },
});
