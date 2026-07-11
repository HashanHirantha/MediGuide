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
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { DrawerActions } from "@react-navigation/native";
import { getDiseases, addDisease, updateDisease, deleteDisease } from "../../services/diseaseService";
import { Colors, Typography, Spacing, Radius, Shadow, Layout, AppStyles, FontWeight } from "../../constants/AdminTheme";

export default function DiseasesScreen() {
  const navigation = useNavigation();
  const [diseases, setDiseases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [specialty, setSpecialty] = useState("General Medicine");
  const [riskLevel, setRiskLevel] = useState("low");
  const [symptomsRequired, setSymptomsRequired] = useState("1");

  useEffect(() => {
    fetchDiseases();
  }, []);

  const fetchDiseases = async () => {
    setLoading(true);
    const { data } = await getDiseases();
    if (data) setDiseases(data);
    setLoading(false);
  };

  const openAddModal = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setSpecialty("General Medicine");
    setRiskLevel("low");
    setSymptomsRequired("1");
    setModalVisible(true);
  };

  const openEditModal = (disease: any) => {
    setEditingId(disease.id);
    setName(disease.name);
    setDescription(disease.description || "");
    setSpecialty(disease.specialty || "General Medicine");
    setRiskLevel(disease.risk_level || "low");
    setSymptomsRequired((disease.symptoms_required || 1).toString());
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Name is required");
      return;
    }

    const reqSymptoms = parseInt(symptomsRequired) || 1;

    if (editingId) {
      const { error } = await updateDisease(editingId, name, description, specialty, riskLevel, reqSymptoms);
      if (!error) {
        setModalVisible(false);
        fetchDiseases();
      } else {
        Alert.alert("Error", "Failed to update disease.");
      }
    } else {
      const { error } = await addDisease(name, description, specialty, riskLevel, reqSymptoms);
      if (!error) {
        setModalVisible(false);
        fetchDiseases();
      } else {
        Alert.alert("Error", "Failed to add disease.");
      }
    }
  };

  const handleDelete = (disease: any) => {
    Alert.alert(
      "Delete Disease",
      `Are you sure you want to delete '${disease.name}'?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const { error } = await deleteDisease(disease.id);
            if (!error) fetchDiseases();
            else Alert.alert("Error", "Failed to delete disease.");
          },
        },
      ]
    );
  };

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'critical': return Colors.danger;
      case 'high': return Colors.pending;
      case 'moderate': return Colors.warning;
      default: return Colors.success;
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={[styles.badge, { backgroundColor: getRiskColor(item.risk_level) + '20' }]}>
            <Text style={[styles.badgeText, { color: getRiskColor(item.risk_level) }]}>
              {item.risk_level?.toUpperCase() || 'LOW'} RISK
            </Text>
          </View>
        </View>
        
        <Text style={styles.specialty}>{item.specialty}</Text>
        {item.description ? <Text style={styles.desc} numberOfLines={2}>{item.description}</Text> : null}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(item)}>
          <Ionicons name="pencil-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item)}>
          <Ionicons name="trash-outline" size={20} color={Colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Ionicons name="menu" size={30} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Diseases</Text>
        <TouchableOpacity onPress={openAddModal}>
          <Ionicons name="add-circle-outline" size={30} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={diseases}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingId ? "Edit Disease" : "Add Disease"}</Text>
            
            <Text style={styles.label}>Disease Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Migraine" />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Specialty</Text>
                <TextInput style={styles.input} value={specialty} onChangeText={setSpecialty} placeholder="e.g. Neurology" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Risk Level</Text>
                <TextInput style={styles.input} value={riskLevel} onChangeText={setRiskLevel} placeholder="low/moderate/high/critical" />
              </View>
            </View>

            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, { height: 80 }]} value={description} onChangeText={setDescription} placeholder="Description..." multiline />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: AppStyles.screen,
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: Layout.screenPadding, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: Typography.h3, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  listContainer: { padding: Layout.screenPadding },
  center: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 },
  card: { backgroundColor: Colors.card, borderRadius: Radius.large, padding: Layout.cardPadding, marginBottom: Spacing.md, ...Shadow.card, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardInfo: { flex: 1, marginRight: Spacing.md },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  name: { fontSize: Typography.h5, fontWeight: FontWeight.semibold, color: Colors.textPrimary, flex: 1 },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.medium },
  badgeText: { fontSize: 10, fontWeight: FontWeight.bold },
  specialty: { fontSize: Typography.bodySmall, color: Colors.primary, fontWeight: FontWeight.semibold },
  desc: { fontSize: Typography.bodySmall, color: Colors.textSecondary, marginTop: 6 },
  actionButtons: { flexDirection: "row", gap: Spacing.md },
  actionBtn: { padding: Spacing.sm, backgroundColor: Colors.divider, borderRadius: Radius.small },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: "center", alignItems: "center", padding: Layout.screenPadding },
  modalContent: { width: "100%", backgroundColor: Colors.surface, borderRadius: Radius.large, padding: Layout.screenPadding },
  modalTitle: { fontSize: Typography.h3, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.xl, textAlign: "center" },
  label: { fontSize: Typography.body, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: Spacing.sm },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.medium, padding: Spacing.md, fontSize: Typography.h5, marginBottom: Spacing.lg, backgroundColor: Colors.background },
  modalActions: { flexDirection: "row", justifyContent: "space-between", marginTop: Spacing.sm },
  cancelBtn: { flex: 1, padding: 14, borderRadius: Radius.medium, backgroundColor: Colors.divider, marginRight: Spacing.sm, alignItems: "center" },
  cancelBtnText: { color: Colors.textSecondary, fontWeight: FontWeight.semibold, fontSize: Typography.h5 },
  saveBtn: { flex: 1, padding: 14, borderRadius: Radius.medium, backgroundColor: Colors.primary, marginLeft: Spacing.sm, alignItems: "center" },
  saveBtnText: { color: Colors.surface, fontWeight: FontWeight.semibold, fontSize: Typography.h5 },
});
