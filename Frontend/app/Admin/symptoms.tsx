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
import { getSymptoms, addSymptom, updateSymptom, deleteSymptom } from "../../services/symptomService";
import { Colors, Typography, Spacing, Radius, Shadow, Layout, AppStyles, FontWeight } from "../../constants/AdminTheme";

export default function SymptomsScreen() {
  const navigation = useNavigation();
  const [symptoms, setSymptoms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [bodyPart, setBodyPart] = useState("Whole Body");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchSymptoms();
  }, []);

  const fetchSymptoms = async () => {
    setLoading(true);
    const { data } = await getSymptoms();
    if (data) setSymptoms(data);
    setLoading(false);
  };

  const openAddModal = () => {
    setEditingId(null);
    setName("");
    setBodyPart("Whole Body");
    setDescription("");
    setModalVisible(true);
  };

  const openEditModal = (symptom: any) => {
    setEditingId(symptom.id);
    setName(symptom.name);
    setBodyPart(symptom.body_part || "Whole Body");
    setDescription(symptom.description || "");
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Name is required");
      return;
    }

    if (editingId) {
      const { error } = await updateSymptom(editingId, name, bodyPart, description);
      if (!error) {
        setModalVisible(false);
        fetchSymptoms();
      } else {
        Alert.alert("Error", "Failed to update symptom.");
      }
    } else {
      const { error } = await addSymptom(name, bodyPart, description);
      if (!error) {
        setModalVisible(false);
        fetchSymptoms();
      } else {
        Alert.alert("Error", "Failed to add symptom.");
      }
    }
  };

  const handleDelete = (symptom: any) => {
    Alert.alert(
      "Delete Symptom",
      `Are you sure you want to delete '${symptom.name}'?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const { error } = await deleteSymptom(symptom.id);
            if (!error) fetchSymptoms();
            else Alert.alert("Error", "Failed to delete symptom.");
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.bodyPart}>{item.body_part || "Whole Body"}</Text>
        {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
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
        <Text style={styles.headerTitle}>Symptoms</Text>
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
          data={symptoms}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingId ? "Edit Symptom" : "Add Symptom"}</Text>
            
            <Text style={styles.label}>Symptom Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Headache" />

            <Text style={styles.label}>Body Part</Text>
            <TextInput style={styles.input} value={bodyPart} onChangeText={setBodyPart} placeholder="e.g. Head" />

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
  name: { fontSize: Typography.h5, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  bodyPart: { fontSize: Typography.bodySmall, color: Colors.primary, fontWeight: FontWeight.semibold, marginTop: 2 },
  desc: { fontSize: Typography.bodySmall, color: Colors.textSecondary, marginTop: 4 },
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
