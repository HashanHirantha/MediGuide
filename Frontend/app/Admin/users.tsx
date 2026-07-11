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
import { globalStyles } from "../../constants/globalStyles";
import { colors, spacing, typography, radius, shadows } from "../../constants/theme";

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
          style={[styles.actionBtn, { backgroundColor: item.is_active ? colors.dangerText : colors.successText }]}
          onPress={() => handleToggleActive(item)}
        >
          <Text style={styles.actionBtnText}>
            {item.is_active ? "Block" : "Unblock"}
          </Text>
        </TouchableOpacity>
        
        {item.role !== 'admin' && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.buttonDark }]}
            onPress={() => handleDeleteUser(item)}
          >
            <Ionicons name="trash-outline" size={16} color={colors.surface} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Ionicons name="menu" size={30} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Management</Text>
        <View style={{ width: 30 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
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
  container: globalStyles.container,
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: spacing.lg, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: typography.h2.fontSize, fontWeight: '700', color: colors.textPrimary },
  listContainer: { padding: spacing.lg },
  center: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 },
  emptyText: { color: colors.textSecondary, fontSize: typography.body.fontSize },
  userCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg, ...shadows.card, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  userInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatar: { width: 48, height: 48, borderRadius: radius.full, backgroundColor: colors.border, justifyContent: "center", alignItems: "center", marginRight: spacing.md },
  avatarText: { fontSize: typography.h2.fontSize, fontWeight: '700', color: colors.textSecondary },
  userDetails: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  userEmail: { fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: 6 },
  roleBadge: { backgroundColor: colors.searchBg, alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.sm },
  roleText: { color: colors.primary, fontSize: 10, fontWeight: '700' },
  actionButtons: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  actionBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.sm, flexDirection: "row", alignItems: "center" },
  actionBtnText: { color: colors.surface, fontWeight: '600', fontSize: typography.caption.fontSize },
});
