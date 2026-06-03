import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, SafeAreaView, Image } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { TopBar } from '../../components/TopBar';
import { globalStyles } from '../../constants/globalStyles';
import { colors } from '../../constants/theme';

export default function HomeScreen() {
  const { profile } = useAuth();
  
  // Use profile name if available, otherwise fallback to "Alex" to match the mockup
  const firstName = profile?.first_name || 'Alex';

  // Determine greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };
  const greeting = getGreeting();

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <TopBar />
      <ScrollView style={globalStyles.container} contentContainerStyle={[globalStyles.content, { paddingBottom: 100 }]}>
        
        {/* Greeting */}
        <Text style={globalStyles.greetingTitle}>{greeting}, {firstName}</Text>
        <Text style={globalStyles.greetingSubtitle}>Your heart vitality is at 94% today.</Text>

        {/* Search */}
        <View style={globalStyles.searchContainer}>
          <Feather name="search" size={20} color={colors.iconLight} style={globalStyles.searchIcon} />
          <TextInput
            style={globalStyles.searchInput}
            placeholder="Search doctors or programs..."
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
          <Text style={globalStyles.homeCardTitle}>Disease{'\n'}Prediction</Text>
          <Text style={globalStyles.homeCardSubtitle}>AI ANALYSIS</Text>
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
          <Text style={globalStyles.homeCardTitle}>Book a Doctor</Text>
          <Text style={globalStyles.homeCardSubtitle}>24/7 AVAILABILITY</Text>
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
