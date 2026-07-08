import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDoctors } from '../../hooks/useDoctors';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { colors, typography, spacing, radius } from '../../constants/theme';
import { Avatar } from '../../components/ui/Avatar';
import { TopBar } from '../../components/TopBar';
import { globalStyles } from '../../constants/globalStyles';
import { getDoctorImageUrl } from '../../utils/getDoctorImageUrl';
import i18n from '../../i18n';

const SPECIALTIES = ['All Doctors', 'Cardiologist', 'Neurologist', 'General Medicine'];

const MOCK_DOCTORS = [
  {
    id: '1',
    profiles: { first_name: 'Sarah', last_name: 'Jenkins', profile_image: 'https://i.pravatar.cc/150?img=47' },
    average_rating: 4.9,
    specialty: 'Cardiologist',
    experience_years: 15,
  },
  {
    id: '2',
    profiles: { first_name: 'Michael', last_name: 'Chen', profile_image: 'https://i.pravatar.cc/150?img=11' },
    average_rating: 4.8,
    specialty: 'Neurologist',
    experience_years: 12,
  },
  {
    id: '3',
    profiles: { first_name: 'Emily', last_name: 'Davis', profile_image: 'https://i.pravatar.cc/150?img=32' },
    average_rating: 4.7,
    specialty: 'General Medicine',
    experience_years: 8,
  },
];
export default function DoctorsScreen() {
  const { doctors, loading, fetchDoctors } = useDoctors();
  const [activeSpecialty, setActiveSpecialty] = useState('All Doctors');

  useEffect(() => {
    fetchDoctors(activeSpecialty === 'All Doctors' ? undefined : activeSpecialty);
  }, [activeSpecialty]);

  const getSpecialtyTranslation = (specialty: string) => {
    switch (specialty) {
      case 'All Doctors': return i18n.t('doctors.all_doctors') || 'All Doctors';
      case 'Cardiologist': return i18n.t('doctors.cardiologist') || 'Cardiologist';
      case 'Neurologist': return i18n.t('doctors.neurologist') || 'Neurologist';
      case 'General Medicine': return i18n.t('doctors.general_medicine') || 'General Medicine';
      default: return specialty;
    }
  };



  const renderTitle = () => (
    <View style={globalStyles.titleContainer}>
      <Text style={globalStyles.pageTitle}>{i18n.t('doctors.title') || 'Find Your Specialist'}</Text>
      <Text style={globalStyles.pageDescription}>
        {i18n.t('doctors.desc') || 'Consult with our world-class medical professionals specializing in cardiac vitality and neurological flow.'}
      </Text>
    </View>
  );

  const renderFilters = () => (
    <FlatList
      data={SPECIALTIES}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item}
      contentContainerStyle={globalStyles.filterList}
      renderItem={({ item }) => {
        const isActive = activeSpecialty === item;
        return (
          <TouchableOpacity
            style={[globalStyles.filterChip, isActive ? globalStyles.filterChipActive : globalStyles.filterChipInactive]}
            onPress={() => setActiveSpecialty(item)}
            activeOpacity={0.8}
          >
            <Text style={[globalStyles.filterText, isActive ? globalStyles.filterTextActive : globalStyles.filterTextInactive]}>
              {getSpecialtyTranslation(item)}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );

  const renderDoctor = ({ item, index }: { item: any; index: number }) => {
    const name = `Dr. ${item.profiles?.first_name ?? ''} ${item.profiles?.last_name ?? ''}`;
    
    if (index === 0) {
      return (
        <TouchableOpacity 
          style={globalStyles.featuredCard} 
          onPress={() => router.push(`/doctors/${item.id}`)}
          activeOpacity={0.9}
        >
          <View style={globalStyles.featuredTop}>
            <Image 
              source={{ uri: getDoctorImageUrl(item) }} 
              style={globalStyles.featuredImage} 
            />
            <View style={globalStyles.featuredInfo}>
              <View style={globalStyles.featuredNameRow}>
                <Text style={globalStyles.featuredName}>{item.profiles?.first_name} {item.profiles?.last_name}</Text>
                <View style={globalStyles.ratingBadge}>
                  <Ionicons name="star-outline" size={14} color={colors.black} />
                  <Text style={globalStyles.ratingText}>{item.average_rating?.toFixed(1) || '4.9'}</Text>
                </View>
              </View>
              <View style={globalStyles.specialtyBadge}>
                <Text style={globalStyles.specialtyText}>
                  {getSpecialtyTranslation(item.specialty || 'Cardiologist').toUpperCase()}
                </Text>
              </View>
              <Text style={globalStyles.featuredBio} numberOfLines={2}>
                {item.bio || `${item.profiles?.first_name} is an experienced specialist dedicated to providing exceptional patient care and advanced treatments.`}
              </Text>
            </View>
          </View>
          
          <View style={globalStyles.statsRow}>
            <View style={globalStyles.statBox}>
              <Text style={globalStyles.statLabel}>{i18n.t('doctors.next_slot') || 'NEXT SLOT'}</Text>
              <Text style={globalStyles.statValue}>Today, 14:30</Text>
            </View>
            <View style={globalStyles.statBox}>
              <Text style={globalStyles.statLabel}>{i18n.t('doctors.experience') || 'EXPERIENCE'}</Text>
              <Text style={globalStyles.statValue}>{item.experience_years || 15} {i18n.t('doctors.years') || 'Years'}</Text>
            </View>
          </View>

          <TouchableOpacity style={globalStyles.buttonPrimary} onPress={() => router.push({ pathname: '/doctors/book', params: { doctorId: item.id } })}>
            <Text style={globalStyles.buttonPrimaryText}>{i18n.t('doctors.book_now') || 'Book Now'}</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity 
        style={globalStyles.compactCard}
        onPress={() => router.push(`/doctors/${item.id}`)}
        activeOpacity={0.9}
      >
        <Image 
          source={{ uri: getDoctorImageUrl(item) }} 
          style={globalStyles.compactImage} 
        />
        <View style={globalStyles.compactInfo}>
          <Text style={globalStyles.compactName}>{item.profiles?.first_name} {item.profiles?.last_name}</Text>
          <Text style={globalStyles.compactSpecialty}>
            {getSpecialtyTranslation(item.specialty || 'Neurologist').toUpperCase()}
          </Text>
          <View style={globalStyles.compactRating}>
            <Ionicons name="star-outline" size={12} color={colors.black} />
            <Text style={globalStyles.compactRatingText}>{item.average_rating?.toFixed(1) || '4.8'}</Text>
          </View>
        </View>
        <TouchableOpacity style={globalStyles.bookButtonSmall} onPress={() => router.push({ pathname: '/doctors/book', params: { doctorId: item.id } })}>
          <Text style={globalStyles.bookButtonSmallText}>{i18n.t('doctors.book') || 'Book'}</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <TopBar />
      
      <FlatList
        ListHeaderComponent={
          <>
            {renderTitle()}
            {renderFilters()}
          </>
        }
        data={doctors.length > 0 ? doctors : MOCK_DOCTORS.filter(d => activeSpecialty === 'All Doctors' || d.specialty === activeSpecialty)}
        keyExtractor={(item) => item.id}
        renderItem={renderDoctor}
        contentContainerStyle={globalStyles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? <LoadingSpinner /> : <Text style={globalStyles.emptyText}>{i18n.t('doctors.no_doctors') || 'No doctors found.'}</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
  },
});
