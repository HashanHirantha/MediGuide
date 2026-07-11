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
import { globalStyles } from "../../constants/globalStyles";
import { colors, spacing, typography, radius, shadows } from "../../constants/theme";

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
          <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>Reg No: <Text style={{ fontWeight: '600' }}>{item.registration_no}</Text></Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="school-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{item.qualification}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="business-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{item.hospital_name}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="mail-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{item.profiles.email}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.verifyBtn}
        onPress={() => handleVerify(item)}
      >
        <Ionicons name="checkmark-circle-outline" size={20} color={colors.surface} />
        <Text style={styles.verifyBtnText}>Approve & Verify</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Ionicons name="menu" size={30} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doctor Verification</Text>
        <View style={{ width: 30 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
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
              <Ionicons name="checkmark-done-circle" size={60} color={colors.successText} style={{ marginBottom: spacing.lg }} />
              <Text style={styles.emptyText}>All doctors are verified!</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: globalStyles.container,
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: spacing.lg, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: typography.h2.fontSize, fontWeight: '700', color: colors.textPrimary },
  listContainer: { padding: spacing.lg },
  center: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 },
  emptyText: { color: colors.textSecondary, fontSize: 18, fontWeight: '600' },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg, ...shadows.card },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing.lg },
  avatar: { width: 50, height: 50, borderRadius: radius.full, backgroundColor: colors.border, justifyContent: "center", alignItems: "center", marginRight: spacing.md },
  avatarText: { fontSize: 22, fontWeight: '700', color: colors.textSecondary },
  titleContainer: { flex: 1 },
  name: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
  specialty: { fontSize: typography.body.fontSize, color: colors.primary, fontWeight: '500', marginTop: 2 },
  detailsContainer: { backgroundColor: colors.surfaceAlt, padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.lg },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm, gap: spacing.sm },
  detailText: { color: colors.textSecondary, fontSize: typography.caption.fontSize, flex: 1 },
  verifyBtn: { backgroundColor: colors.successText, padding: spacing.md, borderRadius: radius.md, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: spacing.sm },
  verifyBtnText: { color: colors.surface, fontSize: 16, fontWeight: '600' },
});
