import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { globalStyles } from '../constants/globalStyles';
import { colors } from '../constants/theme';

export function TopBar() {
  const { profile } = useAuth();
  
  return (
    <View style={globalStyles.topBarHeader}>
      <TouchableOpacity onPress={() => router.back()} style={globalStyles.topBarIcon}>
        <Feather name="arrow-left" size={24} color={colors.iconLight} />
      </TouchableOpacity>
      
      <Text style={globalStyles.topBarTitle}>MediGuide</Text>
      
      <TouchableOpacity onPress={() => router.push('/settings/profile')}>
        {profile?.profile_image ? (
          <Image 
            source={{ uri: profile.profile_image }} 
            style={globalStyles.topBarAvatar} 
          />
        ) : (
          <View style={[globalStyles.topBarAvatar, { backgroundColor: colors.avatarPlaceholderBg, justifyContent: 'center', alignItems: 'center' }]}>
            <Feather name="user" size={20} color={colors.iconLight} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
