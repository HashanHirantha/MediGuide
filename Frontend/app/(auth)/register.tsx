import { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { colors, typography, spacing } from '../../constants/theme';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { globalStyles } from '../../constants/globalStyles';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [profileImageUri, setProfileImageUri] = useState('');
  
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dobDate, setDobDate] = useState(new Date());
  
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ];

  const { signUp } = useAuth();

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDobDate(selectedDate);
      setDateOfBirth(selectedDate.toISOString().split('T')[0]);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError('Media library permission not granted.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.[0]) {
      setProfileImageUri(result.assets[0].uri);
    }
  };

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreed) {
      setError('You must agree to the Terms of Service.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    
    const first = firstName.trim();
    const last = lastName.trim();
    
    let heightCm = parseFloat(height);
    let weightKg = parseFloat(weight);
    let bmi: number | undefined;

    if (!isNaN(heightCm) && !isNaN(weightKg) && heightCm > 0 && weightKg > 0) {
      const heightM = heightCm / 100;
      bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(2));
    } else {
      heightCm = undefined as any;
      weightKg = undefined as any;
    }
    
    const { error: signUpError, imageError } = await signUp(email, password, { 
      firstName: first, 
      lastName: last,
      phone,
      dateOfBirth,
      gender,
      bloodGroup,
      profileImageUri,
      heightCm,
      weightKg,
      bmi
    });
    if (signUpError) {
      setError(signUpError.message);
      Alert.alert('Registration Failed', signUpError.message);
    } else {
      if (imageError) {
        Alert.alert(
          'Account Created',
          `Your account was created successfully, but the profile image could not be uploaded: ${imageError}. You can upload it later from your profile settings.`,
          [{ text: 'OK', onPress: () => router.replace('/(tabs)/home') }]
        );
      } else {
        Alert.alert(
          'Welcome to MediGuide!',
          'Your account has been created successfully.',
          [{ text: 'Get Started', onPress: () => router.replace('/(tabs)/home') }]
        );
      }
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={globalStyles.authContainerAlt}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={globalStyles.authScroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={globalStyles.authHeaderCompact}>
          <TouchableOpacity onPress={() => router.back()} style={globalStyles.authIconButton}>
            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={globalStyles.authLogoText}>MediGuide</Text>
          <TouchableOpacity style={[globalStyles.authIconButton, globalStyles.authUserIconBg]}>
            <Feather name="user" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Title Area */}
        <View style={globalStyles.authTitleAreaCompact}>
          <Text style={globalStyles.authTitlePlain}>Create Account</Text>
          <Text style={globalStyles.authSubtitle}>Join our wellness community and start your healing journey today.</Text>
        </View>

        {error ? <Text style={globalStyles.authError}>{error}</Text> : null}

        {/* Form Card */}
        <View style={globalStyles.authCardPadded}>
          <View style={globalStyles.avatarWrapper}>
            <TouchableOpacity onPress={pickImage} style={globalStyles.avatarPickerContainer}>
              {profileImageUri ? (
                <Image source={{ uri: profileImageUri }} style={globalStyles.avatarFull} />
              ) : (
                <View style={globalStyles.avatarPlaceholder}>
                  <Feather name="camera" size={24} color={colors.textSecondary} />
                </View>
              )}
            </TouchableOpacity>
            <Text style={globalStyles.avatarLabel}>Profile Photo (Optional)</Text>
          </View>

          <View style={globalStyles.formRow}>
            <Input 
              label="First Name" 
              value={firstName} 
              onChangeText={setFirstName} 
              placeholder="Hashan" 
              leftIcon="user"
              style={globalStyles.flexHalf}
            />
            <View style={globalStyles.spacer} />
            <Input 
              label="Last Name" 
              value={lastName} 
              onChangeText={setLastName} 
              placeholder="Hiranta" 
              leftIcon="user"
              style={globalStyles.flexHalf}
            />
          </View>
          <Input
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="you@example.com"
            leftIcon="mail"
          />
          <Input
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="+94 70 567 8900"
            leftIcon="phone"
          />
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ width: '100%' }}>
            <View pointerEvents="box-only" style={{ width: '100%' }}>
              <Input
                label="Date of Birth"
                value={dateOfBirth}
                editable={false}
                placeholder="Select Date"
                leftIcon="calendar"
              />
            </View>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dobDate}
              mode="date"
              display="default"
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}
          
          <TouchableOpacity onPress={() => setShowGenderPicker(true)} style={{ width: '100%' }}>
            <View pointerEvents="box-only" style={{ width: '100%' }}>
              <Input
                label="Gender"
                value={gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : ''}
                editable={false}
                placeholder="Select Gender"
                leftIcon="users"
              />
            </View>
          </TouchableOpacity>

          <Modal visible={showGenderPicker} transparent animationType="slide">
            <TouchableOpacity style={globalStyles.modalOverlay} onPress={() => setShowGenderPicker(false)} activeOpacity={1}>
              <View style={globalStyles.modalContent}>
                <Text style={globalStyles.modalTitle}>Select Gender</Text>
                {genderOptions.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={globalStyles.modalOption}
                    onPress={() => {
                      setGender(option.value);
                      setShowGenderPicker(false);
                    }}
                  >
                    <Text style={[
                      globalStyles.modalOptionText,
                      gender === option.value && globalStyles.modalOptionTextSelected
                    ]}>
                      {option.label}
                    </Text>
                    {gender === option.value && <Feather name="check" size={20} color={colors.primary} />}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>

          <Input
            label="Blood Group"
            value={bloodGroup}
            onChangeText={setBloodGroup}
            placeholder="A+, O-, etc."
            leftIcon="droplet"
          />
          
          <Input
            label="Height (cm)"
            value={height}
            onChangeText={setHeight}
            placeholder="e.g. 175"
            keyboardType="numeric"
            leftIcon="maximize-2"
          />
          
          <Input
            label="Weight (kg)"
            value={weight}
            onChangeText={setWeight}
            placeholder="e.g. 70"
            keyboardType="numeric"
            leftIcon="activity"
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            leftIcon="lock"
          />
          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="••••••••"
            leftIcon="shield"
          />

          <TouchableOpacity style={globalStyles.checkboxContainer} onPress={() => setAgreed(!agreed)} activeOpacity={0.8}>
            <View style={[globalStyles.checkbox, agreed && globalStyles.checkboxChecked]}>
              {agreed && <Feather name="check" size={14} color={colors.surface} />}
            </View>
            <Text style={globalStyles.checkboxText}>
              I agree to the <Text style={globalStyles.boldText}>Terms of Service</Text> and <Text style={globalStyles.boldText}>Privacy Policy</Text> regarding my medical data.
            </Text>
          </TouchableOpacity>

          <Button 
            title="Create Account" 
            onPress={handleRegister} 
            loading={loading} 
            variant="black"
            shape="pill"
            style={globalStyles.authSignInBtn}
          />
        </View>

        {/* Footer */}
        <View style={globalStyles.authFooterCentered}>
          <Text style={[globalStyles.authFooterText, { marginBottom: spacing.md }]}>Already have an account?</Text>
          <Button 
            title="Log In" 
            onPress={() => router.push('/(auth)/login')} 
            variant="outline"
            shape="pill"
            style={{ paddingHorizontal: spacing.xxl, borderColor: colors.border }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
