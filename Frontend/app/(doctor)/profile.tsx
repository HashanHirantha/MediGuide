import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../../constants/globalStyles';
import { colors, spacing } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { getDoctorProfileByUserId, updateDoctorProfile } from '../../services/doctorService';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

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
          <Input
            label="Specialty"
            value={specialty}
            onChangeText={setSpecialty}
            placeholder="e.g. Cardiologist"
            leftIcon="briefcase"
          />

          <Input
            label="Qualifications"
            value={qualification}
            onChangeText={setQualification}
            placeholder="e.g. MD, FACC"
            leftIcon="award"
          />

          <Input
            label="Hospital / Clinic Name"
            value={hospital}
            onChangeText={setHospital}
            placeholder="e.g. MediGuide Central Hospital"
            leftIcon="map-pin"
          />

          <Input
            label="Consultation Fee ($)"
            value={fee}
            onChangeText={setFee}
            placeholder="e.g. 150.00"
            keyboardType="decimal-pad"
            leftIcon="dollar-sign"
          />

          <Input
            label="Experience (Years)"
            value={experience}
            onChangeText={setExperience}
            placeholder="e.g. 15"
            keyboardType="number-pad"
            leftIcon="clock"
          />

          <Input
            label="About (Bio)"
            value={bio}
            onChangeText={setBio}
            placeholder="Brief professional summary about yourself..."
            multiline
            numberOfLines={4}
            leftIcon="info"
            style={{ minHeight: 100 }}
          />

          <View style={{ marginTop: spacing.md }}>
            <Button
              title="Save Changes"
              onPress={handleSave}
              loading={saving}
            />
          </View>
        </View>

        <View style={styles.logoutSection}>
          <Button
            title="Log Out"
            onPress={signOut}
            variant="danger"
            shape="pill"
          />
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
