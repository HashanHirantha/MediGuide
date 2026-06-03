import React from 'react';
import { router } from 'expo-router';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Image, Alert } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { TopBar } from '../../components/TopBar';
import { globalStyles } from '../../constants/globalStyles';
import { colors } from '../../constants/theme';

export default function SettingsScreen() {
  const { user, profile, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const firstName = profile?.first_name || 'User';
  const lastName = profile?.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <TopBar />
      <ScrollView style={globalStyles.container} contentContainerStyle={globalStyles.content}>

        {/* Profile Card */}
        <View style={globalStyles.profileCard}>
          <View style={globalStyles.avatarContainer}>
            {profile?.profile_image ? (
              <Image 
                source={{ uri: profile.profile_image }} 
                style={globalStyles.avatarLarge} 
              />
            ) : (
              <View style={[globalStyles.avatarLarge, { backgroundColor: colors.avatarPlaceholderBg, justifyContent: 'center', alignItems: 'center' }]}>
                <Feather name="user" size={40} color={colors.iconLight} />
              </View>
            )}
            <View style={globalStyles.editBadge}>
              <MaterialCommunityIcons name="pencil" size={12} color={colors.surface} />
            </View>
          </View>
          <View style={globalStyles.profileInfo}>
            <Text style={globalStyles.profileName}>{fullName}</Text>
            <Text style={globalStyles.profileTier}>VITALITY TIER: GOLD MEMBER</Text>
          </View>
        </View>

        {/* General Section */}
        <Text style={globalStyles.sectionTitle}>GENERAL</Text>
        <View style={globalStyles.card}>
          
          <TouchableOpacity style={globalStyles.row} onPress={() => router.push('/settings/profile')}>
            <View style={globalStyles.iconContainer}>
              <Feather name="user" size={20} color={colors.iconDark} />
            </View>
            <View style={globalStyles.rowTextContainer}>
              <Text style={globalStyles.rowTitle}>Profile Settings</Text>
              <Text style={globalStyles.rowSubtitle}>Manage your personal health data</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.iconLight} />
          </TouchableOpacity>

          <View style={[globalStyles.divider, { marginLeft: 72 }]} />

          <TouchableOpacity style={globalStyles.row} onPress={() => router.push('/settings/notifications')}>
            <View style={globalStyles.iconContainer}>
              <Feather name="bell" size={20} color={colors.iconDark} />
            </View>
            <View style={globalStyles.rowTextContainer}>
              <Text style={globalStyles.rowTitle}>Notifications</Text>
              <Text style={globalStyles.rowSubtitle}>Alerts, sounds, and health reminders</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.iconLight} />
          </TouchableOpacity>

          <View style={[globalStyles.divider, { marginLeft: 72 }]} />

          <TouchableOpacity style={globalStyles.row} onPress={() => router.push('/settings/security')}>
            <View style={globalStyles.iconContainer}>
              <Feather name="shield" size={20} color={colors.iconDark} />
            </View>
            <View style={globalStyles.rowTextContainer}>
              <Text style={globalStyles.rowTitle}>Security</Text>
              <Text style={globalStyles.rowSubtitle}>Biometrics and data encryption</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.iconLight} />
          </TouchableOpacity>

        </View>

        {/* Preference Section */}
        <Text style={globalStyles.sectionTitle}>PREFERENCE</Text>
        <View style={globalStyles.card}>
          
          <TouchableOpacity style={globalStyles.row}>
            <View style={globalStyles.iconContainer}>
              <Feather name="globe" size={20} color={colors.iconDark} />
            </View>
            <View style={globalStyles.rowTextContainer}>
              <Text style={globalStyles.rowTitle}>Language</Text>
              <Text style={globalStyles.rowSubtitle}>English (United States)</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.iconLight} />
          </TouchableOpacity>

          <View style={[globalStyles.divider, { marginLeft: 72 }]} />

          <TouchableOpacity style={globalStyles.row}>
            <View style={globalStyles.iconContainer}>
              <Feather name="help-circle" size={20} color={colors.iconDark} />
            </View>
            <View style={globalStyles.rowTextContainer}>
              <Text style={globalStyles.rowTitle}>Help/Support</Text>
              <Text style={globalStyles.rowSubtitle}>FAQ and contact center</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.iconLight} />
          </TouchableOpacity>

        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={globalStyles.signOutButton} onPress={handleSignOut}>
          <Text style={globalStyles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
