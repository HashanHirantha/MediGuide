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
import { globalStyles } from "../../constants/globalStyles";
import { colors, spacing, typography, radius, shadows } from "../../constants/theme";

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
          <Ionicons name="pencil-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item)}>
          <Ionicons name="trash-outline" size={20} color={colors.dangerText} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Ionicons name="menu" size={30} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Symptoms</Text>
        <TouchableOpacity onPress={openAddModal}>
          <Ionicons name="add-circle-outline" size={30} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
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
  container: globalStyles.container,
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: spacing.lg, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: typography.h2.fontSize, fontWeight: '700', color: colors.textPrimary },
  listContainer: { padding: spacing.lg },
  center: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadows.card, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardInfo: { flex: 1, marginRight: spacing.md },
  name: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  bodyPart: { fontSize: typography.caption.fontSize, color: colors.primary, fontWeight: '600', marginTop: 2 },
  desc: { fontSize: typography.caption.fontSize, color: colors.textSecondary, marginTop: 4 },
  actionButtons: { flexDirection: "row", gap: spacing.md },
  actionBtn: { padding: spacing.sm, backgroundColor: colors.surfaceAlt, borderRadius: radius.sm },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: "center", alignItems: "center", padding: spacing.lg },
  modalContent: { width: "100%", backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg },
  modalTitle: { fontSize: typography.h2.fontSize, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xl, textAlign: "center" },
  label: { fontSize: typography.body.fontSize, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.sm },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, fontSize: 16, marginBottom: spacing.lg, backgroundColor: colors.background },
  modalActions: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.sm },
  cancelBtn: { flex: 1, padding: 14, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, marginRight: spacing.sm, alignItems: "center" },
  cancelBtnText: { color: colors.textSecondary, fontWeight: '600', fontSize: 16 },
  saveBtn: { flex: 1, padding: 14, borderRadius: radius.md, backgroundColor: colors.primary, marginLeft: spacing.sm, alignItems: "center" },
  saveBtnText: { color: colors.surface, fontWeight: '600', fontSize: 16 },
});
