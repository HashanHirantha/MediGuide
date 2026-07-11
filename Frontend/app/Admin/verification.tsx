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
          <Ionicons name="document-text-outline" size={16} color="#64748B" />
          <Text style={styles.detailText}>Reg No: <Text style={{ fontWeight: '600' }}>{item.registration_no}</Text></Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="school-outline" size={16} color="#64748B" />
          <Text style={styles.detailText}>{item.qualification}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="business-outline" size={16} color="#64748B" />
          <Text style={styles.detailText}>{item.hospital_name}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="mail-outline" size={16} color="#64748B" />
          <Text style={styles.detailText}>{item.profiles.email}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.verifyBtn}
        onPress={() => handleVerify(item)}
      >
        <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
        <Text style={styles.verifyBtnText}>Approve & Verify</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Ionicons name="menu" size={30} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doctor Verification</Text>
        <View style={{ width: 30 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
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
              <Ionicons name="checkmark-done-circle" size={60} color="#22C55E" style={{ marginBottom: 16 }} />
              <Text style={styles.emptyText}>All doctors are verified!</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#1E293B" },
  listContainer: { padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 },
  emptyText: { color: "#64748B", fontSize: 18, fontWeight: '600' },
  card: { backgroundColor: "#FFF", borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#E2E8F0", justifyContent: "center", alignItems: "center", marginRight: 12 },
  avatarText: { fontSize: 22, fontWeight: "700", color: "#475569" },
  titleContainer: { flex: 1 },
  name: { fontSize: 18, fontWeight: "600", color: "#1E293B" },
  specialty: { fontSize: 14, color: "#2563EB", fontWeight: "500", marginTop: 2 },
  detailsContainer: { backgroundColor: "#F1F5F9", padding: 12, borderRadius: 12, marginBottom: 16 },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 8 },
  detailText: { color: "#475569", fontSize: 14, flex: 1 },
  verifyBtn: { backgroundColor: "#22C55E", padding: 14, borderRadius: 12, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 },
  verifyBtnText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
});
