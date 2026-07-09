import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../../constants/globalStyles';
import { colors, spacing } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { getDoctorProfileByUserId, updateDoctorProfile } from '../../services/doctorService';

export default function DoctorProfile() {
  const { profile, signOut } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [specialty, setSpecialty] = useState('');
  const [qualification, setQualification] = useState('');
  const [hospital, setHospital] = useState('');
  const [fee, setFee] = useState('');
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (profile?.id) {
      loadProfile();
    }
  }, [profile?.id]);

  const loadProfile = async () => {
    try {
      const { data } = await getDoctorProfileByUserId(profile!.id);
      if (data) {
        setSpecialty(data.specialty || '');
        setQualification(data.qualification || '');
        setHospital(data.hospital_name || '');
        setFee(data.consultation_fee ? data.consultation_fee.toString() : '');
        setExperience(data.experience_years ? data.experience_years.toString() : '');
        setBio(data.bio || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await updateDoctorProfile(profile!.id, {
        specialty,
        qualification,
        hospital_name: hospital,
        consultation_fee: parseFloat(fee) || 0,
        experience_years: parseInt(experience, 10) || 0,
        bio: bio.trim(),
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Success', 'Profile updated successfully.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <SafeAreaView style={[globalStyles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView style={globalStyles.container} contentContainerStyle={globalStyles.content}>
        <Text style={globalStyles.pageTitle}>Professional Profile</Text>
        <Text style={globalStyles.pageDescription}>Update your public information shown to patients.</Text>
        
        <View style={{ marginTop: spacing.xl }}>
          <Text style={globalStyles.label}>Specialty</Text>
          <TextInput
            style={globalStyles.input}
            value={specialty}
            onChangeText={setSpecialty}
            placeholder="e.g. Cardiologist"
            placeholderTextColor={colors.textTertiary}
          />

          <Text style={globalStyles.label}>Qualifications</Text>
          <TextInput
            style={globalStyles.input}
            value={qualification}
            onChangeText={setQualification}
            placeholder="e.g. MD, FACC"
            placeholderTextColor={colors.textTertiary}
          />

          <Text style={globalStyles.label}>Hospital / Clinic Name</Text>
          <TextInput
            style={globalStyles.input}
            value={hospital}
            onChangeText={setHospital}
            placeholder="e.g. MediGuide Central Hospital"
            placeholderTextColor={colors.textTertiary}
          />

          <Text style={globalStyles.label}>Consultation Fee ($)</Text>
          <TextInput
            style={globalStyles.input}
            value={fee}
            onChangeText={setFee}
            placeholder="e.g. 150.00"
            keyboardType="decimal-pad"
            placeholderTextColor={colors.textTertiary}
          />

          <Text style={globalStyles.label}>Experience (Years)</Text>
          <TextInput
            style={globalStyles.input}
            value={experience}
            onChangeText={setExperience}
            placeholder="e.g. 15"
            keyboardType="number-pad"
            placeholderTextColor={colors.textTertiary}
          />

          <Text style={globalStyles.label}>About (Bio)</Text>
          <TextInput
            style={[globalStyles.input, { minHeight: 100, textAlignVertical: 'top' }]}
            value={bio}
            onChangeText={setBio}
            placeholder="Brief professional summary about yourself..."
            multiline
            numberOfLines={4}
            placeholderTextColor={colors.textTertiary}
          />

          <TouchableOpacity 
            style={[globalStyles.buttonPrimary, { marginTop: spacing.xl }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={globalStyles.buttonPrimaryText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.logoutSection}>
          <TouchableOpacity 
            style={globalStyles.signOutButton}
            onPress={signOut}
          >
            <Text style={globalStyles.signOutText}>Log Out</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  logoutSection: {
    marginTop: 60,
    marginBottom: spacing.xl,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.subtleBorder,
  }
});
