import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { DrawerActions } from "@react-navigation/native";
import { getUnverifiedDoctors, verifyDoctor, AdminUnverifiedDoctor } from "../../services/adminService";
import { Colors, Typography, Spacing, Radius, Shadow, Layout, AppStyles, FontWeight } from "../../constants/AdminTheme";

export default function VerificationScreen() {
  const navigation = useNavigation();
  const [doctors, setDoctors] = useState<AdminUnverifiedDoctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    const { data } = await getUnverifiedDoctors();
    if (data) setDoctors(data);
    setLoading(false);
  };

  const handleVerify = (doctor: AdminUnverifiedDoctor) => {
    Alert.alert(
      "Verify Doctor",
      `Are you sure you want to approve Dr. ${doctor.profiles.last_name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: async () => {
            const { error } = await verifyDoctor(doctor.id);
            if (!error) {
              setDoctors((prev) => prev.filter((d) => d.id !== doctor.id));
              Alert.alert("Success", "Doctor has been verified and is now live.");
            } else {
              Alert.alert("Error", "Could not verify doctor.");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: AdminUnverifiedDoctor }) => (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.profiles.first_name[0].toUpperCase()}
          </Text>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.name}>
            Dr. {item.profiles.first_name} {item.profiles.last_name}
          </Text>
          <Text style={styles.specialty}>{item.specialty}</Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Ionicons name="document-text-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>Reg No: <Text style={{ fontWeight: FontWeight.semibold }}>{item.registration_no}</Text></Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="school-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{item.qualification}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="business-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{item.hospital_name}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="mail-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{item.profiles.email}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.verifyBtn}
        onPress={() => handleVerify(item)}
      >
        <Ionicons name="checkmark-circle-outline" size={20} color={Colors.surface} />
        <Text style={styles.verifyBtnText}>Approve & Verify</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Ionicons name="menu" size={30} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doctor Verification</Text>
        <View style={{ width: 30 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={doctors}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={fetchDoctors}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="checkmark-done-circle" size={60} color={Colors.success} style={{ marginBottom: Spacing.lg }} />
              <Text style={styles.emptyText}>All doctors are verified!</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: AppStyles.screen,
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: Layout.screenPadding, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: Typography.h3, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  listContainer: { padding: Layout.screenPadding },
  center: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 },
  emptyText: { color: Colors.textSecondary, fontSize: Typography.h4, fontWeight: FontWeight.semibold },
  card: { backgroundColor: Colors.card, borderRadius: Radius.large, padding: Layout.cardPadding, marginBottom: Spacing.lg, ...Shadow.card },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: Spacing.lg },
  avatar: { width: 50, height: 50, borderRadius: Radius.circle, backgroundColor: Colors.border, justifyContent: "center", alignItems: "center", marginRight: Spacing.md },
  avatarText: { fontSize: Typography.h2, fontWeight: FontWeight.bold, color: Colors.textSecondary },
  titleContainer: { flex: 1 },
  name: { fontSize: Typography.h4, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  specialty: { fontSize: Typography.bodySmall, color: Colors.primary, fontWeight: FontWeight.medium, marginTop: 2 },
  detailsContainer: { backgroundColor: Colors.divider, padding: Spacing.md, borderRadius: Radius.medium, marginBottom: Spacing.lg },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: Spacing.sm, gap: Spacing.sm },
  detailText: { color: Colors.textSecondary, fontSize: Typography.bodySmall, flex: 1 },
  verifyBtn: { backgroundColor: Colors.success, padding: Spacing.md, borderRadius: Radius.medium, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: Spacing.sm },
  verifyBtnText: { color: Colors.surface, fontSize: Typography.button, fontWeight: FontWeight.semibold },
});
