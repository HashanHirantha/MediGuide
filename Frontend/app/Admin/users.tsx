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
import { Colors, Typography, Spacing, Radius, Shadow, Layout, AppStyles, FontWeight } from "../../constants/AdminTheme";

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
          style={[styles.actionBtn, { backgroundColor: item.is_active ? Colors.danger : Colors.success }]}
          onPress={() => handleToggleActive(item)}
        >
          <Text style={styles.actionBtnText}>
            {item.is_active ? "Block" : "Unblock"}
          </Text>
        </TouchableOpacity>
        
        {item.role !== 'admin' && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.textPrimary }]}
            onPress={() => handleDeleteUser(item)}
          >
            <Ionicons name="trash-outline" size={16} color={Colors.surface} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Ionicons name="menu" size={30} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Management</Text>
        <View style={{ width: 30 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
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
  container: AppStyles.screen,
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: Layout.screenPadding, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: Typography.h3, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  listContainer: { padding: Layout.screenPadding },
  center: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 },
  emptyText: { color: Colors.textSecondary, fontSize: Typography.h5 },
  userCard: { backgroundColor: Colors.card, borderRadius: Radius.large, padding: Layout.cardPadding, marginBottom: Spacing.lg, ...Shadow.card, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  userInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatar: { width: 48, height: 48, borderRadius: Radius.circle, backgroundColor: Colors.border, justifyContent: "center", alignItems: "center", marginRight: Spacing.md },
  avatarText: { fontSize: Typography.h3, fontWeight: FontWeight.bold, color: Colors.textSecondary },
  userDetails: { flex: 1 },
  userName: { fontSize: Typography.h5, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  userEmail: { fontSize: Typography.bodySmall, color: Colors.textSecondary, marginBottom: 6 },
  roleBadge: { backgroundColor: Colors.primaryLight, alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.small },
  roleText: { color: Colors.primary, fontSize: 10, fontWeight: FontWeight.bold },
  actionButtons: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  actionBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.small, flexDirection: "row", alignItems: "center" },
  actionBtnText: { color: Colors.surface, fontWeight: FontWeight.semibold, fontSize: Typography.caption },
});
