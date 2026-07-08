import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { colors, typography, spacing } from '../../constants/theme';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { globalStyles } from '../../constants/globalStyles';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    const { error: signInError, role } = await signIn(email, password);
    if (signInError) {
      setError(signInError.message);
    } else {
      if (role === 'doctor') {
        router.replace('/(doctor)/dashboard');
      } else {
        router.replace('/(tabs)/home');
      }
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={globalStyles.authContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={globalStyles.authScroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={globalStyles.authHeader}>
          <View style={globalStyles.authLogoContainer}>
            <Feather name="feather" size={24} color={colors.textPrimary} />
            <Text style={globalStyles.authLogoText}>MediGuide</Text>
          </View>
          <TouchableOpacity style={globalStyles.authHelpButton} onPress={() => router.push('/settings/help')}>
            <Feather name="help-circle" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Title Area */}
        <View style={globalStyles.authTitleArea}>
          <Text style={globalStyles.authTitle}>Welcome Back</Text>
          <Text style={globalStyles.authSubtitle}>Reinvigorate your vitality with mindful health care.</Text>
        </View>

        {error ? <Text style={globalStyles.authError}>{error}</Text> : null}

        {/* Form Card */}
        <View style={globalStyles.authCard}>
          <Input
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />

          <Link href="/(auth)/forgot-password" style={globalStyles.authForgotLink}>
            FORGOT PASSWORD?
          </Link>

          <Button 
            title="Sign In" 
            onPress={handleLogin} 
            loading={loading} 
            variant="black"
            shape="pill"
            style={globalStyles.authSignInBtn}
          />

          <View style={globalStyles.authDividerContainer}>
            <View style={globalStyles.authDividerLine} />
            <Text style={globalStyles.authDividerText}>OR CONTINUE WITH</Text>
            <View style={globalStyles.authDividerLine} />
          </View>

          <View style={globalStyles.authSocialContainer}>
            <TouchableOpacity style={globalStyles.authSocialButton}>
              <FontAwesome5 name="google" size={18} color={colors.textPrimary} />
              <Text style={globalStyles.authSocialText}>GOOGLE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={globalStyles.authSocialButton}>
              <FontAwesome5 name="apple" size={18} color={colors.textPrimary} />
              <Text style={globalStyles.authSocialText}>APPLE</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer Link */}
        <View style={globalStyles.authFooter}>
          <Text style={globalStyles.authFooterText}>New to MediGuide? </Text>
          <Link href="/(auth)/register" style={globalStyles.authLink}>
            Create an account
          </Link>
        </View>

        {/* Bottom Copyright */}
        <Text style={globalStyles.authCopyright}>© 2026 MEDIGUIDE WELLNESS SYSTEMS</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
