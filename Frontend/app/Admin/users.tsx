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
import { getUsers, toggleUserActive, deleteUser, AdminUser } from "../../services/adminService";

export default function UsersScreen() {
  const navigation = useNavigation();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await getUsers();
    if (data) setUsers(data);
    setLoading(false);
  };

  const handleToggleActive = async (user: AdminUser) => {
    const newStatus = !user.is_active;
    const { error } = await toggleUserActive(user.id, newStatus);
    if (!error) {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: newStatus } : u))
      );
    } else {
      Alert.alert("Error", "Could not change user status.");
    }
  };

  const handleDeleteUser = (user: AdminUser) => {
    Alert.alert(
      "Delete User",
      `Are you sure you want to permanently delete ${user.first_name || user.email}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const { error } = await deleteUser(user.id);
            if (!error) {
              setUsers((prev) => prev.filter((u) => u.id !== user.id));
            } else {
              Alert.alert("Error", "Failed to delete user.");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: AdminUser }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(item.first_name?.[0] || item.email[0]).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>
            {item.first_name} {item.last_name}
          </Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{item.role.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: item.is_active ? "#EF4444" : "#22C55E" }]}
          onPress={() => handleToggleActive(item)}
        >
          <Text style={styles.actionBtnText}>
            {item.is_active ? "Block" : "Unblock"}
          </Text>
        </TouchableOpacity>
        
        {item.role !== 'admin' && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#1E293B" }]}
            onPress={() => handleDeleteUser(item)}
          >
            <Ionicons name="trash-outline" size={16} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Ionicons name="menu" size={30} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Management</Text>
        <View style={{ width: 30 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={fetchUsers}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No users found.</Text>
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
  emptyText: { color: "#64748B", fontSize: 16 },
  userCard: { backgroundColor: "#FFF", borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  userInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#E2E8F0", justifyContent: "center", alignItems: "center", marginRight: 12 },
  avatarText: { fontSize: 20, fontWeight: "700", color: "#475569" },
  userDetails: { flex: 1 },
  userName: { fontSize: 16, fontWeight: "600", color: "#1E293B" },
  userEmail: { fontSize: 14, color: "#64748B", marginBottom: 6 },
  roleBadge: { backgroundColor: "#DBEAFE", alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  roleText: { color: "#2563EB", fontSize: 10, fontWeight: "700" },
  actionButtons: { flexDirection: "row", alignItems: "center", gap: 8 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, flexDirection: "row", alignItems: "center" },
  actionBtnText: { color: "#FFF", fontWeight: "600", fontSize: 12 },
});
