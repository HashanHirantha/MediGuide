import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { TopBar } from '../../components/TopBar';
import { globalStyles } from '../../constants/globalStyles';
import { colors } from '../../constants/theme';
import i18n from '../../i18n';
import { useLanguage } from '../../contexts/LanguageContext';

export default function HomeScreen() {
  const { profile } = useAuth();
  const { locale } = useLanguage();
  
  // Use profile name if available, formatted with a comma
  const firstName = profile?.first_name ? `, ${profile.first_name}` : '';

  // Determine greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return i18n.t('home.greeting_morning');
    if (hour < 18) return i18n.t('home.greeting_afternoon');
    return i18n.t('home.greeting_evening');
  };
  const greeting = getGreeting();

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <TopBar />
      <ScrollView style={globalStyles.container} contentContainerStyle={[globalStyles.content, { paddingBottom: 100 }]}>
        
        {/* Greeting */}
        <Text style={globalStyles.greetingTitle}>{greeting}{firstName}</Text>
        <Text style={globalStyles.greetingSubtitle}>{i18n.t('home.how_are_you')}</Text>

        {/* Search */}
        <View style={globalStyles.searchContainer}>
          <Feather name="search" size={20} color={colors.iconLight} style={globalStyles.searchIcon} />
          <TextInput
            style={globalStyles.searchInput}
            placeholder={i18n.t('home.search_placeholder')}
            placeholderTextColor={colors.iconLight}
          />
        </View>

        {/* Card: Disease Prediction */}
        <TouchableOpacity 
          style={globalStyles.homeCard} 
          activeOpacity={0.8} 
          onPress={() => router.push('/(tabs)/check')}
        >
          <MaterialCommunityIcons 
            name="file-document-edit-outline" 
            size={32} 
            color={colors.iconDark} 
            style={globalStyles.homeCardIcon} 
          />
          <Text style={globalStyles.homeCardTitle}>{i18n.t('home.check_symptoms')}</Text>
          <Text style={globalStyles.homeCardSubtitle}>{i18n.t('home.check_symptoms_desc')}</Text>
        </TouchableOpacity>

        {/* Card: Book a Doctor */}
        <TouchableOpacity 
          style={globalStyles.homeCard} 
          activeOpacity={0.8} 
          onPress={() => router.push('/(tabs)/doctors')}
        >
          <MaterialCommunityIcons 
            name="medical-bag" 
            size={32} 
            color={colors.iconDark} 
            style={globalStyles.homeCardIcon} 
          />
          <Text style={globalStyles.homeCardTitle}>{i18n.t('home.find_doctor')}</Text>
          <Text style={globalStyles.homeCardSubtitle}>{i18n.t('home.find_doctor_desc')}</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={globalStyles.fab}>
        <Feather name="plus" size={28} color={colors.surface} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
});
