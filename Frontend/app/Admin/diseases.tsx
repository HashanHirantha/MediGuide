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
      case 'critical': return '#EF4444';
      case 'high': return '#F97316';
      case 'moderate': return '#EAB308';
      default: return '#22C55E';
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
          <Ionicons name="pencil-outline" size={20} color="#2563EB" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item)}>
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Ionicons name="menu" size={30} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Diseases</Text>
        <TouchableOpacity onPress={openAddModal}>
          <Ionicons name="add-circle-outline" size={30} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
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
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#1E293B" },
  listContainer: { padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 },
  card: { backgroundColor: "#FFF", borderRadius: 16, padding: 16, marginBottom: 12, elevation: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardInfo: { flex: 1, marginRight: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  name: { fontSize: 16, fontWeight: "600", color: "#1E293B", flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  badgeText: { fontSize: 10, fontWeight: "700" },
  specialty: { fontSize: 13, color: "#2563EB", fontWeight: "600" },
  desc: { fontSize: 13, color: "#64748B", marginTop: 6 },
  actionButtons: { flexDirection: "row", gap: 12 },
  actionBtn: { padding: 8, backgroundColor: "#F1F5F9", borderRadius: 8 },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalContent: { width: "100%", backgroundColor: "#FFF", borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#1E293B", marginBottom: 20, textAlign: "center" },
  label: { fontSize: 14, fontWeight: "600", color: "#475569", marginBottom: 8 },
  input: { borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, padding: 12, fontSize: 16, marginBottom: 16, backgroundColor: "#F8FAFC" },
  modalActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: "#F1F5F9", marginRight: 8, alignItems: "center" },
  cancelBtnText: { color: "#475569", fontWeight: "600", fontSize: 16 },
  saveBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: "#2563EB", marginLeft: 8, alignItems: "center" },
  saveBtnText: { color: "#FFF", fontWeight: "600", fontSize: 16 },
});
