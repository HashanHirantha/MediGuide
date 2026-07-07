import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { TopBar } from '../../components/TopBar';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { globalStyles } from '../../constants/globalStyles';
import { colors } from '../../constants/theme';
import i18n from '../../i18n';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

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
      mediaTypes: ['images'],
      allowsEditing: true, aspect: [1, 1], quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0] && user) {
      try {
        // Upload to Supabase Storage using base64 to avoid 0-byte blob bug in React Native
        const uri = result.assets[0].uri;
        const ext = uri.split('.').pop() || 'jpg';
        const filePath = `${user.id}/avatar.${ext}`;
        
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        const arrayBuffer = decode(base64);

        const { error } = await supabase.storage.from('patients').upload(filePath, arrayBuffer, { 
          upsert: true,
          contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`
        });

        if (error) {
          Alert.alert('Upload Failed', error.message);
        } else {
          const { data: urlData } = supabase.storage.from('patients').getPublicUrl(filePath);
          // Append a timestamp to bypass React Native's aggressive image caching
          const imageUrl = `${urlData.publicUrl}?t=${Date.now()}`;
          await supabase.from('profiles').update({ profile_image: imageUrl }).eq('id', user.id);
          refreshProfile();
          Alert.alert('Success', 'Profile photo updated!');
        }
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to process image');
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
      height_cm: isNaN(h) ? null : h,
      weight_kg: isNaN(w) ? null : w,
      bmi: bmi || null,
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
        <Text style={globalStyles.pageTitle}>{i18n.t('settings.edit_profile') || 'Edit Profile'}</Text>
        <Text style={globalStyles.pageDescription}>{i18n.t('settings.profile_settings_desc') || 'Update your personal information and health data.'}</Text>

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
          <Text style={globalStyles.avatarLabel}>{i18n.t('profile.tap_photo') || 'Tap to change photo'}</Text>
        </View>

        <Input label={i18n.t('profile.first_name') || "First Name"} value={firstName} onChangeText={setFirstName} leftIcon="user" />
        <Input label={i18n.t('profile.last_name') || "Last Name"} value={lastName} onChangeText={setLastName} leftIcon="user" />
        <Input label="Email" value={user?.email || ''} editable={false} leftIcon="mail" />
        <Input label={i18n.t('profile.phone') || "Phone"} value={phone} onChangeText={setPhone} keyboardType="phone-pad" leftIcon="phone" />
        <Input label="Date of Birth" value={dateOfBirth} onChangeText={setDateOfBirth} placeholder="YYYY-MM-DD" leftIcon="calendar" />
        <Input label="Gender" value={gender} onChangeText={setGender} placeholder="Male / Female / Other" leftIcon="users" />
        <Input label={i18n.t('profile.blood_group') || "Blood Group"} value={bloodGroup} onChangeText={setBloodGroup} placeholder="A+, O-, etc." leftIcon="droplet" />
        <Input label="Height (cm)" value={heightCm} onChangeText={setHeightCm} keyboardType="numeric" leftIcon="maximize-2" />
        <Input label="Weight (kg)" value={weightKg} onChangeText={setWeightKg} keyboardType="numeric" leftIcon="activity" />

        <Button title={saving ? 'Saving...' : (i18n.t('profile.save') || 'Save Changes')} onPress={handleSave} loading={saving} />
      </ScrollView>
    </SafeAreaView>
  );
}
