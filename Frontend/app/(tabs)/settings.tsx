import React from 'react';
import { router } from 'expo-router';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { TopBar } from '../../components/TopBar';
import { globalStyles } from '../../constants/globalStyles';
import { colors } from '../../constants/theme';
import { useLanguage } from '../../contexts/LanguageContext';
import i18n from '../../i18n';

export default function SettingsScreen() {
  const { user, profile, signOut } = useAuth();
  const { locale } = useLanguage();

  const handleSignOut = () => {
    Alert.alert(i18n.t('settings.sign_out') || 'Sign Out', 'Are you sure you want to sign out?', [
      { text: i18n.t('history.cancel') || 'Cancel', style: 'cancel' },
      { text: i18n.t('settings.sign_out') || 'Sign Out', style: 'destructive', onPress: signOut },
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
          </View>
        </View>

        {/* General Section */}
        <Text style={globalStyles.sectionTitle}>{i18n.t('settings.general') || 'GENERAL'}</Text>
        <View style={globalStyles.card}>
          
          <TouchableOpacity style={globalStyles.row} onPress={() => router.push('/settings/profile')}>
            <View style={globalStyles.iconContainer}>
              <Feather name="user" size={20} color={colors.iconDark} />
            </View>
            <View style={globalStyles.rowTextContainer}>
              <Text style={globalStyles.rowTitle}>{i18n.t('settings.profile_settings') || 'Profile Settings'}</Text>
              <Text style={globalStyles.rowSubtitle}>{i18n.t('settings.profile_settings_desc') || 'Manage your personal health data'}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.iconLight} />
          </TouchableOpacity>

          <View style={[globalStyles.divider, { marginLeft: 72 }]} />

          <TouchableOpacity style={globalStyles.row} onPress={() => router.push('/settings/notifications')}>
            <View style={globalStyles.iconContainer}>
              <Feather name="bell" size={20} color={colors.iconDark} />
            </View>
            <View style={globalStyles.rowTextContainer}>
              <Text style={globalStyles.rowTitle}>{i18n.t('settings.notifications') || 'Notifications'}</Text>
              <Text style={globalStyles.rowSubtitle}>{i18n.t('settings.notifications_desc') || 'Alerts, sounds, and health reminders'}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.iconLight} />
          </TouchableOpacity>

          <View style={[globalStyles.divider, { marginLeft: 72 }]} />

          <TouchableOpacity style={globalStyles.row} onPress={() => router.push('/settings/security')}>
            <View style={globalStyles.iconContainer}>
              <Feather name="shield" size={20} color={colors.iconDark} />
            </View>
            <View style={globalStyles.rowTextContainer}>
              <Text style={globalStyles.rowTitle}>{i18n.t('settings.security') || 'Security'}</Text>
              <Text style={globalStyles.rowSubtitle}>{i18n.t('settings.security_desc') || 'Biometrics and data encryption'}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.iconLight} />
          </TouchableOpacity>

        </View>

        {/* Preference Section */}
        <Text style={globalStyles.sectionTitle}>{i18n.t('settings.preference') || 'PREFERENCE'}</Text>
        <View style={globalStyles.card}>
          
          <TouchableOpacity style={globalStyles.row} onPress={() => router.push('/settings/language')}>
            <View style={globalStyles.iconContainer}>
              <Feather name="globe" size={20} color={colors.iconDark} />
            </View>
            <View style={globalStyles.rowTextContainer}>
              <Text style={globalStyles.rowTitle}>{i18n.t('settings.language') || 'Language'}</Text>
              <Text style={globalStyles.rowSubtitle}>
                {locale === 'si' ? 'සිංහල (Sinhala)' : locale === 'ta' ? 'தமிழ் (Tamil)' : 'English (United States)'}
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.iconLight} />
          </TouchableOpacity>

          <View style={[globalStyles.divider, { marginLeft: 72 }]} />

          <TouchableOpacity style={globalStyles.row} onPress={() => router.push('/settings/help')}>
            <View style={globalStyles.iconContainer}>
              <Feather name="help-circle" size={20} color={colors.iconDark} />
            </View>
            <View style={globalStyles.rowTextContainer}>
              <Text style={globalStyles.rowTitle}>{i18n.t('settings.help') || 'Help & Support'}</Text>
              <Text style={globalStyles.rowSubtitle}>{i18n.t('settings.help_desc') || 'FAQ and customer service'}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.iconLight} />
          </TouchableOpacity>

        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={globalStyles.signOutButton} onPress={handleSignOut}>
          <Text style={globalStyles.signOutText}>{i18n.t('settings.sign_out') || 'Sign Out'}</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
