import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TopBar } from '../../components/TopBar';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { globalStyles } from '../../constants/globalStyles';
import { colors } from '../../constants/theme';

export default function ProfileSettingsScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setPhone(profile.phone || '');
      setDateOfBirth(profile.date_of_birth || '');
      setGender(profile.gender || '');
      setBloodGroup(profile.blood_group || '');
      setHeightCm(profile.height_cm?.toString() || '');
      setWeightKg(profile.weight_kg?.toString() || '');
    }
  }, [profile]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0] && user) {
      // Upload to Supabase Storage
      const uri = result.assets[0].uri;
      const ext = uri.split('.').pop() || 'jpg';
      const filePath = `${user.id}/avatar.${ext}`;
      const response = await fetch(uri);
      const blob = await response.blob();
      const { error } = await supabase.storage.from('avatars').upload(filePath, blob, { upsert: true });
      if (error) {
        Alert.alert('Upload Failed', error.message);
      } else {
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
        await supabase.from('profiles').update({ profile_image: urlData.publicUrl }).eq('id', user.id);
        refreshProfile();
        Alert.alert('Success', 'Profile photo updated!');
      }
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const h = parseFloat(heightCm);
    const w = parseFloat(weightKg);
    let bmi: number | undefined;
    if (!isNaN(h) && !isNaN(w) && h > 0 && w > 0) {
      bmi = parseFloat((w / ((h / 100) * (h / 100))).toFixed(2));
    }
    // First, check if the profile exists
    const { data: existingProfile, error: selectError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle(); // Use maybeSingle to avoid PGRST116 if no rows

    if (selectError) {
      setSaving(false);
      Alert.alert('Database Error', selectError.message);
      return;
    }

    // Only include columns that actually exist in the profiles table schema
    const payload = {
      first_name: firstName,
      last_name: lastName,
      phone,
      date_of_birth: dateOfBirth || null,
      gender: gender || null,
      blood_group: bloodGroup || null,
    };

    let error;
    if (existingProfile) {
      const { error: updateError } = await supabase.from('profiles').update(payload).eq('id', user.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('profiles').insert({ id: user.id, ...payload });
      error = insertError;
    }
    setSaving(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      refreshProfile();
      Alert.alert('Saved', 'Your profile has been updated.');
    }
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <TopBar />
      <ScrollView contentContainerStyle={globalStyles.content}>
        <Text style={globalStyles.pageTitle}>Edit Profile</Text>
        <Text style={globalStyles.pageDescription}>Update your personal information and health data.</Text>

        {/* Avatar */}
        <View style={globalStyles.avatarWrapper}>
          <TouchableOpacity onPress={pickImage} style={globalStyles.avatarPickerContainer}>
            {profile?.profile_image ? (
              <Image source={{ uri: profile.profile_image }} style={globalStyles.avatarFull} />
            ) : (
              <View style={globalStyles.avatarPlaceholder}>
                <Feather name="camera" size={28} color={colors.iconLight} />
              </View>
            )}
          </TouchableOpacity>
          <Text style={globalStyles.avatarLabel}>Tap to change photo</Text>
        </View>

        <Input label="First Name" value={firstName} onChangeText={setFirstName} leftIcon="user" />
        <Input label="Last Name" value={lastName} onChangeText={setLastName} leftIcon="user" />
        <Input label="Email" value={user?.email || ''} editable={false} leftIcon="mail" />
        <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" leftIcon="phone" />
        <Input label="Date of Birth" value={dateOfBirth} onChangeText={setDateOfBirth} placeholder="YYYY-MM-DD" leftIcon="calendar" />
        <Input label="Gender" value={gender} onChangeText={setGender} placeholder="Male / Female / Other" leftIcon="users" />
        <Input label="Blood Group" value={bloodGroup} onChangeText={setBloodGroup} placeholder="A+, O-, etc." leftIcon="droplet" />
        <Input label="Height (cm)" value={heightCm} onChangeText={setHeightCm} keyboardType="numeric" leftIcon="maximize-2" />
        <Input label="Weight (kg)" value={weightKg} onChangeText={setWeightKg} keyboardType="numeric" leftIcon="activity" />

        <Button title={saving ? 'Saving...' : 'Save Changes'} onPress={handleSave} loading={saving} />
      </ScrollView>
    </SafeAreaView>
  );
}
