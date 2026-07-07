import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { getRecommendedDoctors } from '../services/doctorService';
import { getDoctorImageUrl } from '../utils/getDoctorImageUrl';
import { colors, spacing } from '../constants/theme';

interface RecommendedDoctorsProps {
  specialties: string[];
}

// Specialty color map for accent styling
const SPECIALTY_COLORS: Record<string, string> = {
  'general medicine': '#4A90D9',
  'cardiology': '#FF6B6B',
  'pulmonology': '#34C759',
  'neurology': '#A855F7',
  'endocrinology': '#F59E0B',
  'gastroenterology': '#10B981',
  'ent': '#06B6D4',
  'dermatology': '#F97316',
  'orthopedics': '#6366F1',
  'ophthalmology': '#0EA5E9',
};

function getSpecialtyColor(specialty: string): string {
  const key = (specialty || '').toLowerCase();
  return SPECIALTY_COLORS[key] || '#4A90D9';
}

export function RecommendedDoctors({ specialties }: RecommendedDoctorsProps) {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (specialties && specialties.length > 0) {
      fetchDoctors();
    }
  }, [specialties.join(',')]);

  const fetchDoctors = async () => {
    setLoading(true);
    const { data, error } = await getRecommendedDoctors(specialties);
    if (!error && data) {
      setDoctors(data);
    }
    setLoading(false);
  };

  // ─── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.headerRow}>
          <View style={styles.titleGroup}>
            <MaterialCommunityIcons name="doctor" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>RECOMMENDED DOCTORS</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Finding specialists for you...</Text>
        </View>
      </View>
    );
  }

  // ─── Empty ─────────────────────────────────────────────────
  if (doctors.length === 0) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.headerRow}>
          <View style={styles.titleGroup}>
            <MaterialCommunityIcons name="doctor" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>RECOMMENDED DOCTORS</Text>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <Feather name="user-x" size={28} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>No specialists found</Text>
          <Text style={styles.emptyText}>
            No {specialties.join(' / ')} specialists are currently available.
          </Text>
          <TouchableOpacity
            style={styles.browseAllButton}
            onPress={() => router.push('/(tabs)/doctors')}
            activeOpacity={0.8}
          >
            <Text style={styles.browseAllText}>Browse All Doctors</Text>
            <Feather name="arrow-right" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const topDoctors = doctors.slice(0, 5);

  return (
    <View style={styles.wrapper}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <MaterialCommunityIcons name="doctor" size={18} color={colors.primary} />
          <Text style={styles.sectionTitle}>RECOMMENDED DOCTORS</Text>
        </View>
        <TouchableOpacity
          style={styles.viewAllBtn}
          onPress={() =>
            router.push({ pathname: '/(tabs)/doctors', params: { specialty: specialties[0] } })
          }
          activeOpacity={0.8}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Feather name="arrow-right" size={13} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        {doctors.length} top-rated specialist{doctors.length !== 1 ? 's' : ''} matched for your symptoms
      </Text>

      {/* Specialty Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.pillRow}
        contentContainerStyle={{ gap: 6 }}
      >
        {specialties.map((sp) => {
          const color = getSpecialtyColor(sp);
          return (
            <View
              key={sp}
              style={[
                styles.specialtyPill,
                { backgroundColor: color + '18', borderColor: color + '40' },
              ]}
            >
              <Text style={[styles.specialtyPillText, { color }]}>{sp}</Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Horizontal Doctor Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={220}
        snapToAlignment="start"
      >
        {topDoctors.map((doc, index) => {
          const firstName = doc.profiles?.first_name ?? '';
          const lastName = doc.profiles?.last_name ?? '';
          const imageUri = getDoctorImageUrl(doc);
          const accentColor = getSpecialtyColor(doc.specialty);
          const rating = doc.average_rating?.toFixed(1) ?? '0.0';
          const reviews = doc.total_reviews ?? 0;

          return (
            <TouchableOpacity
              key={doc.id}
              style={styles.doctorCard}
              onPress={() => router.push(`/doctors/${doc.id}`)}
              activeOpacity={0.92}
            >
              {/* Accent bar */}
              <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />

              {/* Avatar */}
              <View style={styles.avatarWrapper}>
                <Image source={{ uri: imageUri }} style={styles.doctorImage} />
                {doc.is_verified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark" size={10} color="#fff" />
                  </View>
                )}
              </View>

              {/* Name */}
              <Text style={styles.doctorName} numberOfLines={1}>
                Dr. {firstName} {lastName}
              </Text>

              {/* Specialty tag */}
              <View style={[styles.specialtyTag, { backgroundColor: accentColor + '18' }]}>
                <Text style={[styles.specialtyTagText, { color: accentColor }]} numberOfLines={1}>
                  {doc.specialty?.toUpperCase() ?? ''}
                </Text>
              </View>

              {/* Rating */}
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={13} color="#F5A623" />
                <Text style={styles.ratingValue}>{rating}</Text>
                <Text style={styles.reviewCount}>({reviews} reviews)</Text>
              </View>

              {/* Meta */}
              <View style={styles.metaRow}>
                {doc.experience_years > 0 && (
                  <View style={styles.metaItem}>
                    <Feather name="award" size={11} color={colors.textSecondary} />
                    <Text style={styles.metaText}>{doc.experience_years}y exp</Text>
                  </View>
                )}
                {doc.consultation_fee > 0 && (
                  <View style={styles.metaItem}>
                    <Feather name="tag" size={11} color={colors.textSecondary} />
                    <Text style={styles.metaText}>LKR {doc.consultation_fee}</Text>
                  </View>
                )}
              </View>

              {/* Hospital */}
              {doc.hospital_name ? (
                <View style={styles.hospitalRow}>
                  <Feather name="map-pin" size={10} color={colors.textSecondary} />
                  <Text style={styles.hospitalText} numberOfLines={1}>
                    {doc.hospital_name}
                  </Text>
                </View>
              ) : (
                <View style={{ height: 18 }} />
              )}

              {/* Book Now */}
              <TouchableOpacity
                style={[styles.bookButton, { backgroundColor: accentColor }]}
                onPress={() =>
                  router.push({
                    pathname: '/doctors/book',
                    params: { doctorId: doc.id },
                  })
                }
                activeOpacity={0.85}
              >
                <Feather name="calendar" size={14} color="#fff" />
                <Text style={styles.bookButtonText}>Book Now</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}

        {/* See All card */}
        {doctors.length > 5 && (
          <TouchableOpacity
            style={styles.seeAllCard}
            onPress={() =>
              router.push({ pathname: '/(tabs)/doctors', params: { specialty: specialties[0] } })
            }
            activeOpacity={0.85}
          >
            <View style={styles.seeAllIconCircle}>
              <Feather name="users" size={24} color={colors.primary} />
            </View>
            <Text style={styles.seeAllLabel}>See All</Text>
            <Text style={styles.seeAllCount}>{doctors.length - 5} more</Text>
            <Feather name="arrow-right" size={18} color={colors.primary} />
          </TouchableOpacity>
        )}
      </ScrollView>

      <Text style={styles.disclaimer}>
        Matched by AI based on your reported symptoms.
      </Text>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.07)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 1,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors.primary + '15',
    borderRadius: 20,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  pillRow: {
    marginBottom: 12,
  },
  specialtyPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  specialtyPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 4,
    paddingRight: 4,
    gap: 12,
  },
  // Doctor card
  doctorCard: {
    width: 208,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    paddingTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  cardAccent: {
    height: 5,
    marginHorizontal: -16,
    marginBottom: 14,
  },
  avatarWrapper: {
    position: 'relative',
    width: 60,
    height: 60,
    marginBottom: 10,
    alignSelf: 'center',
  },
  doctorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  doctorName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.black,
    textAlign: 'center',
    marginBottom: 6,
  },
  specialtyTag: {
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 8,
  },
  specialtyTagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    marginBottom: 8,
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.black,
  },
  reviewCount: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  hospitalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    marginBottom: 10,
  },
  hospitalText: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    flexShrink: 1,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 4,
  },
  bookButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  // See-all card
  seeAllCard: {
    width: 120,
    backgroundColor: colors.primary + '10',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  seeAllIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary + '18',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seeAllLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  seeAllCount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  disclaimer: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 8,
    fontStyle: 'italic',
  },
  // Loading
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.black,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  browseAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary + '15',
    borderRadius: 20,
  },
  browseAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
});
