import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDoctors } from '../../hooks/useDoctors';
import { getUniqueSpecialties } from '../../services/doctorService';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { colors, typography, spacing, radius } from '../../constants/theme';
import { Avatar } from '../../components/ui/Avatar';
import { TopBar } from '../../components/TopBar';
import { globalStyles } from '../../constants/globalStyles';
import { getDoctorImageUrl } from '../../utils/getDoctorImageUrl';
import i18n from '../../i18n';

export default function DoctorsScreen() {
  const { specialty } = useLocalSearchParams<{ specialty?: string }>();
  const { doctors, loading, fetchDoctors, locationFallback } = useDoctors();
  const [activeSpecialty, setActiveSpecialty] = useState(specialty || 'All Doctors');
  const [filterList, setFilterList] = useState<string[]>(['All Doctors']);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDoctors(activeSpecialty === 'All Doctors' ? undefined : activeSpecialty);
    setRefreshing(false);
  };

  useEffect(() => {
    const loadSpecialties = async () => {
      const unique = await getUniqueSpecialties();
      const list = ['All Doctors', ...unique];
      
      // If a specialty is passed via params that isn't in DB yet, add it
      if (specialty && !list.some((s) => s.toLowerCase() === specialty.toLowerCase())) {
        const formattedSpecialty = specialty.charAt(0).toUpperCase() + specialty.slice(1);
        list.push(formattedSpecialty);
      }
      setFilterList(list);
    };
    loadSpecialties();
  }, [specialty]);

  // Update activeSpecialty if the route param changes
  useEffect(() => {
    if (specialty) {
      const match = filterList.find(s => s.toLowerCase() === specialty.toLowerCase());
      setActiveSpecialty(match || specialty.charAt(0).toUpperCase() + specialty.slice(1));
    } else {
      setActiveSpecialty('All Doctors');
    }
  }, [specialty, filterList]);

  useEffect(() => {
    fetchDoctors(activeSpecialty === 'All Doctors' ? undefined : activeSpecialty);
  }, [activeSpecialty]);

  const getSpecialtyTranslation = (specialty: string) => {
    if (specialty === 'All Doctors') return i18n.t('doctors.all_doctors') || 'All Doctors';
    const key = `doctors.${specialty.toLowerCase().replace(/\s+/g, '_')}`;
    const translation = i18n.t(key);
    // If translation string contains 'missing' or is equal to the key, return the original string
    if (!translation || translation.includes('missing') || translation === key) {
      return specialty;
    }
    return translation;
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
      data={filterList}
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
                  <Text style={globalStyles.ratingText}>{(item.average_rating ?? 0).toFixed(1)}</Text>
                </View>
              </View>
              <View style={globalStyles.specialtyBadge}>
                <Text style={globalStyles.specialtyText}>
                  {getSpecialtyTranslation(item.specialty || 'General Practitioner').toUpperCase()}
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
            {item.distance_km !== undefined && (
              <View style={globalStyles.statBox}>
                <Text style={globalStyles.statLabel}>DISTANCE</Text>
                <Text style={globalStyles.statValue}>{item.distance_km.toFixed(1)} km</Text>
              </View>
            )}
            <View style={globalStyles.statBox}>
              <Text style={globalStyles.statLabel}>{i18n.t('doctors.experience') || 'EXPERIENCE'}</Text>
              <Text style={globalStyles.statValue}>{item.experience_years ?? 0} {i18n.t('doctors.years') || 'Years'}</Text>
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
            {getSpecialtyTranslation(item.specialty || 'General Practitioner').toUpperCase()}
          </Text>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            <View style={globalStyles.compactRating}>
              <Ionicons name="star-outline" size={12} color={colors.black} />
              <Text style={globalStyles.compactRatingText}>{(item.average_rating ?? 0).toFixed(1)}</Text>
            </View>
            {item.distance_km !== undefined && (
              <View style={globalStyles.compactRating}>
                <Ionicons name="location-outline" size={12} color={colors.black} />
                <Text style={globalStyles.compactRatingText}>{item.distance_km.toFixed(1)} km</Text>
              </View>
            )}
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
            {locationFallback && doctors.length > 0 && (
              <View style={styles.fallbackContainer}>
                <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.fallbackText}>
                  {i18n.t('doctors.no_doctors_location') || 'No doctors found near your location. Showing all doctors instead.'}
                </Text>
              </View>
            )}
          </>
        }
        data={doctors}
        keyExtractor={(item) => item.id}
        renderItem={renderDoctor}
        contentContainerStyle={globalStyles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
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
  fallbackContainer: {
    backgroundColor: colors.authCardBg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: 10,
  },
  fallbackText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
  },
});
