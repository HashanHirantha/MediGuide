import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { colors, typography, spacing } from '../../constants/theme';
import { globalStyles } from '../../constants/globalStyles';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async () => {
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    setError('');
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
    if (resetError) {
      setError(resetError.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={{ flex: 1, justifyContent: 'center', padding: spacing.lg }}>
        <Text style={[globalStyles.authTitlePlain, { marginBottom: spacing.xs }]}>Reset Password</Text>
        <Text style={[globalStyles.authSubtitle, { marginBottom: spacing.xl }]}>
          Enter your email and we'll send you a reset link.
        </Text>

        {sent ? (
          <View style={{ gap: spacing.md }}>
            <Text style={{ ...typography.body, color: colors.secondary, marginBottom: spacing.md }}>
              ✅ Password reset email sent! Check your inbox.
            </Text>
            <Button title="Back to Login" onPress={() => router.replace('/(auth)/login')} />
          </View>
        ) : (
          <>
            {error ? <Text style={globalStyles.authError}>{error}</Text> : null}
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="you@example.com"
            />
            <Button title="Send Reset Link" onPress={handleReset} loading={loading} />
            <Button
              title="Back to Login"
              onPress={() => router.back()}
              variant="outline"
            />
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
