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
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { DrawerActions } from "@react-navigation/native";
import { getAdminDoctors, createDoctorAdmin } from "../../services/adminService";
import { globalStyles } from "../../constants/globalStyles";
import { colors, spacing, typography, radius, shadows } from "../../constants/theme";
import { Input } from "../../components/ui/Input";

export default function AdminDoctorsScreen() {
  const navigation = useNavigation();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [registrationNo, setRegistrationNo] = useState('');
  const [qualification, setQualification] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [consultationFee, setConsultationFee] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    const { data } = await getAdminDoctors();
    if (data) setDoctors(data);
    setLoading(false);
  };

  const handleAddDoctor = async () => {
    if (!firstName || !lastName || !email || !password || !specialty || !registrationNo) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    const { error } = await createDoctorAdmin({
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      specialty,
      registration_no: registrationNo,
      qualification,
      hospital_name: hospitalName,
      experience_years: experienceYears ? parseInt(experienceYears, 10) : 0,
      consultation_fee: consultationFee ? parseInt(consultationFee, 10) : 0
    });
    setSubmitting(false);

    if (error) {
      Alert.alert('Error', error);
    } else {
      Alert.alert('Success', 'Doctor added successfully.');
      setModalVisible(false);
      resetForm();
      fetchDoctors();
    }
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setSpecialty('');
    setRegistrationNo('');
    setQualification('');
    setHospitalName('');
    setExperienceYears('');
    setConsultationFee('');
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.profiles?.first_name?.[0]?.toUpperCase() || 'D'}
          </Text>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.name}>
            Dr. {item.profiles?.first_name} {item.profiles?.last_name}
          </Text>
          <Text style={styles.specialty}>{item.specialty}</Text>
        </View>
        {item.is_verified ? (
           <Ionicons name="checkmark-circle" size={24} color={colors.successText} />
        ) : (
           <Ionicons name="time" size={24} color={colors.warningText} />
        )}
      </View>
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Ionicons name="mail-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{item.profiles?.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="business-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{item.hospital_name || 'N/A'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>Reg No: <Text style={{ fontWeight: '600' }}>{item.registration_no}</Text></Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Ionicons name="menu" size={30} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doctors List</Text>
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
              <Text style={styles.emptyText}>No doctors found.</Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={32} color={colors.surface} />
      </TouchableOpacity>

      {/* Add Doctor Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Doctor</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={28} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Input
                label="First Name *"
                placeholder="John"
                value={firstName}
                onChangeText={setFirstName}
              />
              <Input
                label="Last Name *"
                placeholder="Doe"
                value={lastName}
                onChangeText={setLastName}
              />
              <Input
                label="Email *"
                placeholder="doctor@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Input
                label="Password *"
                placeholder="Temporary Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <Input
                label="Specialty *"
                placeholder="e.g. Cardiologist"
                value={specialty}
                onChangeText={setSpecialty}
              />
              <Input
                label="Registration Number *"
                placeholder="REG-12345"
                value={registrationNo}
                onChangeText={setRegistrationNo}
              />
              <Input
                label="Qualification"
                placeholder="e.g. MBBS, MD"
                value={qualification}
                onChangeText={setQualification}
              />
              <Input
                label="Hospital/Clinic Name"
                placeholder="e.g. City Hospital"
                value={hospitalName}
                onChangeText={setHospitalName}
              />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Experience (Years)"
                    placeholder="e.g. 5"
                    value={experienceYears}
                    onChangeText={setExperienceYears}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Fee (LKR)"
                    placeholder="e.g. 2000"
                    value={consultationFee}
                    onChangeText={setConsultationFee}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[globalStyles.buttonPrimary, { marginTop: 20, marginBottom: 40 }]}
                onPress={handleAddDoctor}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={globalStyles.buttonPrimaryText}>Add Doctor</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: globalStyles.container,
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: spacing.lg, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: typography.h2.fontSize, fontWeight: '700', color: colors.textPrimary },
  listContainer: { padding: spacing.lg, paddingBottom: 100 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 },
  emptyText: { color: colors.textSecondary, fontSize: 18, fontWeight: '600' },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg, ...shadows.card },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing.md },
  avatar: { width: 50, height: 50, borderRadius: radius.full, backgroundColor: colors.border, justifyContent: "center", alignItems: "center", marginRight: spacing.md },
  avatarText: { fontSize: 22, fontWeight: '700', color: colors.textSecondary },
  titleContainer: { flex: 1 },
  name: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
  specialty: { fontSize: typography.body.fontSize, color: colors.primary, fontWeight: '500', marginTop: 2 },
  detailsContainer: { backgroundColor: colors.surfaceAlt, padding: spacing.md, borderRadius: radius.md },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing.xs, gap: spacing.sm },
  detailText: { color: colors.textSecondary, fontSize: typography.caption.fontSize, flex: 1 },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.fab,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.surface
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary
  },
  modalContent: {
    padding: 20,
  }
});
